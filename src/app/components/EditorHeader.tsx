import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Undo2, Redo2, Check, ChevronRight, ChevronDown, RotateCcw, Loader2, Code } from "lucide-react";
import type { SaveEntry } from "../App";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface EditorHeaderProps {
  campaignName?: string;
  onBack?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onPrepareToSend?: () => void;
  onExportHtml?: () => void;
  saveHistory?: SaveEntry[];
  saveStatus?: "saved" | "saving";
  onRevert?: (entry: SaveEntry) => void;
}

export function EditorHeader({
  campaignName = "This is the campaign name",
  onBack,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = false,
  onPrepareToSend,
  onExportHtml,
  saveHistory = [],
  saveStatus = "saved",
  onRevert,
}: EditorHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(campaignName);
  const [historyOpen, setHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) setName(campaignName);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!historyOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [historyOpen]);

  // Re-render every 10s so "time ago" labels stay fresh
  const [, tick] = useState(0);
  useEffect(() => {
    if (!historyOpen || saveHistory.length === 0) return;
    const id = setInterval(() => tick((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, [historyOpen, saveHistory.length]);

  return (
    <div
      className="h-full w-full bg-white/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between px-5"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Left: back + name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="group flex items-center gap-1 text-[13px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowLeft size={17} strokeWidth={1.8} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        <span className="text-gray-200 text-[14px]">/</span>

        {isEditing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") commitName();
            }}
            className="text-[14px] text-gray-800 bg-transparent border-b border-gray-300 focus:border-gray-800 outline-none py-0.5 min-w-[180px] transition-colors"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[14px] text-gray-800 hover:text-black transition-colors cursor-pointer py-0.5"
            title="Click to rename"
          >
            {name}
          </button>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            canUndo
              ? "text-gray-600 hover:text-gray-900 hover:bg-black/[0.04] active:bg-black/[0.06]"
              : "text-gray-200 cursor-not-allowed"
          }`}
          title="Undo (⌘Z)"
        >
          <Undo2 size={18} strokeWidth={1.8} />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            canRedo
              ? "text-gray-600 hover:text-gray-900 hover:bg-black/[0.04] active:bg-black/[0.06]"
              : "text-gray-200 cursor-not-allowed"
          }`}
          title="Redo (⌘⇧Z)"
        >
          <Redo2 size={18} strokeWidth={1.8} />
        </button>

        <div className="w-px h-4 bg-black/[0.06] mx-1.5" />

        {/* Save status + history dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              historyOpen
                ? "bg-black/[0.06] text-gray-600"
                : "hover:bg-black/[0.04] text-gray-600"
            }`}
          >
            {saveStatus === "saving" ? (
              <Loader2 size={14} strokeWidth={2.5} className="animate-spin text-gray-400" />
            ) : (
              <Check size={14} strokeWidth={2.5} className="text-green-500" />
            )}
            <span className="text-[12px] tracking-wide uppercase">
              {saveStatus === "saving" ? "Saving" : "Saved"}
            </span>
            <ChevronDown size={12} strokeWidth={2} className={`transition-transform ${historyOpen ? "rotate-180" : ""}`} />
          </button>

          {historyOpen && (
            <div className="absolute top-full right-0 mt-2 w-[280px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] border border-black/[0.06] overflow-hidden z-[100]">
              <div className="px-3 py-2.5 border-b border-black/[0.06]">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Recent Changes</span>
              </div>

              {saveHistory.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-gray-300">
                  No changes yet
                </div>
              ) : (
                <div className="max-h-[240px] overflow-y-auto">
                  {saveHistory.map((entry, i) => (
                    <div
                      key={entry.id}
                      className={`group flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                        i < saveHistory.length - 1 ? "border-b border-black/[0.04]" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-gray-700 truncate">{entry.description}</div>
                        <div className="text-[11px] text-gray-300 mt-0.5">{formatTimeAgo(entry.timestamp)}</div>
                      </div>
                      {i > 0 && onRevert && (
                        <button
                          onClick={() => {
                            onRevert(entry);
                            setHistoryOpen(false);
                          }}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-all cursor-pointer ml-2 shrink-0"
                        >
                          <RotateCcw size={11} strokeWidth={2} />
                          <span>Revert</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-black/[0.06] mx-1.5" />

        {/* Export HTML */}
        <button
          onClick={onExportHtml}
          className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-gray-800 hover:bg-black/[0.04] px-3 py-2 rounded-lg transition-colors cursor-pointer"
          title="Export email HTML"
        >
          <Code size={15} strokeWidth={2} />
          <span>Export</span>
        </button>

        <div className="w-px h-4 bg-black/[0.06] mx-1.5" />

        {/* Prepare to send */}
        <button onClick={onPrepareToSend} className="flex items-center gap-1.5 bg-[#186DED] hover:bg-[#1560D4] active:bg-[#1254BB] text-white text-[13px] tracking-wide px-5 py-2 rounded-lg transition-colors cursor-pointer">
          <span>Prepare to send</span>
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}