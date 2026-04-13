import React, { useState, useRef, useEffect } from "react";
import { Save, LayoutTemplate, Trash2 } from "lucide-react";
import type { PlacedBlock } from "./CanvasBlock";

export interface SavedBlockGroup {
  id: string;
  name: string;
  blocks: PlacedBlock[];
  createdAt: number;
}

interface LeftPanelProps {
  savedGroups: SavedBlockGroup[];
  onDeleteGroup?: (id: string) => void;
  onDragGroupStart?: (group: SavedBlockGroup) => void;
  onDragGroupEnd?: () => void;
}

type ActiveTab = null | "saved" | "templates";

const MOCK_TEMPLATES = [
  { id: "t1", name: "Hero + CTA", description: "Full-width image with headline and button" },
  { id: "t2", name: "Two Column", description: "Image left, text right layout" },
  { id: "t3", name: "Newsletter", description: "Header, body text, and footer" },
  { id: "t4", name: "Product Feature", description: "Product image with description and price" },
];

export function LeftPanel({ savedGroups, onDeleteGroup, onDragGroupStart, onDragGroupEnd }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleTab = (tab: "saved" | "templates") => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  useEffect(() => {
    if (!activeTab) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActiveTab(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeTab]);

  return (
    <div
      ref={panelRef}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Pill */}
      <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Saved Content icon */}
        <div className="relative">
          <button
            onClick={() => toggleTab("saved")}
            onMouseEnter={() => setHoveredIcon("saved")}
            onMouseLeave={() => setHoveredIcon(null)}
            className={`p-3 transition-colors cursor-pointer ${
              activeTab === "saved"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Save size={18} strokeWidth={1.8} />
          </button>
          {hoveredIcon === "saved" && !activeTab && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-gray-900 text-white text-[11px] rounded-md whitespace-nowrap pointer-events-none z-10">
              Saved Content
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* Templates icon */}
        <div className="relative">
          <button
            onClick={() => toggleTab("templates")}
            onMouseEnter={() => setHoveredIcon("templates")}
            onMouseLeave={() => setHoveredIcon(null)}
            className={`p-3 transition-colors cursor-pointer ${
              activeTab === "templates"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutTemplate size={18} strokeWidth={1.8} />
          </button>
          {hoveredIcon === "templates" && !activeTab && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-gray-900 text-white text-[11px] rounded-md whitespace-nowrap pointer-events-none z-10">
              Templates
            </div>
          )}
        </div>
      </div>

      {/* Expandable panel — positioned relative to the outer fixed container */}
      {activeTab && (
        <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 w-[280px] max-h-[70vh] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-[fadeIn_150ms_ease-out]">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-[13px] text-gray-800 font-medium">
              {activeTab === "saved" ? "Saved Content" : "Templates"}
            </h3>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "saved" ? (
              <SavedContentList groups={savedGroups} onDelete={onDeleteGroup} onDragStart={onDragGroupStart} onDragEnd={onDragGroupEnd} />
            ) : (
              <TemplatesList />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function SavedContentList({
  groups,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  groups: SavedBlockGroup[];
  onDelete?: (id: string) => void;
  onDragStart?: (group: SavedBlockGroup) => void;
  onDragEnd?: () => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="py-8 px-2 text-center">
        <Save size={24} strokeWidth={1.5} className="mx-auto text-gray-300 mb-2" />
        <p className="text-[12px] text-gray-400 leading-relaxed">
          No saved content yet
        </p>
        <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
          Select multiple blocks and click the save icon to create reusable content
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <div
          key={group.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "copy";
            onDragStart?.(group);
          }}
          onDragEnd={() => onDragEnd?.()}
          className="group bg-gray-50 border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-gray-700 font-medium truncate">{group.name}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {group.blocks.length} block{group.blocks.length !== 1 ? "s" : ""}
              </div>
            </div>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(group.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash2 size={12} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Mini thumbnail preview */}
          <div className="mt-2 bg-white border border-gray-100 rounded-md h-[60px] relative overflow-hidden">
            {group.blocks.map((block) => {
              const minCol = Math.min(...group.blocks.map((b) => b.col));
              const minRow = Math.min(...group.blocks.map((b) => b.row));
              const maxCol = Math.max(...group.blocks.map((b) => b.col + b.spanX));
              const maxRow = Math.max(...group.blocks.map((b) => b.row + b.spanY));
              const groupW = maxCol - minCol;
              const groupH = maxRow - minRow;
              const scale = Math.min(252 / (groupW * 30), 56 / (groupH * 30));

              return (
                <div
                  key={block.id}
                  className="absolute rounded-[2px]"
                  style={{
                    left: `${((block.col - minCol) / groupW) * 100}%`,
                    top: `${((block.row - minRow) / groupH) * 100}%`,
                    width: `${(block.spanX / groupW) * 100}%`,
                    height: `${(block.spanY / groupH) * 100}%`,
                    backgroundColor:
                      block.type === "image" ? "#e2e8f0" :
                      block.type === "text" ? "#f0fdf4" :
                      block.type === "button" ? "#dbeafe" :
                      "#f5f5f5",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TemplatesList() {
  return (
    <div className="flex flex-col gap-2">
      {MOCK_TEMPLATES.map((t) => (
        <div
          key={t.id}
          className="bg-gray-50 border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors cursor-pointer"
        >
          <div className="text-[13px] text-gray-700 font-medium">{t.name}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{t.description}</div>
          <div className="mt-2 bg-white border border-gray-100 rounded-md h-[48px] flex items-center justify-center">
            <LayoutTemplate size={16} strokeWidth={1.5} className="text-gray-300" />
          </div>
        </div>
      ))}
      <p className="text-[10px] text-gray-300 text-center mt-2">
        More templates coming soon
      </p>
    </div>
  );
}
