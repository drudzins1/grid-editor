import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { type PlacedBlock, parseVideoEmbedUrl } from "./CanvasBlock";
import type { CanvasSettings } from "../App";

interface BlockStylePanelProps {
  block: PlacedBlock;
  onUpdate: (id: string, updates: Partial<PlacedBlock>) => void;
  canvasSettings?: undefined;
  onUpdateCanvas?: undefined;
}

interface CanvasStylePanelProps {
  block?: undefined;
  onUpdate?: undefined;
  canvasSettings: CanvasSettings;
  onUpdateCanvas: (settings: CanvasSettings) => void;
}

type StylePanelProps = BlockStylePanelProps | CanvasStylePanelProps;

const COLOR_PRESETS = [
  "#2563eb", "#3b82f6", "#0ea5e9", "#06b6d4",
  "#10b981", "#22c55e", "#eab308", "#f59e0b",
  "#f97316", "#ef4444", "#ec4899", "#a855f7",
  "#6366f1", "#1e293b", "#475569", "#94a3b8",
];

const RADIUS_OPTIONS = [
  { label: "None", value: 0 },
  { label: "Sm", value: 4 },
  { label: "Md", value: 8 },
  { label: "Lg", value: 16 },
  { label: "Full", value: 999 },
];

const FONT_SIZE_OPTIONS = [
  { label: "XS", value: 11 },
  { label: "S", value: 13 },
  { label: "M", value: 15 },
  { label: "L", value: 18 },
  { label: "XL", value: 22 },
];

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Raleway", value: "Raleway, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
];

const PADDING_OPTIONS = [
  { label: "0", value: 0 },
  { label: "8", value: 8 },
  { label: "16", value: 16 },
  { label: "24", value: 24 },
  { label: "32", value: 32 },
];

const BORDER_WIDTH_OPTIONS = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] text-gray-400 mb-2">{label}</div>
      {children}
    </div>
  );
}

function ColorGrid({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {COLOR_PRESETS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-110 ${
            value === c ? "ring-2 ring-offset-1 ring-blue-500" : ""
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: number }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors ${
            value === o.value
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AlignControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { label: "Left", value: "left", icon: "┣" },
    { label: "Center", value: "center", icon: "╋" },
    { label: "Right", value: "right", icon: "┫" },
  ];
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors ${
            value === o.value
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StylePanel(props: StylePanelProps) {
  // Canvas mode
  if (props.canvasSettings) {
    const { canvasSettings, onUpdateCanvas } = props;
    return (
      <PanelWrapper label="Canvas Style">
        <Section label="Background Color">
          <ColorGrid
            value={canvasSettings.bgColor}
            onChange={(c) => onUpdateCanvas({ ...canvasSettings, bgColor: c })}
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="color"
              value={canvasSettings.bgColor}
              onChange={(e) => onUpdateCanvas({ ...canvasSettings, bgColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
            />
            <span className="text-[12px] text-gray-400 uppercase tracking-wider">
              {canvasSettings.bgColor}
            </span>
            {canvasSettings.bgColor !== "#ffffff" && (
              <button
                onClick={() => onUpdateCanvas({ ...canvasSettings, bgColor: "#ffffff" })}
                className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        </Section>
        <Section label="Padding">
          <SegmentedControl
            options={PADDING_OPTIONS}
            value={canvasSettings.padding}
            onChange={(v) => onUpdateCanvas({ ...canvasSettings, padding: v })}
          />
        </Section>
        <Section label="Border Width">
          <SegmentedControl
            options={BORDER_WIDTH_OPTIONS}
            value={canvasSettings.borderWidth}
            onChange={(v) => onUpdateCanvas({ ...canvasSettings, borderWidth: v })}
          />
        </Section>
        {canvasSettings.borderWidth > 0 && (
          <Section label="Border Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={canvasSettings.borderColor ?? "#e5e7eb"}
                onChange={(e) => onUpdateCanvas({ ...canvasSettings, borderColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
              />
              <span className="text-[12px] text-gray-400 uppercase tracking-wider">
                {canvasSettings.borderColor ?? "#e5e7eb"}
              </span>
            </div>
          </Section>
        )}
      </PanelWrapper>
    );
  }

  // Block mode
  const { block, onUpdate } = props;
  const update = useCallback(
    (updates: Partial<PlacedBlock>) => onUpdate(block.id, updates),
    [block.id, onUpdate]
  );

  if (block.type === "text") {
    return (
      <TextStylePanel block={block} update={update} />
    );
  }

  if (block.type === "button") {
    return (
      <ButtonStylePanel block={block} update={update} />
    );
  }

  if (block.type === "image") {
    return (
      <ImageStylePanel block={block} update={update} />
    );
  }

  if (block.type === "spacer") {
    return (
      <PanelWrapper label="Shape Style">
        <Section label="Background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={block.bgColor ?? "#ffffff"}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
            />
            <span className="text-[12px] text-gray-400 uppercase tracking-wider">
              {block.bgColor ?? "#ffffff"}
            </span>
            {block.bgColor && (
              <button
                onClick={() => update({ bgColor: undefined })}
                className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        </Section>
      </PanelWrapper>
    );
  }

  if (block.type === "separator") {
    return (
      <PanelWrapper label="Separator Style">
        <Section label="Color">
          <ColorGrid
            value={block.sepColor ?? "#e5e7eb"}
            onChange={(c) => update({ sepColor: c })}
          />
        </Section>
        <Section label="Thickness">
          <SegmentedControl
            options={[
              { label: "1", value: 1 },
              { label: "2", value: 2 },
              { label: "3", value: 3 },
              { label: "4", value: 4 },
            ]}
            value={block.sepThickness ?? 1}
            onChange={(v) => update({ sepThickness: v })}
          />
        </Section>
        <Section label="Style">
          <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
            {(["solid", "dashed", "dotted"] as const).map((s) => (
              <button
                key={s}
                onClick={() => update({ sepStyle: s })}
                className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors capitalize ${
                  (block.sepStyle ?? "solid") === s
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
        <Section label="Side Margin">
          <SegmentedControl
            options={[
              { label: "0", value: 0 },
              { label: "8", value: 8 },
              { label: "16", value: 16 },
              { label: "32", value: 32 },
            ]}
            value={block.sepMargin ?? 8}
            onChange={(v) => update({ sepMargin: v })}
          />
        </Section>
      </PanelWrapper>
    );
  }

  if (block.type === "social") {
    return <SocialStylePanel block={block} update={update} />;
  }

  if (block.type === "video") {
    return <VideoStylePanel block={block} update={update} />;
  }

  if (block.type === "datatable") {
    return <DataTableStylePanel block={block} update={update} />;
  }

  return null;
}

function PanelWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3.5 w-[224px]">
      <div className="text-[11px] uppercase tracking-[0.12em] text-gray-500 mb-3 pb-2 border-b border-gray-100">
        {label}
      </div>
      {children}
    </div>
  );
}

function TextStylePanel({ block, update }: { block: PlacedBlock; update: (updates: Partial<PlacedBlock>) => void }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <PanelWrapper label="Text Style">
      <Section label="Text Color">
        <ColorGrid
          value={block.textColor ?? "#374151"}
          onChange={(c) => update({ textColor: c })}
        />
      </Section>
      <Section label="Font Size">
        <SegmentedControl
          options={FONT_SIZE_OPTIONS}
          value={FONT_SIZE_OPTIONS.find((o) => o.value === (block.fontSize ?? 13)) ? (block.fontSize ?? 13) : -1}
          onChange={(v) => update({ fontSize: v })}
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={8}
            max={120}
            value={block.fontSize ?? 13}
            onChange={(e) => {
              const v = Math.max(8, Math.min(120, Number(e.target.value)));
              if (!isNaN(v)) update({ fontSize: v });
            }}
            className="w-14 text-center text-[12px] text-gray-700 border border-gray-200 rounded-md py-1.5 outline-none focus:border-blue-300 transition-colors bg-transparent"
          />
          <span className="text-[11px] text-gray-400">px</span>
        </div>
      </Section>
      <Section label="Font">
        <select
          value={block.fontFamily ?? "Inter, sans-serif"}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full text-[13px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-2 cursor-pointer outline-none focus:border-blue-300 transition-colors"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </Section>
      <Section label="Format">
        <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
          <FormatToggle
            active={(block.fontWeight ?? "normal") === "bold"}
            onClick={() => update({ fontWeight: block.fontWeight === "bold" ? "normal" : "bold" })}
            title="Bold"
          >
            <span style={{ fontWeight: 700 }}>B</span>
          </FormatToggle>
          <FormatToggle
            active={(block.fontStyle ?? "normal") === "italic"}
            onClick={() => update({ fontStyle: block.fontStyle === "italic" ? "normal" : "italic" })}
            title="Italic"
          >
            <span style={{ fontStyle: "italic" }}>I</span>
          </FormatToggle>
          <FormatToggle
            active={block.textDecoration === "underline"}
            onClick={() => update({ textDecoration: block.textDecoration === "underline" ? "none" : "underline" })}
            title="Underline"
          >
            <span style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>U</span>
          </FormatToggle>
          <FormatToggle
            active={block.textDecoration === "line-through"}
            onClick={() => update({ textDecoration: block.textDecoration === "line-through" ? "none" : "line-through" })}
            title="Strikethrough"
          >
            <span style={{ textDecoration: "line-through" }}>S</span>
          </FormatToggle>
        </div>
      </Section>
      <Section label="Transform">
        <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
          {([
            { label: "Aa", value: "none" },
            { label: "AA", value: "uppercase" },
            { label: "aa", value: "lowercase" },
            { label: "Aa", value: "capitalize" },
          ] as const).map((o, i) => (
            <button
              key={o.value + i}
              onClick={() => update({ textTransform: o.value })}
              className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors ${
                (block.textTransform ?? "none") === o.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title={o.value === "none" ? "Normal" : o.value.charAt(0).toUpperCase() + o.value.slice(1)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Section>
      <Section label="Alignment">
        <AlignControl
          value={block.textAlign ?? "left"}
          onChange={(v) => update({ textAlign: v as PlacedBlock["textAlign"] })}
        />
      </Section>
      <Section label="Vertical Alignment">
        <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
          {(["top", "middle", "bottom"] as const).map((v) => (
            <button
              key={v}
              onClick={() => update({ verticalAlign: v })}
              className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors capitalize ${
                (block.verticalAlign ?? "top") === v
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {v === "top" ? "Top" : v === "middle" ? "Middle" : "Bottom"}
            </button>
          ))}
        </div>
      </Section>
      <Section label="Background">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={block.bgColor ?? "#ffffff"}
            onChange={(e) => update({ bgColor: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
          />
          <span className="text-[12px] text-gray-400 uppercase tracking-wider">
            {block.bgColor ?? "#ffffff"}
          </span>
          {block.bgColor && (
            <button
              onClick={() => update({ bgColor: undefined })}
              className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      </Section>

      {/* Additional options toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-between text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer pt-4 pb-2 border-t border-gray-100 mt-1 transition-colors"
      >
        <span>Additional options</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${showMore ? "rotate-180" : ""}`}
        >
          <polyline points="3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {showMore && (
        <div className="mt-2">
          {/* Line Height */}
          <CollapsibleSection label="Line Height" defaultOpen={false}>
            <input
              type="range"
              min={80}
              max={250}
              step={10}
              value={block.lineHeight ?? 150}
              onChange={(e) => update({ lineHeight: Number(e.target.value) })}
              className="w-full h-1 accent-blue-500 cursor-pointer"
            />
            <div className="text-[12px] text-gray-400 text-right mt-0.5">
              {block.lineHeight ?? 150}%
            </div>
          </CollapsibleSection>

          {/* Letter Spacing */}
          <CollapsibleSection label="Letter Spacing" defaultOpen={false}>
            <input
              type="range"
              min={-5}
              max={20}
              step={1}
              value={(block.letterSpacing ?? 0) * 100}
              onChange={(e) => update({ letterSpacing: Number(e.target.value) / 100 })}
              className="w-full h-1 accent-blue-500 cursor-pointer"
            />
            <div className="text-[12px] text-gray-400 text-right mt-0.5">
              {((block.letterSpacing ?? 0) * 100).toFixed(0)}
            </div>
          </CollapsibleSection>

          {/* Border */}
          <CollapsibleSection label="Border" defaultOpen={false}>
            <Section label="Thickness">
              <NumericStepper
                value={block.borderWidth ?? 0}
                onChange={(v) => update({ borderWidth: v })}
                min={0}
                max={10}
              />
            </Section>
            <Section label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.borderColor ?? "#000000"}
                  onChange={(e) => update({ borderColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
                />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {block.borderColor ?? "#000000"}
                </span>
                {block.borderColor && block.borderColor !== "#000000" && (
                  <button
                    onClick={() => update({ borderColor: undefined })}
                    className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                  >
                    Reset
                  </button>
                )}
              </div>
            </Section>
            {(block.borderWidth ?? 0) > 0 && (
              <Section label="Style">
                <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                  {(["solid", "dashed", "dotted"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ borderStyle: s })}
                      className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors capitalize ${
                        (block.borderStyle ?? "solid") === s
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>
            )}
          </CollapsibleSection>

          {/* Padding */}
          <CollapsibleSection label="Padding" defaultOpen={false}>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.paddingAll ?? true}
                onChange={(v) => {
                  if (v) {
                    const val = block.paddingTop ?? 10;
                    update({ paddingAll: true, paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                  } else {
                    update({ paddingAll: false });
                  }
                }}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            {(block.paddingAll ?? true) ? (
              <Section label="All Sides">
                <NumericStepper
                  value={block.paddingTop ?? 10}
                  onChange={(v) => update({ paddingTop: v, paddingBottom: v, paddingLeft: v, paddingRight: v })}
                  min={0}
                  max={100}
                />
              </Section>
            ) : (
              <>
                <Section label="Top">
                  <NumericStepper value={block.paddingTop ?? 10} onChange={(v) => update({ paddingTop: v })} min={0} max={100} />
                </Section>
                <Section label="Bottom">
                  <NumericStepper value={block.paddingBottom ?? 10} onChange={(v) => update({ paddingBottom: v })} min={0} max={100} />
                </Section>
                <Section label="Left">
                  <NumericStepper value={block.paddingLeft ?? 40} onChange={(v) => update({ paddingLeft: v })} min={0} max={100} />
                </Section>
                <Section label="Right">
                  <NumericStepper value={block.paddingRight ?? 40} onChange={(v) => update({ paddingRight: v })} min={0} max={100} />
                </Section>
              </>
            )}
          </CollapsibleSection>

          {/* Margin */}
          <CollapsibleSection label="Margin" defaultOpen={false}>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.marginAll ?? true}
                onChange={(v) => update({ marginAll: v })}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            <Section label={block.marginAll ?? true ? "All Sides" : "Margin"}>
              <NumericStepper
                value={block.marginValue ?? 0}
                onChange={(v) => update({ marginValue: v })}
                min={0}
                max={100}
              />
            </Section>
          </CollapsibleSection>
        </div>
      )}
    </PanelWrapper>
  );
}

function ButtonStylePanel({ block, update }: { block: PlacedBlock; update: (updates: Partial<PlacedBlock>) => void }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <PanelWrapper label="Button Style">
      <Section label="Button Color">
        <ColorGrid
          value={block.btnColor ?? "#2563eb"}
          onChange={(c) => update({ btnColor: c })}
        />
      </Section>
      <Section label="Text Color">
        <div className="flex gap-1">
          {["#ffffff", "#1e293b", "#f8fafc"].map((c) => (
            <button
              key={c}
              onClick={() => update({ btnTextColor: c })}
              className={`w-6 h-6 rounded-full cursor-pointer border border-gray-200 transition-transform hover:scale-110 ${
                (block.btnTextColor ?? "#ffffff") === c
                  ? "ring-2 ring-offset-1 ring-blue-500"
                  : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </Section>
      <Section label="Corner Radius">
        <SegmentedControl
          options={RADIUS_OPTIONS}
          value={block.btnRadius ?? 4}
          onChange={(v) => update({ btnRadius: v })}
        />
      </Section>
      <Section label="Size">
        <SegmentedControl
          options={[
            { label: "Sm", value: 0 },
            { label: "Md", value: 1 },
            { label: "Lg", value: 2 },
            { label: "Full", value: 3 },
          ]}
          value={block.btnSize ?? 1}
          onChange={(v) => update({ btnSize: v })}
        />
      </Section>
      <Section label="Alignment">
        <AlignControl
          value={block.btnAlign ?? "center"}
          onChange={(v) => update({ btnAlign: v as PlacedBlock["btnAlign"] })}
        />
      </Section>

      {/* Additional options toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-between text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer pt-4 pb-2 border-t border-gray-100 mt-1 transition-colors"
      >
        <span>Additional options</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${showMore ? "rotate-180" : ""}`}
        >
          <polyline points="3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {showMore && (
        <div className="mt-2">
          {/* Background color */}
          <CollapsibleSection label="Background color" defaultOpen={false}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.bgColor ?? "#ffffff"}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
              />
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                {block.bgColor ?? "#ffffff"}
              </span>
              {block.bgColor && block.bgColor !== "#ffffff" && (
                <button
                  onClick={() => update({ bgColor: undefined })}
                  className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </CollapsibleSection>

          {/* Border */}
          <CollapsibleSection label="Border" defaultOpen={false}>
            <Section label="Thickness">
              <NumericStepper
                value={block.borderWidth ?? 0}
                onChange={(v) => update({ borderWidth: v })}
                min={0}
                max={10}
              />
            </Section>
            <Section label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.borderColor ?? "#000000"}
                  onChange={(e) => update({ borderColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
                />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {block.borderColor ?? "#000000"}
                </span>
                {block.borderColor && block.borderColor !== "#000000" && (
                  <button
                    onClick={() => update({ borderColor: undefined })}
                    className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                  >
                    Reset
                  </button>
                )}
              </div>
            </Section>
            {(block.borderWidth ?? 0) > 0 && (
              <Section label="Style">
                <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                  {(["solid", "dashed", "dotted"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ borderStyle: s })}
                      className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors capitalize ${
                        (block.borderStyle ?? "solid") === s
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>
            )}
          </CollapsibleSection>

          {/* Padding */}
          <CollapsibleSection label="Padding" defaultOpen={false}>
            <p className="text-[11px] text-gray-400 mb-2.5">Add space between the button border and your text.</p>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.paddingAll ?? true}
                onChange={(v) => {
                  if (v) {
                    const val = block.paddingTop ?? 10;
                    update({ paddingAll: true, paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                  } else {
                    update({ paddingAll: false });
                  }
                }}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            {(block.paddingAll ?? true) ? (
              <Section label="All Sides">
                <NumericStepper
                  value={block.paddingTop ?? 10}
                  onChange={(v) => update({ paddingTop: v, paddingBottom: v, paddingLeft: v, paddingRight: v })}
                  min={0}
                  max={100}
                />
              </Section>
            ) : (
              <>
                <Section label="Top and bottom">
                  <NumericStepper
                    value={block.paddingTop ?? 10}
                    onChange={(v) => update({ paddingTop: v, paddingBottom: v })}
                    min={0}
                    max={100}
                  />
                </Section>
                <Section label="Left and right">
                  <NumericStepper
                    value={block.paddingLeft ?? 15}
                    onChange={(v) => update({ paddingLeft: v, paddingRight: v })}
                    min={0}
                    max={100}
                  />
                </Section>
              </>
            )}
          </CollapsibleSection>

          {/* Margin */}
          <CollapsibleSection label="Margin" defaultOpen={false}>
            <p className="text-[11px] text-gray-400 mb-2.5">Add space around the outside of your button border.</p>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.marginAll ?? true}
                onChange={(v) => {
                  if (v) {
                    const val = block.marginValue ?? 10;
                    update({ marginAll: true, marginValue: val });
                  } else {
                    update({ marginAll: false });
                  }
                }}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            {(block.marginAll ?? true) ? (
              <Section label="All Sides">
                <NumericStepper
                  value={block.marginValue ?? 10}
                  onChange={(v) => update({ marginValue: v })}
                  min={0}
                  max={100}
                />
              </Section>
            ) : (
              <>
                <Section label="Top">
                  <NumericStepper value={block.marginTop ?? 10} onChange={(v) => update({ marginTop: v })} min={0} max={100} />
                </Section>
                <Section label="Bottom">
                  <NumericStepper value={block.marginBottom ?? 10} onChange={(v) => update({ marginBottom: v })} min={0} max={100} />
                </Section>
                <Section label="Left">
                  <NumericStepper value={block.marginLeft ?? 40} onChange={(v) => update({ marginLeft: v })} min={0} max={100} />
                </Section>
                <Section label="Right">
                  <NumericStepper value={block.marginRight ?? 40} onChange={(v) => update({ marginRight: v })} min={0} max={100} />
                </Section>
              </>
            )}
          </CollapsibleSection>
        </div>
      )}
    </PanelWrapper>
  );
}

function ImageStylePanel({ block, update }: { block: PlacedBlock; update: (updates: Partial<PlacedBlock>) => void }) {
  const [showMore, setShowMore] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(block.imageUrl || '');
  const [altTextInput, setAltTextInput] = useState(block.imgAltText || '');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasValidUrl = imageUrlInput.trim().length > 0;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageUrlInput(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <PanelWrapper label="Image Style">
      {/* Import Image Modal */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-[fadeIn_200ms_ease-out]" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-[672px] max-h-[90vh] overflow-y-auto p-8 animate-[slideUp_250ms_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] text-gray-900" style={{ fontWeight: 600 }}>Insert Image</h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md hover:bg-gray-100 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center py-8 mb-4 transition-colors cursor-pointer ${
                dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect(file);
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-[13px] text-gray-500 mt-2">Drop an image here or click to upload</span>
              <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, GIF, SVG, WebP</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* URL input */}
            <div className="mb-4">
              <div className="text-[13px] text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>Image URL</div>
              <input
                type="text"
                value={imageUrlInput.startsWith('data:') ? '' : imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-300 outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            {/* Image preview */}
            <div className="mb-4">
              <div className="text-[13px] text-gray-900 mb-2" style={{ fontWeight: 500 }}>Preview</div>
              <div className="border border-gray-200 rounded-lg flex items-center justify-center h-[200px] bg-gray-50 overflow-hidden">
                {hasValidUrl ? (
                  <img
                    src={imageUrlInput}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-[11px] text-gray-400">Upload or enter a URL to preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alt text */}
            <div className="mb-6">
              <div className="text-[13px] text-gray-900 mb-2" style={{ fontWeight: 500 }}>Alt text</div>
              <input
                type="text"
                value={altTextInput}
                onChange={(e) => setAltTextInput(e.target.value)}
                placeholder="Describe this image for accessibility"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowImportModal(false)} className="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Cancel</button>
              <button
                disabled={!hasValidUrl}
                onClick={() => {
                  update({ imageUrl: imageUrlInput, imgAltText: altTextInput });
                  setShowImportModal(false);
                }}
                className={`px-5 py-2.5 text-[13px] text-white rounded-lg cursor-pointer transition-colors ${hasValidUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                style={{ fontWeight: 500 }}
              >
                Insert
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image preview / import area */}
      <div className="mb-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center h-[120px] mb-2.5 bg-gray-50/50 overflow-hidden">
          {block.imageUrl ? (
            <img src={block.imageUrl} alt={block.imgAltText || ''} className="max-w-full max-h-full object-contain" />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </div>
        <button
          className="w-full flex items-center justify-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => {
            setImageUrlInput(block.imageUrl || '');
            setAltTextInput(block.imgAltText || '');
            setShowImportModal(true);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {block.imageUrl ? 'Replace' : 'Import'}
        </button>
      </div>

      <Section label="Corner Radius">
        <SegmentedControl
          options={RADIUS_OPTIONS}
          value={block.imgRadius ?? 0}
          onChange={(v) => update({ imgRadius: v })}
        />
      </Section>
      <Section label="Fit">
        <SegmentedControl
          options={[
            { label: "Cover", value: 0 },
            { label: "Contain", value: 1 },
            { label: "Fill", value: 2 },
          ]}
          value={block.imgFit ?? 0}
          onChange={(v) => update({ imgFit: v })}
        />
      </Section>
      <Section label="Opacity">
        <input
          type="range"
          min={20}
          max={100}
          value={block.imgOpacity ?? 100}
          onChange={(e) => update({ imgOpacity: Number(e.target.value) })}
          className="w-full h-1 accent-blue-500 cursor-pointer"
        />
        <div className="text-[12px] text-gray-400 text-right mt-0.5">
          {block.imgOpacity ?? 100}%
        </div>
      </Section>

      {/* Additional options toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-between text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer pt-4 pb-2 border-t border-gray-100 mt-1 transition-colors"
      >
        <span>Additional options</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${showMore ? "rotate-180" : ""}`}
        >
          <polyline points="3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {showMore && (
        <div className="mt-2">
          {/* Alt Text */}
          <CollapsibleSection label="Alt Text" defaultOpen={false}>
            <input
              type="text"
              value={block.imgAltText ?? ""}
              onChange={(e) => update({ imgAltText: e.target.value })}
              placeholder="Describe this image…"
              className="w-full text-[12px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-2 outline-none focus:border-blue-300 transition-colors placeholder:text-gray-300"
            />
          </CollapsibleSection>

          {/* Link URL */}
          <CollapsibleSection label="Link URL" defaultOpen={false}>
            <input
              type="text"
              value={block.imgLinkUrl ?? ""}
              onChange={(e) => update({ imgLinkUrl: e.target.value })}
              placeholder="https://…"
              className="w-full text-[12px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-2 outline-none focus:border-blue-300 transition-colors placeholder:text-gray-300"
            />
          </CollapsibleSection>

          {/* Border */}
          <CollapsibleSection label="Border" defaultOpen={false}>
            <Section label="Thickness">
              <NumericStepper
                value={block.borderWidth ?? 0}
                onChange={(v) => update({ borderWidth: v })}
                min={0}
                max={10}
              />
            </Section>
            <Section label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.borderColor ?? "#000000"}
                  onChange={(e) => update({ borderColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
                />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {block.borderColor ?? "#000000"}
                </span>
                {block.borderColor && block.borderColor !== "#000000" && (
                  <button
                    onClick={() => update({ borderColor: undefined })}
                    className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                  >
                    Reset
                  </button>
                )}
              </div>
            </Section>
            {(block.borderWidth ?? 0) > 0 && (
              <Section label="Style">
                <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                  {(["solid", "dashed", "dotted"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ borderStyle: s })}
                      className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors capitalize ${
                        (block.borderStyle ?? "solid") === s
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>
            )}
          </CollapsibleSection>

          {/* Padding */}
          <CollapsibleSection label="Padding" defaultOpen={false}>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.paddingAll ?? true}
                onChange={(v) => {
                  if (v) {
                    const val = block.paddingTop ?? 0;
                    update({ paddingAll: true, paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                  } else {
                    update({ paddingAll: false });
                  }
                }}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            {(block.paddingAll ?? true) ? (
              <Section label="All Sides">
                <NumericStepper
                  value={block.paddingTop ?? 0}
                  onChange={(v) => update({ paddingTop: v, paddingBottom: v, paddingLeft: v, paddingRight: v })}
                  min={0}
                  max={100}
                />
              </Section>
            ) : (
              <>
                <Section label="Top">
                  <NumericStepper value={block.paddingTop ?? 0} onChange={(v) => update({ paddingTop: v })} min={0} max={100} />
                </Section>
                <Section label="Bottom">
                  <NumericStepper value={block.paddingBottom ?? 0} onChange={(v) => update({ paddingBottom: v })} min={0} max={100} />
                </Section>
                <Section label="Left">
                  <NumericStepper value={block.paddingLeft ?? 0} onChange={(v) => update({ paddingLeft: v })} min={0} max={100} />
                </Section>
                <Section label="Right">
                  <NumericStepper value={block.paddingRight ?? 0} onChange={(v) => update({ paddingRight: v })} min={0} max={100} />
                </Section>
              </>
            )}
          </CollapsibleSection>

          {/* Margin */}
          <CollapsibleSection label="Margin" defaultOpen={false}>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.marginAll ?? true}
                onChange={(v) => update({ marginAll: v })}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            <Section label={block.marginAll ?? true ? "All Sides" : "Margin"}>
              <NumericStepper
                value={block.marginValue ?? 0}
                onChange={(v) => update({ marginValue: v })}
                min={0}
                max={100}
              />
            </Section>
          </CollapsibleSection>
        </div>
      )}
    </PanelWrapper>
  );
}

function SocialStylePanel({ block, update }: { block: PlacedBlock; update: (updates: Partial<PlacedBlock>) => void }) {
  const [showMore, setShowMore] = useState(false);

  const ALL_PLATFORMS = [
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
    { id: "x", label: "X" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "youtube", label: "YouTube" },
    { id: "tiktok", label: "TikTok" },
  ];
  const activePlatforms = block.socialPlatforms ?? ["facebook", "instagram", "x"];

  const togglePlatform = (id: string) => {
    const current = [...activePlatforms];
    const idx = current.indexOf(id);
    if (idx >= 0) {
      if (current.length > 1) current.splice(idx, 1);
    } else {
      current.push(id);
    }
    update({ socialPlatforms: current });
  };

  return (
    <PanelWrapper label="Social Style">
      <Section label="Platforms">
        <div className="flex flex-wrap gap-1">
          {ALL_PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`text-[11px] px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                activePlatforms.includes(p.id)
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-gray-50 text-gray-400 border border-gray-150 hover:text-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Section>
      <Section label="Icon Color">
        <ColorGrid
          value={block.socialColor ?? "#1e293b"}
          onChange={(c) => update({ socialColor: c })}
        />
      </Section>
      <Section label="Icon Size">
        <SegmentedControl
          options={[
            { label: "S", value: 18 },
            { label: "M", value: 24 },
            { label: "L", value: 32 },
            { label: "XL", value: 40 },
          ]}
          value={block.socialSize ?? 24}
          onChange={(v) => update({ socialSize: v })}
        />
      </Section>
      <Section label="Style">
        <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
          {(["filled", "outline", "minimal"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update({ socialStyle: s })}
              className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors capitalize ${
                (block.socialStyle ?? "filled") === s
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Section>
      <Section label="Alignment">
        <AlignControl
          value={block.socialAlign ?? "center"}
          onChange={(v) => update({ socialAlign: v as PlacedBlock["socialAlign"] })}
        />
      </Section>

      {/* Additional options toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-between text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer pt-4 pb-2 border-t border-gray-100 mt-1 transition-colors"
      >
        <span>Additional options</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${showMore ? "rotate-180" : ""}`}
        >
          <polyline points="3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {showMore && (
        <div className="mt-2">
          {/* Background color */}
          <CollapsibleSection label="Background color" defaultOpen={false}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.bgColor ?? "#ffffff"}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
              />
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                {block.bgColor ?? "#ffffff"}
              </span>
              {block.bgColor && block.bgColor !== "#ffffff" && (
                <button
                  onClick={() => update({ bgColor: undefined })}
                  className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </CollapsibleSection>

          {/* Padding */}
          <CollapsibleSection label="Padding" defaultOpen={false}>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.paddingAll ?? true}
                onChange={(v) => {
                  if (v) {
                    const val = block.paddingTop ?? 0;
                    update({ paddingAll: true, paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                  } else {
                    update({ paddingAll: false });
                  }
                }}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            {(block.paddingAll ?? true) ? (
              <Section label="All Sides">
                <NumericStepper
                  value={block.paddingTop ?? 0}
                  onChange={(v) => update({ paddingTop: v, paddingBottom: v, paddingLeft: v, paddingRight: v })}
                  min={0}
                  max={100}
                />
              </Section>
            ) : (
              <>
                <Section label="Top">
                  <NumericStepper value={block.paddingTop ?? 0} onChange={(v) => update({ paddingTop: v })} min={0} max={100} />
                </Section>
                <Section label="Bottom">
                  <NumericStepper value={block.paddingBottom ?? 0} onChange={(v) => update({ paddingBottom: v })} min={0} max={100} />
                </Section>
                <Section label="Left">
                  <NumericStepper value={block.paddingLeft ?? 0} onChange={(v) => update({ paddingLeft: v })} min={0} max={100} />
                </Section>
                <Section label="Right">
                  <NumericStepper value={block.paddingRight ?? 0} onChange={(v) => update({ paddingRight: v })} min={0} max={100} />
                </Section>
              </>
            )}
          </CollapsibleSection>
        </div>
      )}
    </PanelWrapper>
  );
}

function VideoStylePanel({ block, update }: { block: PlacedBlock; update: (updates: Partial<PlacedBlock>) => void }) {
  const [showMore, setShowMore] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState(block.videoUrl || '');
  const [altText, setAltText] = useState(block.videoAltText || '');

  const parsedEmbedUrl = parseVideoEmbedUrl(videoUrl);
  const detectedPlatform = videoUrl.includes('vimeo') ? 'Vimeo' : videoUrl.includes('youtu') ? 'YouTube' : videoUrl.includes('dailymotion') ? 'Dailymotion' : '';

  return (
    <PanelWrapper label="Video">
      {/* Import Video Modal */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-[fadeIn_200ms_ease-out]" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-[672px] max-h-[90vh] overflow-y-auto p-8 animate-[slideUp_250ms_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] text-gray-900" style={{ fontWeight: 600 }}>Insert Video</h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md hover:bg-gray-100 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <div className="text-[13px] text-gray-900 mb-0.5" style={{ fontWeight: 500 }}>Video URL <span className="text-gray-400" style={{ fontWeight: 400 }}>(Required)</span></div>
              <div className="text-[12px] text-gray-500 mb-2">Enter a video URL and generate a thumbnail image.</div>
              <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-300 outline-none focus:border-blue-400 transition-colors" />
              {videoUrl && !parsedEmbedUrl && (
                <div className="text-[11px] text-amber-600 mt-1">Could not detect a supported video URL. Supported: YouTube, Vimeo, Dailymotion.</div>
              )}
              {videoUrl && parsedEmbedUrl && (
                <div className="text-[11px] text-green-600 mt-1 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {detectedPlatform ? `${detectedPlatform} video detected` : 'Video URL detected'}
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 my-4" />
            <div className="mb-4">
              <div className="text-[13px] text-gray-500 mb-3">Connect directly to your Vimeo account and import your videos.</div>
              <div className="flex items-center gap-3">
                <span className="text-[18px] text-gray-900" style={{ fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.5px' }}>vimeo</span>
                <button className="px-4 py-1.5 text-[12px] text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Connect</button>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-[13px] text-gray-900" style={{ fontWeight: 500 }}>Video name: {detectedPlatform && <span className="text-gray-500">{detectedPlatform} video</span>}</div>
            </div>
            <div className="mb-4">
              <div className="text-[13px] text-gray-900 mb-2" style={{ fontWeight: 500 }}>Video preview</div>
              <div className="border border-gray-200 rounded-lg flex items-center justify-center h-[200px] bg-gray-900 mb-2.5 overflow-hidden">
                {parsedEmbedUrl ? (
                  <iframe
                    src={parsedEmbedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-700/70 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19" /></svg>
                    </div>
                    <span className="text-[11px] text-gray-500">Enter a URL above to preview</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-6">
              <div className="text-[13px] text-gray-900 mb-2" style={{ fontWeight: 500 }}>Alt text</div>
              <input type="text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="This message will display to viewers who cannot see the thumbnail image" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-colors" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowImportModal(false)} className="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>Cancel</button>
              <button disabled={!parsedEmbedUrl} onClick={() => { update({ videoUrl, videoAltText: altText }); setShowImportModal(false); }} className={`px-5 py-2.5 text-[13px] text-white rounded-lg cursor-pointer transition-colors ${parsedEmbedUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`} style={{ fontWeight: 500 }}>Insert</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Video preview / import area */}
      <div className="mb-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center h-[120px] mb-2.5 bg-gray-50/50">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#9ca3af" strokeWidth="1.5" />
            <polygon points="11.5,9 20,14 11.5,19" fill="#9ca3af" />
          </svg>
        </div>
        <button
          className="w-full flex items-center justify-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => setShowImportModal(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import
        </button>
      </div>

      {/* Align */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-gray-700">Align</span>
        <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              onClick={() => update({ videoAlign: a })}
              className={`w-8 h-7 flex items-center justify-center rounded cursor-pointer transition-colors ${
                (block.videoAlign ?? "center") === a
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {a === "left" && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="3" x2="2" y2="11" /><rect x="4" y="4.5" width="7" height="5" rx="1" />
                </svg>
              )}
              {a === "center" && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="7" y1="2" x2="7" y2="4" /><line x1="7" y1="10" x2="7" y2="12" /><rect x="3" y="4.5" width="8" height="5" rx="1" />
                </svg>
              )}
              {a === "right" && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="12" y1="3" x2="12" y2="11" /><rect x="3" y="4.5" width="7" height="5" rx="1" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Round corners */}
      <CollapsibleSection label="Round corners" defaultOpen={true}>
        <div className="flex items-center gap-2 mb-2">
          <ToggleSwitch
            value={block.videoRadiusAll ?? true}
            onChange={(v) => {
              if (v) {
                const val = block.videoRadius ?? 0;
                update({ videoRadiusAll: true, videoRadius: val, videoRadiusTL: val, videoRadiusTR: val, videoRadiusBL: val, videoRadiusBR: val });
              } else {
                update({ videoRadiusAll: false });
              }
            }}
          />
          <span className="text-[12px] text-gray-500">Apply to all</span>
        </div>
        <div className="mb-2.5">
          <NumericStepper
            value={(block.videoRadiusAll ?? true) ? (block.videoRadius ?? 0) : (block.videoRadiusTL ?? 0)}
            onChange={(v) => {
              if (block.videoRadiusAll ?? true) {
                update({ videoRadius: v, videoRadiusTL: v, videoRadiusTR: v, videoRadiusBL: v, videoRadiusBR: v });
              } else {
                update({ videoRadiusTL: v });
              }
            }}
            min={0}
            max={100}
          />
        </div>
        {!(block.videoRadiusAll ?? true) && (
          <>
            <Section label="Top left">
              <NumericStepper value={block.videoRadiusTL ?? 0} onChange={(v) => update({ videoRadiusTL: v })} min={0} max={100} />
            </Section>
            <Section label="Top right">
              <NumericStepper value={block.videoRadiusTR ?? 0} onChange={(v) => update({ videoRadiusTR: v })} min={0} max={100} />
            </Section>
            <Section label="Bottom left">
              <NumericStepper value={block.videoRadiusBL ?? 0} onChange={(v) => update({ videoRadiusBL: v })} min={0} max={100} />
            </Section>
            <Section label="Bottom right">
              <NumericStepper value={block.videoRadiusBR ?? 0} onChange={(v) => update({ videoRadiusBR: v })} min={0} max={100} />
            </Section>
          </>
        )}
      </CollapsibleSection>

      {/* Additional options toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-between text-[12px] text-gray-500 hover:text-gray-700 cursor-pointer pt-4 pb-2 border-t border-gray-100 mt-1 transition-colors"
      >
        <span>Additional options</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${showMore ? "rotate-180" : ""}`}
        >
          <polyline points="3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {showMore && (
        <div className="mt-2">
          {/* Background color */}
          <CollapsibleSection label="Background color" defaultOpen={false}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.bgColor ?? "#ffffff"}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
              />
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                {block.bgColor ?? "#ffffff"}
              </span>
              {block.bgColor && block.bgColor !== "#ffffff" && (
                <button
                  onClick={() => update({ bgColor: undefined })}
                  className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </CollapsibleSection>

          {/* Border */}
          <CollapsibleSection label="Border" defaultOpen={false}>
            <Section label="Thickness">
              <NumericStepper
                value={block.borderWidth ?? 0}
                onChange={(v) => update({ borderWidth: v })}
                min={0}
                max={10}
              />
            </Section>
            <Section label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.borderColor ?? "#000000"}
                  onChange={(e) => update({ borderColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
                />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {block.borderColor ?? "#000000"}
                </span>
                {block.borderColor && block.borderColor !== "#000000" && (
                  <button
                    onClick={() => update({ borderColor: undefined })}
                    className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                  >
                    Reset
                  </button>
                )}
              </div>
            </Section>
            {(block.borderWidth ?? 0) > 0 && (
              <Section label="Style">
                <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                  {(["solid", "dashed", "dotted"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ borderStyle: s })}
                      className={`flex-1 text-[12px] py-1.5 rounded cursor-pointer transition-colors capitalize ${
                        (block.borderStyle ?? "solid") === s
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>
            )}
          </CollapsibleSection>

          {/* Padding */}
          <CollapsibleSection label="Padding" defaultOpen={false}>
            <p className="text-[11px] text-gray-400 mb-2.5">Add space between the inside of the border and your video.</p>
            <div className="flex items-center justify-end mb-3">
              <div className="w-[48px] h-[48px] rounded-lg bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <polygon points="10,8 16,12 10,16" fill="#3b82f6" stroke="none" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.paddingAll ?? true}
                onChange={(v) => {
                  if (v) {
                    const val = block.paddingTop ?? 0;
                    update({ paddingAll: true, paddingTop: val, paddingBottom: val, paddingLeft: val, paddingRight: val });
                  } else {
                    update({ paddingAll: false });
                  }
                }}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
              <div className="ml-auto">
                <NumericStepper
                  value={block.paddingTop ?? 0}
                  onChange={(v) => {
                    if (block.paddingAll ?? true) {
                      update({ paddingTop: v, paddingBottom: v, paddingLeft: v, paddingRight: v });
                    } else {
                      update({ paddingTop: v });
                    }
                  }}
                  min={0}
                  max={100}
                />
              </div>
            </div>
            {!(block.paddingAll ?? true) && (
              <>
                <Section label="Top">
                  <NumericStepper value={block.paddingTop ?? 0} onChange={(v) => update({ paddingTop: v })} min={0} max={100} />
                </Section>
                <Section label="Bottom">
                  <NumericStepper value={block.paddingBottom ?? 0} onChange={(v) => update({ paddingBottom: v })} min={0} max={100} />
                </Section>
                <Section label="Left">
                  <NumericStepper value={block.paddingLeft ?? 0} onChange={(v) => update({ paddingLeft: v })} min={0} max={100} />
                </Section>
                <Section label="Right">
                  <NumericStepper value={block.paddingRight ?? 0} onChange={(v) => update({ paddingRight: v })} min={0} max={100} />
                </Section>
              </>
            )}
          </CollapsibleSection>

          {/* Margin */}
          <CollapsibleSection label="Margin" defaultOpen={false}>
            <p className="text-[11px] text-gray-400 mb-2.5">Add space between the outside of the border and your video block.</p>
            <div className="flex items-center justify-end mb-3">
              <div className="w-[48px] h-[48px] rounded-lg bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <polygon points="10,8 16,12 10,16" fill="#3b82f6" stroke="none" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <ToggleSwitch
                value={block.marginAll ?? true}
                onChange={(v) => update({ marginAll: v })}
              />
              <span className="text-[12px] text-gray-500">Apply to all sides</span>
            </div>
            {(block.marginAll ?? true) ? (
              <Section label="All Sides">
                <NumericStepper
                  value={block.marginValue ?? 0}
                  onChange={(v) => update({ marginValue: v })}
                  min={0}
                  max={100}
                />
              </Section>
            ) : (
              <>
                <Section label="Top">
                  <NumericStepper value={block.marginTop ?? 0} onChange={(v) => update({ marginTop: v })} min={0} max={100} />
                </Section>
                <Section label="Bottom">
                  <NumericStepper value={block.marginBottom ?? 0} onChange={(v) => update({ marginBottom: v })} min={0} max={100} />
                </Section>
                <Section label="Left">
                  <NumericStepper value={block.marginLeft ?? 0} onChange={(v) => update({ marginLeft: v })} min={0} max={100} />
                </Section>
                <Section label="Right">
                  <NumericStepper value={block.marginRight ?? 0} onChange={(v) => update({ marginRight: v })} min={0} max={100} />
                </Section>
              </>
            )}
          </CollapsibleSection>
        </div>
      )}
    </PanelWrapper>
  );
}

function TableSizeSelector({ cols, rows, onChange }: { cols: number; rows: number; onChange: (cols: number, rows: number) => void }) {
  const GRID_COLS = 10;
  const GRID_ROWS = 6;
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState<number | null>(null);

  const displayCols = hoverCol ?? cols;
  const displayRows = hoverRow ?? rows;

  return (
    <div className="mb-4 pb-4 border-b border-gray-100">
      <div className="text-[11px] text-gray-400 mb-2">Resizing</div>
      {/* Numeric inputs */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex items-center gap-1 flex-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round">
            <rect x="1" y="2" width="4" height="10" rx="1" />
            <rect x="6.5" y="2" width="4" height="10" rx="1" />
          </svg>
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => onChange(Math.max(1, Math.min(20, Number(e.target.value))), rows)}
            className="w-10 text-center text-[13px] text-gray-700 border border-gray-200 rounded-md py-1 outline-none focus:border-blue-300 transition-colors bg-transparent"
          />
        </div>
        <span className="text-[12px] text-gray-400">×</span>
        <div className="flex items-center gap-1 flex-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round">
            <rect x="2" y="1" width="10" height="4" rx="1" />
            <rect x="2" y="6.5" width="10" height="4" rx="1" />
          </svg>
          <input
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(e) => onChange(cols, Math.max(1, Math.min(20, Number(e.target.value))))}
            className="w-10 text-center text-[13px] text-gray-700 border border-gray-200 rounded-md py-1 outline-none focus:border-blue-300 transition-colors bg-transparent"
          />
        </div>
      </div>
      {/* Visual grid selector */}
      <div
        className="inline-grid gap-[3px] p-1 rounded-lg border border-gray-100 bg-gray-50/50"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
        onMouseLeave={() => { setHoverCol(null); setHoverRow(null); }}
      >
        {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => {
          const c = (i % GRID_COLS) + 1;
          const r = Math.floor(i / GRID_COLS) + 1;
          const isHighlighted = c <= displayCols && r <= displayRows;
          return (
            <button
              key={i}
              className={`w-[15px] h-[13px] rounded-[3px] border transition-colors cursor-pointer ${
                isHighlighted
                  ? "bg-blue-400 border-blue-500"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
              onMouseEnter={() => { setHoverCol(c); setHoverRow(r); }}
              onClick={() => { onChange(c, r); setHoverCol(null); setHoverRow(null); }}
            />
          );
        })}
      </div>
      <div className="text-[11px] text-gray-400 mt-1.5 text-center">
        {displayCols} × {displayRows}
      </div>
    </div>
  );
}

function DataTableStylePanel({ block, update }: { block: PlacedBlock; update: (updates: Partial<PlacedBlock>) => void }) {
  return (
    <PanelWrapper label="Data Table Style">
      {/* Table size selector */}
      <TableSizeSelector
        cols={block.tableCols ?? 3}
        rows={block.tableRows ?? 3}
        onChange={(cols, rows) => update({ tableCols: cols, tableRows: rows })}
      />

      {/* Table background */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <span className="text-[13px] text-gray-700">Table background</span>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={block.tableBgColor ?? "#ffffff"}
            onChange={(e) => update({ tableBgColor: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
          />
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 3.5 5 6.5 7.5 3.5" /></svg>
        </div>
      </div>

      {/* Alternating colors */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <span className="text-[13px] text-gray-700">Alternating colors</span>
        <ToggleSwitch
          value={block.tableAlternatingColors ?? false}
          onChange={(v) => update({ tableAlternatingColors: v })}
        />
      </div>

      {/* Padding */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <span className="text-[13px] text-gray-700">Padding</span>
        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
          <input
            type="number"
            value={block.tablePadding ?? 10}
            onChange={(e) => update({ tablePadding: Math.max(0, Math.min(100, Number(e.target.value))) })}
            className="w-10 text-center text-[13px] text-gray-700 py-1 border-none outline-none bg-transparent"
          />
          <div className="flex flex-col border-l border-gray-200">
            <button
              onClick={() => update({ tablePadding: Math.min(100, (block.tablePadding ?? 10) + 1) })}
              className="px-1.5 py-0 text-[8px] text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
            >▲</button>
            <button
              onClick={() => update({ tablePadding: Math.max(0, (block.tablePadding ?? 10) - 1) })}
              className="px-1.5 py-0 text-[8px] text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-200"
            >▼</button>
          </div>
        </div>
      </div>

      {/* Borders */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="text-[13px] text-gray-700 mb-3">Borders</div>
        {/* Border mode selector: none, horizontal, all */}
        <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5 mb-3">
          {([
            { value: "none" as const, icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2">
                <rect x="2" y="2" width="14" height="14" rx="1" />
                <line x1="2" y1="7" x2="16" y2="7" />
                <line x1="2" y1="12" x2="16" y2="12" />
                <line x1="7" y1="2" x2="7" y2="16" />
                <line x1="12" y1="2" x2="12" y2="16" />
              </svg>
            )},
            { value: "horizontal" as const, icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="14" height="14" rx="1" strokeWidth="1" />
                <line x1="2" y1="7" x2="16" y2="7" />
                <line x1="2" y1="12" x2="16" y2="12" />
              </svg>
            )},
            { value: "all" as const, icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="14" height="14" rx="1" />
                <line x1="2" y1="7" x2="16" y2="7" />
                <line x1="2" y1="12" x2="16" y2="12" />
                <line x1="7" y1="2" x2="7" y2="16" />
                <line x1="12" y1="2" x2="12" y2="16" />
              </svg>
            )},
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ tableBorderMode: opt.value })}
              className={`flex-1 flex items-center justify-center py-2 rounded cursor-pointer transition-colors ${
                (block.tableBorderMode ?? "all") === opt.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {opt.icon}
            </button>
          ))}
        </div>

        {/* Border style, width, color row */}
        {(block.tableBorderMode ?? "all") !== "none" && (
          <div className="flex items-center gap-2">
            <select
              value={block.tableBorderStyle ?? "solid"}
              onChange={(e) => update({ tableBorderStyle: e.target.value as PlacedBlock["tableBorderStyle"] })}
              className="text-[12px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 cursor-pointer outline-none focus:border-blue-300 transition-colors"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              <input
                type="number"
                value={block.tableBorderWidth ?? 1}
                onChange={(e) => update({ tableBorderWidth: Math.max(0, Math.min(10, Number(e.target.value))) })}
                className="w-8 text-center text-[12px] text-gray-700 py-1 border-none outline-none bg-transparent"
              />
              <div className="flex flex-col border-l border-gray-200">
                <button
                  onClick={() => update({ tableBorderWidth: Math.min(10, (block.tableBorderWidth ?? 1) + 1) })}
                  className="px-1 py-0 text-[7px] text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                >▲</button>
                <button
                  onClick={() => update({ tableBorderWidth: Math.max(0, (block.tableBorderWidth ?? 1) - 1) })}
                  className="px-1 py-0 text-[7px] text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-200"
                >▼</button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={block.tableBorderColor ?? "#374151"}
                onChange={(e) => update({ tableBorderColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
              />
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 3.5 5 6.5 7.5 3.5" /></svg>
            </div>
          </div>
        )}
      </div>

      {/* Headers */}
      <div className="mb-2">
        <div className="text-[13px] text-gray-700 mb-3">Headers</div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-gray-600">Row</span>
          <ToggleSwitch
            value={block.tableHeaderRow ?? false}
            onChange={(v) => update({ tableHeaderRow: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-600">Column</span>
          <ToggleSwitch
            value={block.tableHeaderColumn ?? false}
            onChange={(v) => update({ tableHeaderColumn: v })}
          />
        </div>
      </div>
    </PanelWrapper>
  );
}

function FormatToggle({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex-1 text-[13px] py-1.5 rounded cursor-pointer transition-colors ${
        active
          ? "bg-white text-gray-800 shadow-sm"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function NumericStepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer text-[13px] transition-colors"
      >
        −
      </button>
      <div className="w-9 text-center text-[13px] text-gray-700">{value}</div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer text-[13px] transition-colors"
      >
        +
      </button>
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-9 h-[20px] rounded-full cursor-pointer transition-colors ${value ? "bg-blue-500" : "bg-gray-300"}`}
    >
      <div
        className={`absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${value ? "left-[18px]" : "left-[3px]"}`}
      />
    </button>
  );
}

function CollapsibleSection({ label, defaultOpen, children }: { label: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-gray-400 hover:text-gray-600 cursor-pointer py-1.5 transition-colors"
      >
        <span>{label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="2.5 3.5 5 6.5 7.5 3.5" />
        </svg>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}