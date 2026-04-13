import React, { useCallback, useRef, useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ImagePlus, Replace, Upload } from "lucide-react";
import type { BlockType } from "./Toolbar";

export interface PlacedBlock {
  id: string;
  type: BlockType;
  col: number;
  row: number;
  spanX: number;
  spanY: number;
  imageUrl?: string;
  textHeading?: string;
  textBody?: string;
  buttonLabel?: string;
  // Style properties
  textColor?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  lineHeight?: number;
  letterSpacing?: number;
  bgColor?: string;
  // Border properties
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted";
  // Padding properties
  paddingAll?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  // Margin properties
  marginAll?: boolean;
  marginValue?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  btnColor?: string;
  btnTextColor?: string;
  btnRadius?: number;
  btnSize?: number;
  btnAlign?: "left" | "center" | "right";
  imgRadius?: number;
  imgFit?: number;
  imgOpacity?: number;
  // Separator properties
  sepColor?: string;
  sepThickness?: number;
  sepStyle?: "solid" | "dashed" | "dotted";
  sepMargin?: number;
  // Social properties
  socialPlatforms?: string[];
  socialColor?: string;
  socialSize?: number;
  socialAlign?: "left" | "center" | "right";
  socialStyle?: "filled" | "outline" | "minimal";
  // Image additional properties
  imgAltText?: string;
  imgLinkUrl?: string;
  // Video properties
  videoUrl?: string;
  videoAlign?: "left" | "center" | "right";
  videoRadiusAll?: boolean;
  videoRadius?: number;
  videoRadiusTL?: number;
  videoRadiusTR?: number;
  videoRadiusBL?: number;
  videoRadiusBR?: number;
  videoAltText?: string;
  // Data Table properties
  tableBgColor?: string;
  tableAlternatingColors?: boolean;
  tablePadding?: number;
  tableBorderMode?: "none" | "horizontal" | "all";
  tableBorderStyle?: "solid" | "dashed" | "dotted";
  tableBorderWidth?: number;
  tableBorderColor?: string;
  tableHeaderRow?: boolean;
  tableHeaderColumn?: boolean;
  tableRows?: number;
  tableCols?: number;
  tableCellData?: Record<string, string>;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1758560936904-4eb0049284aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NTU4NzY2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const COLS = 24;
const COL_W = 720 / COLS;
const CELL_INSET = 2;

type ResizeEdge = "e" | "s" | "se" | "w" | "n" | "nw" | "ne" | "sw";

interface CanvasBlockProps {
  block: PlacedBlock;
  selected: boolean;
  onSelect: (id: string, shiftKey?: boolean) => void;
  onMoveStart: (id: string, e: React.MouseEvent) => void;
  onResizeStart: (id: string, edge: ResizeEdge, e: React.MouseEvent) => void;
  onUpdateBlock?: (id: string, updates: Partial<PlacedBlock>) => void;
  editing?: boolean;
  onEditStart?: (id: string) => void;
  onEditEnd?: () => void;
}

export function CanvasBlock({
  block,
  selected,
  onSelect,
  onMoveStart,
  onResizeStart,
  onUpdateBlock,
  editing = false,
  onEditStart,
  onEditEnd,
}: CanvasBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pendingTextRef = useRef<string | null>(null);

  // Commit any pending text edits when editing ends (covers unmount, deselect, etc.)
  useEffect(() => {
    if (!editing && pendingTextRef.current !== null) {
      onUpdateBlock?.(block.id, { textBody: pendingTextRef.current });
      pendingTextRef.current = null;
    }
  }, [editing, block.id, onUpdateBlock]);

  const style: React.CSSProperties = {
    position: "absolute",
    left: block.col * COL_W + CELL_INSET,
    top: block.row * COL_W + CELL_INSET,
    width: block.spanX * COL_W - CELL_INSET * 2,
    height: block.spanY * COL_W - CELL_INSET * 2,
    zIndex: selected ? 15 : 5,
    borderRadius: 3,
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (editing && (block.type === "text" || block.type === "button" || block.type === "datatable")) {
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
      onSelect(block.id, e.shiftKey);
      if (!e.shiftKey) {
        onMoveStart(block.id, e);
      }
    },
    [block.id, onSelect, onMoveStart, editing, block.type]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((block.type === "text" || block.type === "button" || block.type === "datatable") && selected && onEditStart) {
        e.stopPropagation();
        onEditStart(block.id);
      }
    },
    [block.id, block.type, selected, onEditStart]
  );

  const handleResizeMouseDown = useCallback(
    (edge: ResizeEdge) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onResizeStart(block.id, edge, e);
    },
    [block.id, onResizeStart]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUpdateBlock) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onUpdateBlock(block.id, { imageUrl: dataUrl });
      };
      reader.readAsDataURL(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [block.id, onUpdateBlock]
  );

  const handleUploadClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      fileInputRef.current?.click();
    },
    []
  );

  const handleRemoveImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onUpdateBlock?.(block.id, { imageUrl: undefined });
    },
    [block.id, onUpdateBlock]
  );

  const resizeHandles = selected ? (
    <>
      {/* Full-length edge resize zones */}
      <div
        onMouseDown={handleResizeMouseDown("n")}
        className="absolute top-[-4px] left-2 right-2 h-[8px] cursor-n-resize z-20"
      />
      <div
        onMouseDown={handleResizeMouseDown("s")}
        className="absolute bottom-[-4px] left-2 right-2 h-[8px] cursor-s-resize z-20"
      />
      <div
        onMouseDown={handleResizeMouseDown("e")}
        className="absolute right-[-4px] top-2 bottom-2 w-[8px] cursor-e-resize z-20"
      />
      <div
        onMouseDown={handleResizeMouseDown("w")}
        className="absolute left-[-4px] top-2 bottom-2 w-[8px] cursor-w-resize z-20"
      />
      {/* Corner resize zones (overlap edges, higher z) */}
      {(["nw", "ne", "se", "sw"] as ResizeEdge[]).map((edge) => (
        <div
          key={edge}
          onMouseDown={handleResizeMouseDown(edge)}
          className="absolute w-3 h-3 z-30"
          style={{
            cursor:
              edge === "nw" || edge === "se"
                ? "nwse-resize"
                : "nesw-resize",
            top: edge.includes("n") ? -6 : undefined,
            bottom: edge.includes("s") ? -6 : undefined,
            left: edge.includes("w") ? -6 : undefined,
            right: edge.includes("e") ? -6 : undefined,
          }}
        >
          <div className="absolute inset-0.5 bg-white border-2 border-blue-500 rounded-sm" />
        </div>
      ))}
    </>
  ) : null;

  const outline = selected
    ? "ring-2 ring-blue-500 ring-offset-1"
    : "hover:ring-1 hover:ring-blue-300 hover:ring-offset-1";

  const content = (() => {
    if (block.type === "image") {
      const hasImage = block.imageUrl || DEFAULT_IMAGE;
      const hasCustomImage = !!block.imageUrl;

      return (
        <>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Image */}
          <ImageWithFallback
            src={hasImage}
            alt={block.imgAltText || "Placed image"}
            className="w-full h-full rounded-[3px]"
            style={{
              objectFit: (["cover", "contain", "fill"] as const)[block.imgFit ?? 0],
              opacity: (block.imgOpacity ?? 100) / 100,
              borderRadius: block.imgRadius ?? 0,
            }}
            draggable={false}
          />

          {/* Selected overlay with image actions */}
          {selected && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 rounded-[3px] transition-opacity">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleUploadClick}
                className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-gray-700 text-[11px] px-3 py-1.5 rounded-md shadow-sm cursor-pointer transition-colors backdrop-blur-sm"
              >
                {hasCustomImage ? (
                  <>
                    <Replace size={13} />
                    Replace
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    Upload Image
                  </>
                )}
              </button>
              {hasCustomImage && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-gray-500 text-[11px] px-3 py-1.5 rounded-md shadow-sm cursor-pointer transition-colors backdrop-blur-sm"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Unselected hover hint */}
          {!selected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-colors rounded-[3px]">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white/90 text-gray-500 text-[10px] px-2.5 py-1 rounded-md shadow-sm">
                <ImagePlus size={12} />
                Click to edit
              </div>
            </div>
          )}
        </>
      );
    }

    if (block.type === "text") {
      const body = block.textBody ?? "Your content goes here. Edit this text to customize your email message.";

      const isEditing = editing && selected;
      const vAlign = block.verticalAlign ?? "top";
      const justifyMap = { top: "flex-start", middle: "center", bottom: "flex-end" };

      const textStyles: React.CSSProperties = {
        color: block.textColor ?? "#374151",
        fontSize: block.fontSize ?? 13,
        fontWeight: block.fontWeight ?? "normal",
        fontStyle: block.fontStyle ?? "normal",
        textDecoration: block.textDecoration ?? "none",
        textTransform: (block.textTransform ?? "none") as React.CSSProperties["textTransform"],
        lineHeight: block.lineHeight ? `${block.lineHeight}%` : undefined,
        letterSpacing: block.letterSpacing != null ? `${block.letterSpacing}em` : undefined,
      };

      return (
        <div className="p-3 h-full flex flex-col" style={{ backgroundColor: block.bgColor, textAlign: block.textAlign ?? "left", fontFamily: block.fontFamily ?? "Inter, sans-serif", justifyContent: justifyMap[vAlign] }}>
          {isEditing ? (
            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              className="leading-relaxed outline-none cursor-text"
              style={textStyles}
              onInput={(e) => {
                pendingTextRef.current = e.currentTarget.textContent || "";
              }}
              onBlur={(e) => {
                const text = e.currentTarget.textContent || "";
                pendingTextRef.current = null;
                onUpdateBlock?.(block.id, { textBody: text });
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  const text = e.currentTarget.textContent || "";
                  pendingTextRef.current = null;
                  onUpdateBlock?.(block.id, { textBody: text });
                  onEditEnd?.();
                }
                e.stopPropagation();
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {body}
            </div>
          ) : (
            <>
              <div className="leading-relaxed" style={textStyles}>{body}</div>
            </>
          )}
        </div>
      );
    }

    if (block.type === "button") {
      const label = block.buttonLabel ?? "Learn More";
      const isEditing = editing && selected;
      const btnColor = block.btnColor ?? "#2563eb";
      const btnTextColor = block.btnTextColor ?? "#ffffff";
      const btnRadius = block.btnRadius ?? 4;
      const btnPadding = (["px-3 py-1.5 text-[11px]", "px-5 py-2 text-[12px]", "px-7 py-2.5 text-[13px]", "w-full py-2.5 text-[13px]"] as const)[block.btnSize ?? 1];
      const btnAlign = block.btnAlign ?? "center";
      const justifyClass = btnAlign === "left" ? "justify-start" : btnAlign === "right" ? "justify-end" : "justify-center";

      return (
        <div className={`flex items-center ${justifyClass} w-full h-full px-2`}>
          {isEditing ? (
            <div
              contentEditable
              suppressContentEditableWarning
              className={`outline-none cursor-text min-w-[40px] text-center ${btnPadding}`}
              style={{ letterSpacing: "0.04em", backgroundColor: btnColor, color: btnTextColor, borderRadius: btnRadius }}
              onBlur={(e) => {
                onUpdateBlock?.(block.id, { buttonLabel: e.currentTarget.textContent || "" });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEditEnd?.();
                }
                if (e.key === "Escape") {
                  onEditEnd?.();
                }
                e.stopPropagation();
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {label}
            </div>
          ) : (
            <>
              <div
                className={btnPadding}
                style={{ letterSpacing: "0.04em", backgroundColor: btnColor, color: btnTextColor, borderRadius: btnRadius }}
              >
                {label}
              </div>
            </>
          )}
        </div>
      );
    }

    if (block.type === "separator") {
      const color = block.sepColor ?? "#e5e7eb";
      const thickness = block.sepThickness ?? 1;
      const lineStyle = block.sepStyle ?? "solid";
      const margin = block.sepMargin ?? 8;

      return (
        <div className="w-full h-full flex items-center" style={{ padding: `0 ${margin}px` }}>
          <div
            className="w-full"
            style={{
              borderTopWidth: thickness,
              borderTopStyle: lineStyle,
              borderTopColor: color,
            }}
          />
        </div>
      );
    }

    if (block.type === "social") {
      const platforms = block.socialPlatforms ?? ["facebook", "instagram", "x"];
      const color = block.socialColor ?? "#1e293b";
      const size = block.socialSize ?? 24;
      const align = block.socialAlign ?? "center";
      const iconStyle = block.socialStyle ?? "filled";
      const justifyClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

      const socialIcons: Record<string, (props: { size: number; color: string; style: string }) => React.ReactNode> = {
        facebook: ({ size, color, style }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {style === "filled" ? (
              <><rect width="24" height="24" rx="4" fill={color}/><path d="M16.5 12.5h-2.5v7h-3v-7h-2v-2.5h2v-1.5c0-2.21 1.29-3.5 3.5-3.5h2v2.5h-1.5c-.55 0-1 .45-1 1v1.5h2.5l-.5 2.5z" fill="white"/></>
            ) : style === "outline" ? (
              <><rect x="1" y="1" width="22" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none"/><path d="M16.5 12.5h-2.5v7h-3v-7h-2v-2.5h2v-1.5c0-2.21 1.29-3.5 3.5-3.5h2v2.5h-1.5c-.55 0-1 .45-1 1v1.5h2.5l-.5 2.5z" fill={color}/></>
            ) : (
              <path d="M16.5 12.5h-2.5v7h-3v-7h-2v-2.5h2v-1.5c0-2.21 1.29-3.5 3.5-3.5h2v2.5h-1.5c-.55 0-1 .45-1 1v1.5h2.5l-.5 2.5z" fill={color}/>
            )}
          </svg>
        ),
        instagram: ({ size, color, style }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {style === "filled" ? (
              <><rect width="24" height="24" rx="4" fill={color}/><rect x="6" y="6" width="12" height="12" rx="3" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="16.5" cy="7.5" r="1" fill="white"/></>
            ) : style === "outline" ? (
              <><rect x="1" y="1" width="22" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none"/><rect x="6" y="6" width="12" height="12" rx="3" stroke={color} strokeWidth="1.5" fill="none"/><circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" fill="none"/><circle cx="16.5" cy="7.5" r="1" fill={color}/></>
            ) : (
              <><rect x="6" y="6" width="12" height="12" rx="3" stroke={color} strokeWidth="1.5" fill="none"/><circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" fill="none"/><circle cx="16.5" cy="7.5" r="1" fill={color}/></>
            )}
          </svg>
        ),
        x: ({ size, color, style }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {style === "filled" ? (
              <><rect width="24" height="24" rx="4" fill={color}/><path d="M16.3 7h1.5l-3.7 4.3L18.4 17h-3.2l-2.6-3.4L9.7 17H8.2l4-4.6L7.8 7h3.3l2.3 3.1L16.3 7zm-.5 9h.8L10.3 8h-.9l5.4 8z" fill="white"/></>
            ) : style === "outline" ? (
              <><rect x="1" y="1" width="22" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none"/><path d="M16.3 7h1.5l-3.7 4.3L18.4 17h-3.2l-2.6-3.4L9.7 17H8.2l4-4.6L7.8 7h3.3l2.3 3.1L16.3 7zm-.5 9h.8L10.3 8h-.9l5.4 8z" fill={color}/></>
            ) : (
              <path d="M16.3 7h1.5l-3.7 4.3L18.4 17h-3.2l-2.6-3.4L9.7 17H8.2l4-4.6L7.8 7h3.3l2.3 3.1L16.3 7zm-.5 9h.8L10.3 8h-.9l5.4 8z" fill={color}/>
            )}
          </svg>
        ),
        linkedin: ({ size, color, style }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {style === "filled" ? (
              <><rect width="24" height="24" rx="4" fill={color}/><path d="M8.5 10v7h-2v-7h2zm-1-3.5a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3zm3.5 3.5h2v1c.4-.7 1.2-1.2 2.2-1.2 2.2 0 2.8 1.4 2.8 3.3v3.9h-2v-3.5c0-.8-.02-1.9-1.2-1.9-1.2 0-1.3.9-1.3 1.8v3.6h-2.5V10z" fill="white"/></>
            ) : style === "outline" ? (
              <><rect x="1" y="1" width="22" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none"/><path d="M8.5 10v7h-2v-7h2zm-1-3.5a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3zm3.5 3.5h2v1c.4-.7 1.2-1.2 2.2-1.2 2.2 0 2.8 1.4 2.8 3.3v3.9h-2v-3.5c0-.8-.02-1.9-1.2-1.9-1.2 0-1.3.9-1.3 1.8v3.6h-2.5V10z" fill={color}/></>
            ) : (
              <path d="M8.5 10v7h-2v-7h2zm-1-3.5a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3zm3.5 3.5h2v1c.4-.7 1.2-1.2 2.2-1.2 2.2 0 2.8 1.4 2.8 3.3v3.9h-2v-3.5c0-.8-.02-1.9-1.2-1.9-1.2 0-1.3.9-1.3 1.8v3.6h-2.5V10z" fill={color}/>
            )}
          </svg>
        ),
        youtube: ({ size, color, style }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {style === "filled" ? (
              <><rect width="24" height="24" rx="4" fill={color}/><path d="M19.6 8.3a2 2 0 00-1.4-1.4C16.8 6.5 12 6.5 12 6.5s-4.8 0-6.2.4a2 2 0 00-1.4 1.4C4 9.7 4 12 4 12s0 2.3.4 3.7a2 2 0 001.4 1.4c1.4.4 6.2.4 6.2.4s4.8 0 6.2-.4a2 2 0 001.4-1.4c.4-1.4.4-3.7.4-3.7s0-2.3-.4-3.7z" fill="white" opacity="0"/><path d="M10 15l4.5-3L10 9v6z" fill="white"/><path d="M19.6 8.3a2 2 0 00-1.4-1.4C16.8 6.5 12 6.5 12 6.5s-4.8 0-6.2.4a2 2 0 00-1.4 1.4C4 9.7 4 12 4 12s0 2.3.4 3.7a2 2 0 001.4 1.4c1.4.4 6.2.4 6.2.4s4.8 0 6.2-.4a2 2 0 001.4-1.4c.4-1.4.4-3.7.4-3.7s0-2.3-.4-3.7z" stroke="white" strokeWidth="1.2" fill="none"/></>
            ) : style === "outline" ? (
              <><rect x="1" y="1" width="22" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none"/><path d="M10 15l4.5-3L10 9v6z" fill={color}/></>
            ) : (
              <><path d="M19.6 8.3a2 2 0 00-1.4-1.4C16.8 6.5 12 6.5 12 6.5s-4.8 0-6.2.4a2 2 0 00-1.4 1.4C4 9.7 4 12 4 12s0 2.3.4 3.7a2 2 0 001.4 1.4c1.4.4 6.2.4 6.2.4s4.8 0 6.2-.4a2 2 0 001.4-1.4c.4-1.4.4-3.7.4-3.7s0-2.3-.4-3.7z" stroke={color} strokeWidth="1.5" fill="none"/><path d="M10 15l4.5-3L10 9v6z" fill={color}/></>
            )}
          </svg>
        ),
        tiktok: ({ size, color, style }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {style === "filled" ? (
              <><rect width="24" height="24" rx="4" fill={color}/><path d="M16.5 6.5c-.7-.8-1-1.8-1-2.5h-2.3v10.5a2.2 2.2 0 01-2.2 2.2 2.2 2.2 0 01-2.2-2.2 2.2 2.2 0 012.2-2.2c.2 0 .5 0 .7.1V10c-.2 0-.5-.1-.7-.1a4.5 4.5 0 00-4.5 4.6 4.5 4.5 0 004.5 4.5 4.5 4.5 0 004.5-4.5V10c.8.6 1.8 1 3 1V8.5c-1 0-1.8-.5-2.5-1.2z" fill="white" transform="translate(0,1)"/></>
            ) : style === "outline" ? (
              <><rect x="1" y="1" width="22" height="22" rx="4" stroke={color} strokeWidth="1.5" fill="none"/><path d="M16.5 6.5c-.7-.8-1-1.8-1-2.5h-2.3v10.5a2.2 2.2 0 01-2.2 2.2 2.2 2.2 0 01-2.2-2.2 2.2 2.2 0 012.2-2.2c.2 0 .5 0 .7.1V10c-.2 0-.5-.1-.7-.1a4.5 4.5 0 00-4.5 4.6 4.5 4.5 0 004.5 4.5 4.5 4.5 0 004.5-4.5V10c.8.6 1.8 1 3 1V8.5c-1 0-1.8-.5-2.5-1.2z" fill={color} transform="translate(0,1)"/></>
            ) : (
              <path d="M16.5 6.5c-.7-.8-1-1.8-1-2.5h-2.3v10.5a2.2 2.2 0 01-2.2 2.2 2.2 2.2 0 01-2.2-2.2 2.2 2.2 0 012.2-2.2c.2 0 .5 0 .7.1V10c-.2 0-.5-.1-.7-.1a4.5 4.5 0 00-4.5 4.6 4.5 4.5 0 004.5 4.5 4.5 4.5 0 004.5-4.5V10c.8.6 1.8 1 3 1V8.5c-1 0-1.8-.5-2.5-1.2z" fill={color} transform="translate(0,1)"/>
            )}
          </svg>
        ),
      };

      return (
        <div className={`w-full h-full flex flex-col items-center justify-center px-3`}>
          <div className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-1.5" style={{ textAlign: align }}>Share this on</div>
          <div className={`w-full flex items-center ${justifyClass} gap-2`}>
            {platforms.map((p) => {
              const renderer = socialIcons[p];
              if (!renderer) return null;
              return (
                <div key={p} className="flex items-center justify-center cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                  {renderer({ size, color, style: iconStyle })}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === "video") {
      const rawUrl = block.videoUrl || "";
      const videoUrl = parseVideoEmbedUrl(rawUrl) || "https://www.youtube.com/embed/dQw4w9WgXcQ";
      const videoAlign = block.videoAlign || "center";
      const videoRadiusAll = block.videoRadiusAll || false;
      const videoRadius = block.videoRadius || 0;
      const videoRadiusTL = block.videoRadiusTL || 0;
      const videoRadiusTR = block.videoRadiusTR || 0;
      const videoRadiusBL = block.videoRadiusBL || 0;
      const videoRadiusBR = block.videoRadiusBR || 0;

      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-[3px]">
          <iframe
            width="100%"
            height="100%"
            src={videoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            style={{
              borderRadius: videoRadiusAll ? videoRadius : 0,
              borderTopLeftRadius: videoRadiusTL,
              borderTopRightRadius: videoRadiusTR,
              borderBottomLeftRadius: videoRadiusBL,
              borderBottomRightRadius: videoRadiusBR,
            }}
          />
          <span className="text-[10px] text-white/60 mt-1.5 uppercase tracking-widest">Video</span>
        </div>
      );
    }

    if (block.type === "datatable") {
      const numCols = block.tableCols ?? 3;
      const numRows = block.tableRows ?? 3;
      const bgColor = block.tableBgColor ?? "#ffffff";
      const alternating = block.tableAlternatingColors ?? false;
      const padding = block.tablePadding ?? 10;
      const borderMode = block.tableBorderMode ?? "all";
      const borderStyle = block.tableBorderStyle ?? "solid";
      const borderWidth = block.tableBorderWidth ?? 1;
      const borderColor = block.tableBorderColor ?? "#e5e7eb";
      const headerRow = block.tableHeaderRow ?? false;
      const headerCol = block.tableHeaderColumn ?? false;
      const cellData = block.tableCellData ?? {};
      const isEditing = editing && selected;

      const SAMPLE_HEADERS = ["Name", "Email", "Status", "Date", "Amount", "City", "Phone", "Role", "Dept", "ID",
        "Country", "Age", "Score", "Level", "Notes", "Tags", "Type", "Plan", "Qty", "Total"];
      const SAMPLE_DATA = [
        ["Alice", "alice@co", "Active", "Jan 5", "$120", "NYC", "555-01", "Admin", "Eng", "001",
         "US", "28", "95", "Sr", "—", "VIP", "A", "Pro", "3", "$360"],
        ["Bob", "bob@co", "Pending", "Feb 12", "$85", "LA", "555-02", "User", "Sales", "002",
         "UK", "34", "82", "Mid", "New", "—", "B", "Free", "1", "$85"],
        ["Carol", "carol@co", "Active", "Mar 8", "$200", "CHI", "555-03", "Mod", "Mkt", "003",
         "CA", "31", "91", "Sr", "—", "VIP", "A", "Pro", "5", "$1k"],
        ["Dave", "dave@co", "Inactive", "Apr 1", "$50", "SF", "555-04", "User", "Ops", "004",
         "AU", "27", "78", "Jr", "Left", "—", "C", "Free", "1", "$50"],
        ["Eve", "eve@co", "Active", "May 20", "$300", "BOS", "555-05", "Admin", "Eng", "005",
         "DE", "30", "99", "Sr", "—", "VIP", "A", "Ent", "10", "$3k"],
      ];

      const getDefaultText = (r: number, c: number): string => {
        const isHR = headerRow && r === 0;
        const isHC = headerCol && c === 0;
        if (isHR && !isHC) return SAMPLE_HEADERS[c] ?? `Col ${c + 1}`;
        if (isHC && !isHR) return SAMPLE_DATA[r - (headerRow ? 1 : 0)]?.[0] ?? `Row ${r + 1}`;
        if (isHR && isHC) return "";
        const dataRow = r - (headerRow ? 1 : 0);
        const dataCol = c - (headerCol ? 1 : 0);
        return SAMPLE_DATA[dataRow]?.[dataCol] ?? "";
      };

      const showBorder = borderMode !== "none";

      const cellBorder = (r: number, c: number): React.CSSProperties => {
        if (borderMode === "none") return {};
        if (borderMode === "horizontal") {
          return r < numRows - 1
            ? { borderBottom: `${borderWidth}px ${borderStyle} ${borderColor}` }
            : {};
        }
        const s: React.CSSProperties = {};
        if (r < numRows - 1) s.borderBottom = `${borderWidth}px ${borderStyle} ${borderColor}`;
        if (c < numCols - 1) s.borderRight = `${borderWidth}px ${borderStyle} ${borderColor}`;
        return s;
      };

      const outerBorder: React.CSSProperties = showBorder
        ? { border: `${borderWidth}px ${borderStyle} ${borderColor}` }
        : {};

      return (
        <div className="w-full h-full flex flex-col rounded-[3px] overflow-hidden" style={{ backgroundColor: bgColor }}>
          <div
            className="flex-1 overflow-hidden rounded-[2px]"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${numCols}, 1fr)`,
              gridTemplateRows: `repeat(${numRows}, 1fr)`,
              ...outerBorder,
            }}
          >
            {Array.from({ length: numRows * numCols }).map((_, i) => {
              const r = Math.floor(i / numCols);
              const c = i % numCols;
              const isHeaderRow = headerRow && r === 0;
              const isHeaderCol = headerCol && c === 0;
              const isHeader = isHeaderRow || isHeaderCol;

              let cellBg = bgColor;
              if (isHeader) {
                cellBg = "#f3f4f6";
              } else if (alternating && r % 2 === (headerRow ? 1 : 0)) {
                cellBg = "#f9fafb";
              }

              const cellKey = `${r}-${c}`;
              const text = cellData[cellKey] !== undefined ? cellData[cellKey] : getDefaultText(r, c);

              return isEditing ? (
                <div
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  className="overflow-hidden outline-none cursor-text"
                  style={{
                    padding: `${Math.max(1, padding * 0.3)}px ${Math.max(4, padding)}px`,
                    fontSize: Math.max(8, Math.min(12, 11)),
                    color: isHeader ? "#6b7280" : "#374151",
                    fontWeight: isHeader ? 600 : 400,
                    backgroundColor: cellBg,
                    ...cellBorder(r, c),
                  }}
                  onBlur={(e) => {
                    const newText = e.currentTarget.textContent || "";
                    if (newText !== text) {
                      onUpdateBlock?.(block.id, {
                        tableCellData: { ...cellData, [cellKey]: newText },
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      onEditEnd?.();
                    }
                    if (e.key === "Tab") {
                      e.preventDefault();
                      // Move focus to next/prev cell
                      const dir = e.shiftKey ? -1 : 1;
                      const nextIdx = i + dir;
                      if (nextIdx >= 0 && nextIdx < numRows * numCols) {
                        const parent = e.currentTarget.parentElement;
                        const nextCell = parent?.children[nextIdx] as HTMLElement;
                        nextCell?.focus();
                      }
                    }
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {text}
                </div>
              ) : (
                <div
                  key={i}
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{
                    padding: `${Math.max(1, padding * 0.3)}px ${Math.max(4, padding)}px`,
                    fontSize: Math.max(8, Math.min(12, 11)),
                    color: isHeader ? "#6b7280" : "#374151",
                    fontWeight: isHeader ? 600 : 400,
                    backgroundColor: cellBg,
                    ...cellBorder(r, c),
                  }}
                >
                  {text}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === "event") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-white rounded-[3px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span className="text-[11px] text-gray-700 mt-1.5">Event Name</span>
          <span className="text-[9px] text-gray-400 mt-0.5">April 15, 2026 · 6:00 PM</span>
        </div>
      );
    }

    if (block.type === "rsvp") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-white rounded-[3px]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          <span className="text-[11px] text-gray-700 mt-1.5">RSVP</span>
          <div className="flex gap-2 mt-1.5">
            <span className="text-[9px] px-2.5 py-0.5 rounded bg-blue-500 text-white">Yes</span>
            <span className="text-[9px] px-2.5 py-0.5 rounded bg-gray-200 text-gray-500">No</span>
          </div>
        </div>
      );
    }

    if (block.type === "product") {
      return (
        <div className="w-full h-full flex flex-col p-3 bg-white rounded-[3px]">
          <div className="flex-1 bg-gray-100 rounded flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
          <span className="text-[11px] text-gray-700 mt-1.5">Product Name</span>
          <span className="text-[10px] text-gray-500">$29.99</span>
        </div>
      );
    }

    return (
      <div className={`w-full h-full rounded-[3px] flex items-center justify-center ${block.bgColor ? '' : 'border border-dashed border-gray-300'}`} style={{ backgroundColor: block.bgColor }}>
        {!block.bgColor && <span className="text-[10px] text-gray-300 uppercase tracking-widest">Shape</span>}
      </div>
    );
  })();

  return (
    <div
      style={style}
      className={`group cursor-grab active:cursor-grabbing overflow-visible ${outline} transition-shadow`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-full h-full overflow-hidden rounded-[3px] relative">
        {content}
      </div>
      {resizeHandles}
    </div>
  );
}

export function parseVideoEmbedUrl(url: string): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // Already an embed URL
  if (trimmed.includes("youtube.com/embed/") || trimmed.includes("player.vimeo.com/video/")) {
    return trimmed;
  }

  // YouTube: youtube.com/watch?v=ID or youtu.be/ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Dailymotion: dailymotion.com/video/ID
  const dmMatch = trimmed.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) {
    return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
  }

  // Return as-is if it looks like a URL (user may have pasted a direct embed)
  if (trimmed.startsWith("http")) {
    return trimmed;
  }

  return null;
}