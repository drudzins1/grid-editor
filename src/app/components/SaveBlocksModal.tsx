import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface SaveBlocksModalProps {
  blockCount: number;
  onSave: (name: string) => void;
  onClose: () => void;
}

export function SaveBlocksModal({ blockCount, onSave, onClose }: SaveBlocksModalProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.3)", fontFamily: "Inter, system-ui, sans-serif" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-[400px] overflow-hidden animate-[slideUp_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] text-gray-900 font-semibold">Save Content Block</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {blockCount} block{blockCount !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <label className="block text-[12px] text-gray-500 mb-1.5">Name</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hero section, Product card..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-300 outline-none focus:border-blue-400 transition-colors"
          />

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 text-[13px] text-white rounded-lg transition-colors cursor-pointer ${
                name.trim()
                  ? "bg-[#186DED] hover:bg-[#1560D4]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
