import { Image, Type, MousePointerClick, Share2, MoreHorizontal, Video, Table, CalendarDays, UserCheck, ShoppingBag } from "lucide-react";
import { useState } from "react";

export type BlockType = "image" | "text" | "button" | "spacer" | "separator" | "social" | "video" | "datatable" | "event" | "rsvp" | "product";

const tools: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: "image", icon: <Image size={18} />, label: "Image" },
  { type: "text", icon: <Type size={18} />, label: "Text" },
  { type: "button", icon: <MousePointerClick size={18} />, label: "Button" },
  { type: "spacer", icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="3" /></svg>, label: "Shape" },
  { type: "separator", icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="8" x2="14" y2="8" /></svg>, label: "Separator" },
  { type: "social", icon: <Share2 size={18} />, label: "Social" },
];

const moreTools: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: "video", icon: <Video size={18} />, label: "Video" },
  { type: "datatable", icon: <Table size={18} />, label: "Data Table" },
  { type: "event", icon: <CalendarDays size={18} />, label: "Event" },
  { type: "rsvp", icon: <UserCheck size={18} />, label: "RSVP" },
  { type: "product", icon: <ShoppingBag size={18} />, label: "Product" },
];

interface ToolbarProps {
  onDragStart: (type: BlockType) => void;
  onDragEnd: () => void;
  onExpandChange?: (expanded: boolean) => void;
}

export function Toolbar({ onDragStart, onDragEnd, onExpandChange }: ToolbarProps) {
  const [showMore, setShowMore] = useState(false);

  const toggleMore = () => {
    const next = !showMore;
    setShowMore(next);
    onExpandChange?.(next);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg px-2.5 py-2 shadow-sm">
        {tools.map((t) => (
          <div
            key={t.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("blockType", t.type);
              onDragStart(t.type);
            }}
            onDragEnd={onDragEnd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors select-none text-gray-600 hover:text-gray-900"
            title={t.label}
          >
            {t.icon}
            <span className="text-[11px] tracking-wide uppercase">{t.label}</span>
          </div>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        <button
          onClick={toggleMore}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors select-none ${showMore ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:text-gray-900'}`}
          title="More blocks"
        >
          <MoreHorizontal size={18} />
          <span className="text-[11px] tracking-wide uppercase">More</span>
        </button>
      </div>
      {showMore && (
        <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg px-2.5 py-2 shadow-sm animate-fade-in">
          {moreTools.map((t) => (
            <div
              key={t.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("blockType", t.type);
                onDragStart(t.type);
              }}
              onDragEnd={onDragEnd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors select-none text-gray-600 hover:text-gray-900"
              title={t.label}
            >
              {t.icon}
              <span className="text-[11px] tracking-wide uppercase">{t.label}</span>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.15s ease-out; }
      `}</style>
    </div>
  );
}