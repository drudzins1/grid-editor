import React, { useState, useMemo } from "react";
import { X, Copy, Check, Code, Eye, Download } from "lucide-react";
import { type PlacedBlock } from "./CanvasBlock";
import { type CanvasSettings } from "../App";
import { blocksToEmailHtml } from "../utils/blocksToEmailHtml"; // v4

interface ExportHtmlModalProps {
  blocks: PlacedBlock[];
  canvasSettings: CanvasSettings;
  onClose: () => void;
}

export function ExportHtmlModal({ blocks, canvasSettings, onClose }: ExportHtmlModalProps) {
  const [tab, setTab] = useState<"preview" | "source">("preview");
  const [copied, setCopied] = useState(false);
  const sourceRef = React.useRef<HTMLElement>(null);

  const rawHtml = useMemo(
    () => blocksToEmailHtml(blocks, canvasSettings),
    [blocks, canvasSettings]
  );

  // For copy/source: replace massive base64 data URLs with a placeholder
  const html = useMemo(
    () => rawHtml.replace(/data:image\/[^"]+/g, "https://placehold.co/600x400/e2e8f0/94a3b8?text=Replace+With+Hosted+Image"),
    [rawHtml]
  );

  const handleCopy = async () => {
    const text = sourceRef.current?.textContent ?? html;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[860px] h-[94vh] flex flex-col overflow-hidden animate-[slideUp_250ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[16px] text-gray-900 font-semibold">Export Email HTML</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Table-based HTML ready for email clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Download size={14} strokeWidth={2} />
              Download
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                copied
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-[#186DED] hover:bg-[#1560D4] text-white"
              }`}
            >
              {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
              {copied ? "Copied!" : "Copy HTML"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-3 gap-1">
          <button
            onClick={() => setTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] transition-colors cursor-pointer ${
              tab === "preview"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Eye size={13} strokeWidth={2} />
            Preview
          </button>
          <button
            onClick={() => setTab("source")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] transition-colors cursor-pointer ${
              tab === "source"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Code size={13} strokeWidth={2} />
            Source
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {tab === "preview" ? (
            <div className="bg-[#f5f5f7] rounded-xl p-6 flex justify-center h-full">
              <iframe
                srcDoc={rawHtml}
                title="Email preview"
                className="bg-white shadow-sm border border-gray-200 rounded-lg"
                style={{ width: 740, height: "100%", minHeight: 600, border: "none" }}
              />
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 text-[12px] leading-relaxed overflow-auto max-h-[60vh] font-mono select-text cursor-text">
                <code ref={sourceRef} className="select-text">{html}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {html.length.toLocaleString()} characters &middot; Includes MSO conditionals for Outlook
          </span>
          <button
            onClick={handleCopy}
            className="text-[12px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            {copied ? "Copied to clipboard" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
