import React, { useState, useRef, useCallback, useEffect } from "react";
import { Toolbar, type BlockType } from "./components/Toolbar";
import { GridOverlay } from "./components/GridOverlay";
import { CanvasBlock, type PlacedBlock } from "./components/CanvasBlock";
import { StylePanel } from "./components/StylePanel";
import { BlockActions } from "./components/BlockActions";
import { EditorHeader } from "./components/EditorHeader";
import { PrepareToSend } from "./components/PrepareToSend";
import { ExportHtmlModal } from "./components/ExportHtmlModal";
import { resolveCollisions } from "./utils/resolveCollisions";
import { LeftPanel, type SavedBlockGroup } from "./components/LeftPanel";
import { SaveBlocksModal } from "./components/SaveBlocksModal";

const CANVAS_W = 720;
const COLS = 24;
const COL_W = CANVAS_W / COLS;
const MIN_GRID_ROWS = 16;
const DEFAULT_GRID_ROWS = 32;

// Default sizes per block type (in grid units)
const defaults: Record<BlockType, { spanX: number; spanY: number }> = {
  image: { spanX: 12, spanY: 8 },
  text: { spanX: 12, spanY: 5 },
  button: { spanX: 12, spanY: 3 },
  spacer: { spanX: 12, spanY: 2 },
  separator: { spanX: 12, spanY: 1 },
  social: { spanX: 12, spanY: 3 },
  video: { spanX: 12, spanY: 8 },
  datatable: { spanX: 12, spanY: 6 },
  event: { spanX: 12, spanY: 6 },
  rsvp: { spanX: 12, spanY: 5 },
  product: { spanX: 12, spanY: 8 },
};

// Some starter blocks so the canvas isn't empty
const initialBlocks: PlacedBlock[] = [
  { id: "1", type: "image", col: 0, row: 0, spanX: 14, spanY: 8 },
  { id: "2", type: "text", col: 15, row: 0, spanX: 9, spanY: 5 },
  { id: "3", type: "button", col: 15, row: 5, spanX: 9, spanY: 3 },
];

type DragMode = null | "toolbar" | "move" | "resize";
type ResizeEdge = "e" | "s" | "se" | "w" | "n" | "nw" | "ne" | "sw";

export interface CanvasSettings {
  bgColor: string;
  padding: number;
  borderColor?: string;
  borderWidth: number;
}

const defaultCanvasSettings: CanvasSettings = {
  bgColor: "#ffffff",
  padding: 0,
  borderColor: undefined,
  borderWidth: 0,
};

const MAX_HISTORY = 50;

export interface SaveEntry {
  id: string;
  timestamp: number;
  description: string;
  blocks: PlacedBlock[];
}

function describeChange(prev: PlacedBlock[], next: PlacedBlock[]): string {
  if (next.length > prev.length) {
    const prevIds = new Set(prev.map((b) => b.id));
    const added = next.find((b) => !prevIds.has(b.id));
    return added ? `Added ${added.type} block` : "Added block";
  }
  if (next.length < prev.length) {
    const nextIds = new Set(next.map((b) => b.id));
    const removed = prev.find((b) => !nextIds.has(b.id));
    return removed ? `Removed ${removed.type} block` : "Removed block";
  }
  for (const nb of next) {
    const ob = prev.find((b) => b.id === nb.id);
    if (!ob) continue;
    if (ob.col !== nb.col || ob.row !== nb.row) return `Moved ${nb.type} block`;
    if (ob.spanX !== nb.spanX || ob.spanY !== nb.spanY) return `Resized ${nb.type} block`;
  }
  const changed = next.find((nb) => {
    const ob = prev.find((b) => b.id === nb.id);
    return ob && JSON.stringify(ob) !== JSON.stringify(nb);
  });
  if (changed) return `Updated ${changed.type} style`;
  return "Updated layout";
}

export default function App() {
  const [blocks, setBlocksRaw] = useState<PlacedBlock[]>(initialBlocks);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [lastSelectedBlock, setLastSelectedBlock] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [canvasSelected, setCanvasSelected] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(defaultCanvasSettings);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [showPrepareToSend, setShowPrepareToSend] = useState(false);
  const [showExportHtml, setShowExportHtml] = useState(false);
  const [savedGroups, setSavedGroups] = useState<SavedBlockGroup[]>([]);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [highlight, setHighlight] = useState<{
    col: number; row: number; spanX: number; spanY: number;
  } | null>(null);

  // ─── Save history ──────────────────────────────────────
  const [saveHistory, setSaveHistory] = useState<SaveEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Undo / Redo history ────────────────────────────────
  const historyRef = useRef<PlacedBlock[][]>([initialBlocks]);
  const historyIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const justFinishedDragRef = useRef(false);

  const pushHistory = useCallback((newBlocks: PlacedBlock[]) => {
    const idx = historyIndexRef.current;
    const prevBlocks = historyRef.current[idx];
    const past = historyRef.current.slice(0, idx + 1);
    past.push(newBlocks);
    if (past.length > MAX_HISTORY) past.shift();
    historyRef.current = past;
    historyIndexRef.current = past.length - 1;

    const desc = describeChange(prevBlocks, newBlocks);
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveHistory((prev) => {
        const entry: SaveEntry = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          description: desc,
          blocks: newBlocks,
        };
        return [entry, ...prev].slice(0, 5);
      });
      setSaveStatus("saved");
    }, 400);
  }, []);

  const setBlocks: typeof setBlocksRaw = useCallback(
    (action) => {
      setBlocksRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (!isDraggingRef.current) {
          pushHistory(next);
        }
        return next;
      });
    },
    [pushHistory]
  );

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const [, forceRender] = useState(0);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setBlocksRaw(historyRef.current[historyIndexRef.current]);
      forceRender((n) => n + 1);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      setBlocksRaw(historyRef.current[historyIndexRef.current]);
      forceRender((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Drag state
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [toolbarDragType, setToolbarDragType] = useState<BlockType | null>(null);

  // ─── Canvas vertical resize ─────────────────────────────
  const [gridRows, setGridRows] = useState(DEFAULT_GRID_ROWS);
  const canvasResizeRef = useRef<{ startY: number; startRows: number } | null>(null);

  const handleCanvasResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    canvasResizeRef.current = { startY: e.clientY, startRows: gridRows };

    const onMove = (ev: MouseEvent) => {
      if (!canvasResizeRef.current) return;
      const dy = ev.clientY - canvasResizeRef.current.startY;
      const dRows = Math.round(dy / COL_W);
      const minFromBlocks = blocks.reduce((max, b) => Math.max(max, b.row + b.spanY), 0);
      const newRows = Math.max(MIN_GRID_ROWS, Math.max(minFromBlocks, canvasResizeRef.current.startRows + dRows));
      setGridRows(newRows);
    };

    const onUp = () => {
      canvasResizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [gridRows, blocks]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: DragMode;
    blockId?: string;
    edge?: ResizeEdge;
    startX: number;
    startY: number;
    origBlock?: PlacedBlock;
  } | null>(null);

  // ─── Toolbar drag (HTML5 native) ────────────────────────
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!canvasRef.current || !toolbarDragType) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = defaults[toolbarDragType];
      const col = clamp(Math.round(x / COL_W - size.spanX / 2), 0, COLS - size.spanX);
      const row = Math.max(0, Math.round(y / COL_W - size.spanY / 2));
      setHighlight({ col, row, ...size });
    },
    [toolbarDragType]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!highlight || !toolbarDragType) return;
      const newId = Date.now().toString();
      setBlocks((prev) => {
        const next = [...prev, { id: newId, type: toolbarDragType, ...highlight }];
        return resolveCollisions(next, newId);
      });
      setHighlight(null);
      setToolbarDragType(null);
    },
    [highlight, toolbarDragType]
  );

  // ─── Move & Resize (pointer-based) ─────────────────────
  const handleMoveStart = useCallback(
    (id: string, e: React.MouseEvent) => {
      const block = blocks.find((b) => b.id === id);
      if (!block || !canvasRef.current) return;
      isDraggingRef.current = true;
      setDragMode("move");
      if (!selectedBlocks.has(id)) {
        setSelectedBlocks(new Set([id]));
        setLastSelectedBlock(id);
      }
      dragRef.current = {
        mode: "move",
        blockId: id,
        startX: e.clientX,
        startY: e.clientY,
        origBlock: { ...block },
      };
    },
    [blocks]
  );

  const handleResizeStart = useCallback(
    (id: string, edge: ResizeEdge, e: React.MouseEvent) => {
      const block = blocks.find((b) => b.id === id);
      if (!block) return;
      isDraggingRef.current = true;
      setDragMode("resize");
      dragRef.current = {
        mode: "resize",
        blockId: id,
        edge,
        startX: e.clientX,
        startY: e.clientY,
        origBlock: { ...block },
      };
    },
    [blocks]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d || !d.origBlock) return;

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const dCols = Math.round(dx / COL_W);
      const dRows = Math.round(dy / COL_W);
      const ob = d.origBlock;

      if (d.mode === "move") {
        const newCol = clamp(ob.col + dCols, 0, COLS - ob.spanX);
        const newRow = Math.max(0, ob.row + dRows);
        setHighlight({ col: newCol, row: newRow, spanX: ob.spanX, spanY: ob.spanY });
        setBlocks((prev) => {
          const next = prev.map((b) => (b.id === d.blockId ? { ...b, col: newCol, row: newRow } : b));
          return resolveCollisions(next, d.blockId!);
        });
      }

      if (d.mode === "resize" && d.edge) {
        let { col, row, spanX, spanY } = ob;
        const edge = d.edge;

        if (edge.includes("e")) {
          spanX = Math.max(1, Math.min(COLS - col, ob.spanX + dCols));
        }
        if (edge.includes("w")) {
          const shift = clamp(dCols, -col, ob.spanX - 1);
          col = ob.col + shift;
          spanX = ob.spanX - shift;
        }
        if (edge.includes("s")) {
          spanY = Math.max(1, ob.spanY + dRows);
        }
        if (edge.includes("n")) {
          const shift = clamp(dRows, -row, ob.spanY - 1);
          row = ob.row + shift;
          spanY = ob.spanY - shift;
        }

        setHighlight({ col, row, spanX, spanY });
        setBlocks((prev) => {
          const next = prev.map((b) => (b.id === d.blockId ? { ...b, col, row, spanX, spanY } : b));
          return resolveCollisions(next, d.blockId!);
        });
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        isDraggingRef.current = false;
        justFinishedDragRef.current = true;
        requestAnimationFrame(() => { justFinishedDragRef.current = false; });
        setBlocksRaw((current) => {
          pushHistory(current);
          return current;
        });
        dragRef.current = null;
        setDragMode(null);
        setHighlight(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Deselect on canvas click (skip if a drag/resize just ended)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (justFinishedDragRef.current) return;
    if (e.target === e.currentTarget) {
      setSelectedBlocks(new Set());
      setLastSelectedBlock(null);
      setEditingBlock(null);
      setCanvasSelected(true);
    }
  }, []);

  // Handle block selection — shift+click adds to selection
  const handleSelectBlock = useCallback((id: string, shiftKey?: boolean) => {
    if (shiftKey) {
      setSelectedBlocks((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      setSelectedBlocks(new Set([id]));
    }
    setLastSelectedBlock(id);
    setCanvasSelected(false);
    if (editingBlock && editingBlock !== id) {
      setEditingBlock(null);
    }
  }, [editingBlock]);

  const handleUpdateBlock = useCallback(
    (id: string, updates: Partial<PlacedBlock>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
    },
    []
  );

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlocks((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setEditingBlock(null);
  }, []);

  const handleDuplicateBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const block = prev.find((b) => b.id === id);
      if (!block) return prev;
      const newBlock = { ...block, id: Date.now().toString(), row: block.row + block.spanY };
      return [...prev, newBlock];
    });
  }, []);

  const handleMoveBlockUp = useCallback((id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, row: Math.max(0, b.row - 1) } : b))
    );
  }, []);

  const handleMoveBlockDown = useCallback((id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, row: b.row + 1 } : b))
    );
  }, []);

  const handleRevertToSave = useCallback((entry: SaveEntry) => {
    setBlocksRaw(entry.blocks);
    pushHistory(entry.blocks);
    setSelectedBlocks(new Set());
    setLastSelectedBlock(null);
    setEditingBlock(null);
    forceRender((n) => n + 1);
  }, [pushHistory]);

  const BUFFER_ROWS = 5;
  const contentRows = blocks.reduce((max, b) => Math.max(max, b.row + b.spanY), 0);
  const autoRows = Math.max(MIN_GRID_ROWS, contentRows + BUFFER_ROWS);
  const effectiveGridRows = Math.max(gridRows, autoRows);

  // Ratchet gridRows up so the canvas never auto-shrinks
  useEffect(() => {
    if (autoRows > gridRows) {
      setGridRows(autoRows);
    }
  }, [autoRows, gridRows]);

  const canvasHeight = effectiveGridRows * COL_W;
  const showGrid = dragMode === "move" || dragMode === "resize" || toolbarDragType !== null;

  const selectedBlockData = lastSelectedBlock && selectedBlocks.has(lastSelectedBlock)
    ? blocks.find((b) => b.id === lastSelectedBlock) ?? null
    : null;
  const hasSelection = selectedBlocks.size > 0;

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] flex flex-col items-center overflow-auto select-none"
      onClick={(e) => {
        // Click on outer background deselects everything (skip if drag just ended)
        if (e.target === e.currentTarget && !justFinishedDragRef.current) {
          setSelectedBlocks(new Set());
          setLastSelectedBlock(null);
          setCanvasSelected(false);
          setEditingBlock(null);
        }
      }}
    >
      {/* Top header bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[60px]">
        <EditorHeader
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onPrepareToSend={() => setShowPrepareToSend(true)}
          onExportHtml={() => setShowExportHtml(true)}
          saveHistory={saveHistory}
          saveStatus={saveStatus}
          onRevert={handleRevertToSave}
        />
      </div>

      {/* Toolbar at top */}
      <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-50">
        <Toolbar
          onDragStart={(type) => setToolbarDragType(type)}
          onDragEnd={() => {
            setToolbarDragType(null);
            setHighlight(null);
          }}
          onExpandChange={setToolbarExpanded}
        />
      </div>

      {/* Canvas */}
      <div
        className="flex justify-center transition-[padding] duration-200"
        style={{ paddingTop: toolbarExpanded ? 180 : 140 }}
      >
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-300 mb-3 text-center">
            Email Canvas — 720px
          </div>

          <div
            ref={canvasRef}
            className={`relative shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] ${canvasSelected && !hasSelection ? "ring-2 ring-blue-400" : ""}`}
            style={{
              width: CANVAS_W,
              minHeight: canvasHeight,
              backgroundColor: canvasSettings.bgColor,
              padding: canvasSettings.padding,
              borderColor: canvasSettings.borderColor ?? "transparent",
              borderWidth: canvasSettings.borderWidth,
              borderStyle: canvasSettings.borderWidth > 0 ? "solid" : "none",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleCanvasClick}
          >
            <GridOverlay highlightCols={highlight} rows={effectiveGridRows} visible={showGrid} />

            {blocks.map((b) => (
              <CanvasBlock
                key={b.id}
                block={b}
                selected={selectedBlocks.has(b.id)}
                onSelect={handleSelectBlock}
                onMoveStart={handleMoveStart}
                onResizeStart={handleResizeStart}
                onUpdateBlock={handleUpdateBlock}
                editing={editingBlock === b.id}
                onEditStart={(id) => setEditingBlock(id)}
                onEditEnd={() => setEditingBlock(null)}
              />
            ))}

            {/* Floating block actions above/below selected block */}
            {selectedBlockData && !dragMode && (() => {
              const blockRight = (selectedBlockData.col + selectedBlockData.spanX) * COL_W;
              const blockTop = selectedBlockData.row * COL_W;
              const blockBottom = (selectedBlockData.row + selectedBlockData.spanY) * COL_W;
              const aboveBlock = selectedBlockData.row > 0;
              return (
                <div
                  className="absolute z-40"
                  style={{
                    left: blockRight,
                    top: aboveBlock ? blockTop - 8 : blockBottom + 8,
                    transform: aboveBlock ? "translate(-100%, -100%)" : "translateX(-100%)",
                  }}
                >
                  <BlockActions
                    onDuplicate={() => handleDuplicateBlock(selectedBlockData.id)}
                    onDelete={() => handleDeleteBlock(selectedBlockData.id)}
                    onSave={() => setShowSaveModal(true)}
                  />
                </div>
              );
            })()}
          </div>

          {/* Bottom resize handle */}
          <div
            onMouseDown={handleCanvasResizeStart}
            className="group relative mx-auto cursor-ns-resize flex items-center justify-center"
            style={{ width: CANVAS_W, height: 20 }}
          >
            <div className="w-16 h-1 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
          </div>

          {/* Hint */}
          <div className="text-[10px] text-gray-300 text-center mt-3 tracking-wide">
            Drag from toolbar to add · Click to select · Drag to move · Handles to resize · Delete to remove
          </div>
        </div>
      </div>

      {/* Prepare to Send overlay */}
      {showPrepareToSend && (
        <PrepareToSend onClose={() => setShowPrepareToSend(false)} />
      )}

      {/* Export HTML modal */}
      {showExportHtml && (
        <ExportHtmlModal
          blocks={blocks}
          canvasSettings={canvasSettings}
          onClose={() => setShowExportHtml(false)}
        />
      )}

      {/* Save blocks modal */}
      {showSaveModal && (
        <SaveBlocksModal
          blockCount={selectedBlocks.size}
          onClose={() => setShowSaveModal(false)}
          onSave={(name) => {
            const selectedArr = blocks.filter((b) => selectedBlocks.has(b.id));
            if (selectedArr.length === 0) return;
            const minCol = Math.min(...selectedArr.map((b) => b.col));
            const minRow = Math.min(...selectedArr.map((b) => b.row));
            const normalized = selectedArr.map((b) => ({
              ...b,
              col: b.col - minCol,
              row: b.row - minRow,
            }));
            setSavedGroups((prev) => [
              { id: Date.now().toString(), name, blocks: normalized, createdAt: Date.now() },
              ...prev,
            ]);
            setShowSaveModal(false);
          }}
        />
      )}

      {/* Left Panel — Saved Content & Templates */}
      <LeftPanel
        savedGroups={savedGroups}
        onDeleteGroup={(id) => setSavedGroups((prev) => prev.filter((g) => g.id !== id))}
      />

      {/* Style Panel — block or canvas */}
      {selectedBlockData && !showPrepareToSend && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
          <StylePanel
            block={selectedBlockData}
            onUpdate={handleUpdateBlock}
          />
        </div>
      )}
      {canvasSelected && !selectedBlockData && !showPrepareToSend && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
          <StylePanel
            canvasSettings={canvasSettings}
            onUpdateCanvas={setCanvasSettings}
          />
        </div>
      )}
    </div>
  );
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}