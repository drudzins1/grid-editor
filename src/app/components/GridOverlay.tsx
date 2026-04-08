import React from "react";

const COLUMNS = 24;
const CELL_W = 720 / COLUMNS; // 30px
const CELL_H = CELL_W; // square cells
const CELL_INSET = 2; // padding inside each cell

export function GridOverlay({
  highlightCols,
  rows = 32,
  visible = true,
}: {
  highlightCols?: { col: number; row: number; spanX: number; spanY: number } | null;
  rows?: number;
  visible?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-200"
      style={{ zIndex: 1, opacity: visible ? 1 : 0 }}
    >
      {/* Cell grid */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: COLUMNS }).map((_, c) => (
          <div
            key={`${r}-${c}`}
            className="absolute rounded-[3px]"
            style={{
              left: c * CELL_W + CELL_INSET,
              top: r * CELL_H + CELL_INSET,
              width: CELL_W - CELL_INSET * 2,
              height: CELL_H - CELL_INSET * 2,
              border: "1px solid rgba(147, 197, 235, 0.5)",
              background: "rgba(220, 238, 255, 0.15)",
            }}
          />
        ))
      )}

      {/* Highlight snapped area */}
      {highlightCols && (
        <div
          className="absolute transition-all duration-100"
          style={{
            left: highlightCols.col * CELL_W + CELL_INSET,
            top: highlightCols.row * CELL_H + CELL_INSET,
            width: highlightCols.spanX * CELL_W - CELL_INSET * 2,
            height: highlightCols.spanY * CELL_H - CELL_INSET * 2,
            background: "rgba(59, 130, 246, 0.10)",
            border: "2px solid rgba(59, 130, 246, 0.45)",
            borderRadius: 3,
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}