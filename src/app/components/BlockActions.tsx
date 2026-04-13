import { Copy, Trash2, Save, Sparkles } from "lucide-react";

interface BlockActionsProps {
  onDuplicate: () => void;
  onDelete: () => void;
  onSave?: () => void;
}

export function BlockActions({ onDuplicate, onDelete, onSave }: BlockActionsProps) {
  return (
    <div className="flex flex-row bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {[
        { icon: <Copy size={16} />, action: onDuplicate, color: "text-gray-500 hover:text-gray-700 hover:bg-gray-50" },
        { icon: <Sparkles size={16} />, action: () => {}, color: "text-purple-400 hover:text-purple-600 hover:bg-purple-50" },
        { icon: <Save size={16} />, action: onSave ?? (() => {}), color: "text-gray-500 hover:text-gray-700 hover:bg-gray-50" },
        { icon: <Trash2 size={16} />, action: onDelete, color: "text-red-400 hover:text-red-600 hover:bg-red-50" },
      ].map((item, i, arr) => (
        <button
          key={i}
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onClick={(e) => { e.stopPropagation(); item.action(); }}
          className={`p-2.5 cursor-pointer transition-colors ${item.color} ${i < arr.length - 1 ? "border-r border-gray-100" : ""}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}