import type { PlacedBlock } from "../components/CanvasBlock";
import type { CanvasSettings } from "../App";

const CANVAS_W = 720;
const COLS = 24;
const COL_W = CANVAS_W / COLS;
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1758560936904-4eb0049284aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NTU4NzY2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function px(n: number): string {
  return `${Math.round(n)}px`;
}

function vOverlaps(a: PlacedBlock, b: PlacedBlock): boolean {
  return a.row < b.row + b.spanY && a.row + a.spanY > b.row;
}

function hOverlaps(a: PlacedBlock, b: PlacedBlock): boolean {
  return a.col < b.col + b.spanX && a.col + a.spanX > b.col;
}

/**
 * Group blocks into sections using graph-based connected components.
 * Two blocks are connected if they overlap vertically BUT NOT horizontally —
 * meaning they're side-by-side and belong in the same table row.
 * Blocks that overlap both vertically and horizontally are stacked and
 * should be in separate rows.
 */
function groupIntoSections(blocks: PlacedBlock[]): PlacedBlock[][] {
  const sorted = [...blocks].sort((a, b) => a.row - b.row || a.col - b.col);
  const parent = new Map<string, string>();

  const find = (id: string): string => {
    while (parent.get(id) !== id) {
      parent.set(id, parent.get(parent.get(id)!)!);
      id = parent.get(id)!;
    }
    return id;
  };

  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const b of sorted) parent.set(b.id, b.id);

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (vOverlaps(sorted[i], sorted[j]) && !hOverlaps(sorted[i], sorted[j])) {
        union(sorted[i].id, sorted[j].id);
      }
    }
  }

  const groups = new Map<string, PlacedBlock[]>();
  for (const b of sorted) {
    const root = find(b.id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(b);
  }

  return [...groups.values()].sort((a, b) => a[0].row - b[0].row);
}

/**
 * Within a section, find column slots. Blocks at the same col position
 * are stacked vertically in the same slot (rendered as a nested table).
 */
interface ColumnSlot {
  col: number;
  spanX: number;
  blocks: PlacedBlock[];
}

function findColumnSlots(section: PlacedBlock[]): ColumnSlot[] {
  const slotMap = new Map<number, ColumnSlot>();
  const sorted = [...section].sort((a, b) => a.col - b.col || a.row - b.row);

  for (const block of sorted) {
    const existing = slotMap.get(block.col);
    if (existing) {
      existing.blocks.push(block);
      existing.spanX = Math.max(existing.spanX, block.spanX);
    } else {
      slotMap.set(block.col, { col: block.col, spanX: block.spanX, blocks: [block] });
    }
  }

  return [...slotMap.values()].sort((a, b) => a.col - b.col);
}

function renderBlockContent(block: PlacedBlock): string {
  const cellW = block.spanX * COL_W;
  const blockH = block.spanY * COL_W;

  switch (block.type) {
    case "text": {
      const body = block.textBody ?? "Your content goes here. Edit this text to customize your email message.";
      const styles: string[] = [
        `color: ${block.textColor ?? "#374151"}`,
        `font-size: ${block.fontSize ?? 13}px`,
        `font-family: ${block.fontFamily ?? "Inter, Arial, sans-serif"}`,
        `font-weight: ${block.fontWeight ?? "normal"}`,
        `text-align: ${block.textAlign ?? "left"}`,
        `line-height: ${block.lineHeight ? `${block.lineHeight}%` : "150%"}`,
        `padding: ${block.paddingTop ?? 10}px ${block.paddingRight ?? 12}px ${block.paddingBottom ?? 10}px ${block.paddingLeft ?? 12}px`,
        "margin: 0",
      ];
      if (block.fontStyle === "italic") styles.push("font-style: italic");
      if (block.textDecoration && block.textDecoration !== "none") styles.push(`text-decoration: ${block.textDecoration}`);
      if (block.textTransform && block.textTransform !== "none") styles.push(`text-transform: ${block.textTransform}`);
      if (block.letterSpacing) styles.push(`letter-spacing: ${block.letterSpacing}em`);
      return `<p style="${styles.join("; ")}">${escapeHtml(body)}</p>`;
    }

    case "button": {
      const label = block.buttonLabel ?? "Learn More";
      const btnColor = block.btnColor ?? "#2563eb";
      const textColor = block.btnTextColor ?? "#ffffff";
      const radius = block.btnRadius ?? 4;
      const align = block.btnAlign ?? "center";
      return `<div style="text-align: ${align}; padding: 8px 0;">
  <a href="#" style="background-color: ${btnColor}; color: ${textColor}; border-radius: ${radius}px; padding: 10px 24px; font-size: 13px; font-family: Inter, Arial, sans-serif; text-decoration: none; display: inline-block; font-weight: bold; letter-spacing: 0.04em;">${escapeHtml(label)}</a>
</div>`;
    }

    case "image": {
      const src = block.imageUrl ?? DEFAULT_IMAGE;
      const alt = block.imgAltText ?? "";
      const radius = block.imgRadius ?? 0;
      const opacity = (block.imgOpacity ?? 100) / 100;
      const fit = (["cover", "contain", "fill"] as const)[block.imgFit ?? 0];
      const styles = [
        `width: 100%`,
        `height: ${px(blockH)}`,
        `object-fit: ${fit}`,
        `display: block`,
      ];
      if (radius > 0) styles.push(`border-radius: ${radius}px`);
      if (opacity < 1) styles.push(`opacity: ${opacity}`);
      const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${Math.round(cellW)}" height="${Math.round(blockH)}" style="${styles.join("; ")}" />`;
      return block.imgLinkUrl
        ? `<a href="${escapeHtml(block.imgLinkUrl)}" target="_blank">${img}</a>`
        : img;
    }

    case "spacer": {
      const bg = block.bgColor ?? "transparent";
      return `<div style="height: ${px(blockH)}; background-color: ${bg}; font-size: 0; line-height: 0;">&nbsp;</div>`;
    }

    case "separator": {
      const color = block.sepColor ?? "#e5e7eb";
      const thickness = block.sepThickness ?? 1;
      const style = block.sepStyle ?? "solid";
      const margin = block.sepMargin ?? 8;
      return `<div style="padding: ${px(blockH / 2 - thickness / 2)} ${margin}px 0;"><hr style="border: none; border-top: ${thickness}px ${style} ${color}; margin: 0;" /></div>`;
    }

    case "social": {
      const platforms = block.socialPlatforms ?? ["facebook", "instagram", "x"];
      const color = block.socialColor ?? "#1e293b";
      const size = block.socialSize ?? 24;
      const align = block.socialAlign ?? "center";
      const labels: Record<string, string> = {
        facebook: "Facebook", instagram: "Instagram", x: "X",
        linkedin: "LinkedIn", youtube: "YouTube", tiktok: "TikTok",
      };
      const icons = platforms
        .filter((p) => labels[p])
        .map((p) => `<a href="#" target="_blank" style="color: ${color}; text-decoration: none; font-size: ${size}px; padding: 0 6px; font-family: Arial, sans-serif;">${labels[p]}</a>`)
        .join(" ");
      return `<div style="text-align: ${align}; padding: 8px 0;">${icons}</div>`;
    }

    case "video": {
      const url = block.videoUrl ?? "#";
      const alt = block.videoAltText ?? "Video";
      const radius = block.videoRadius ?? 0;
      return `<div style="text-align: ${block.videoAlign ?? "center"}; padding: 8px 0;">
  <a href="${escapeHtml(url)}" target="_blank" style="display: inline-block;">
    <img src="https://placehold.co/${Math.round(cellW)}x${Math.round(blockH)}/1e293b/ffffff?text=%E2%96%B6+${escapeHtml(alt)}" alt="${escapeHtml(alt)}" width="${Math.round(cellW)}" style="width: 100%; height: auto; display: block; border-radius: ${radius}px;" />
  </a>
</div>`;
    }

    default:
      return `<div style="padding: 16px; text-align: center; color: #94a3b8; font-family: Arial, sans-serif; font-size: 12px;">[${block.type}]</div>`;
  }
}

function renderSectionInner(section: PlacedBlock[]): string {
  const slots = findColumnSlots(section);
  const cells: string[] = [];
  let cursor = 0;

  for (const slot of slots) {
    if (slot.col > cursor) {
      const gapW = (slot.col - cursor) * COL_W;
      cells.push(`<td width="${Math.round(gapW)}" style="width: ${px(gapW)}; font-size: 0;">&nbsp;</td>`);
    }

    const cellW = slot.spanX * COL_W;
    const sortedBlocks = [...slot.blocks].sort((a, b) => a.row - b.row);
    const vAlign = sortedBlocks[0].verticalAlign ?? "top";

    if (sortedBlocks.length === 1) {
      const block = sortedBlocks[0];
      const blockH = block.spanY * COL_W;
      const bg = block.bgColor ? ` background-color: ${block.bgColor};` : "";
      cells.push(`<td width="${Math.round(cellW)}" valign="${vAlign}" style="width: ${px(cellW)}; height: ${px(blockH)};${bg}">${renderBlockContent(block)}</td>`);
    } else {
      const innerRows = sortedBlocks.map((block) => {
        const blockH = block.spanY * COL_W;
        const bg = block.bgColor ? ` background-color: ${block.bgColor};` : "";
        return `<tr><td style="height: ${px(blockH)};${bg}">${renderBlockContent(block)}</td></tr>`;
      }).join("\n");

      cells.push(`<td width="${Math.round(cellW)}" valign="${vAlign}" style="width: ${px(cellW)}; padding: 0;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width: 100%;">
  ${innerRows}
  </table>
</td>`);
    }

    cursor = slot.col + slot.spanX;
  }

  if (cursor < COLS) {
    const gapW = (COLS - cursor) * COL_W;
    cells.push(`<td width="${Math.round(gapW)}" style="width: ${px(gapW)}; font-size: 0;">&nbsp;</td>`);
  }

  return `<tr>\n  ${cells.join("\n  ")}\n</tr>`;
}

/**
 * Each section renders as its own nested table inside a full-width cell.
 * This prevents column layouts in one section from affecting another.
 */
function renderSection(section: PlacedBlock[]): string {
  const inner = renderSectionInner(section);
  return `<tr>
  <td style="padding: 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${CANVAS_W}" style="width: ${CANVAS_W}px;">
    ${inner}
    </table>
  </td>
</tr>`;
}

export function blocksToEmailHtml(
  blocks: PlacedBlock[],
  settings: CanvasSettings
): string {
  const sections = groupIntoSections(blocks);
  const rowParts: string[] = [];
  let cursor = 0;

  for (const section of sections) {
    const sectionStart = Math.min(...section.map((b) => b.row));
    if (sectionStart > cursor) {
      const gapH = (sectionStart - cursor) * COL_W;
      rowParts.push(`<tr><td style="height: ${px(gapH)}; font-size: 0; line-height: 0;">&nbsp;</td></tr>`);
    }
    rowParts.push(renderSection(section));
    cursor = Math.max(...section.map((b) => b.row + b.spanY));
  }

  const rows = rowParts.join("\n");

  const borderCss = settings.borderWidth > 0
    ? `border: ${settings.borderWidth}px solid ${settings.borderColor ?? "#e5e7eb"};`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<title>Email</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7;">
<center style="width: 100%; background-color: #f5f5f7; padding: 24px 0;">
<!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${CANVAS_W}" align="center"><tr><td><![endif]-->
<table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="${CANVAS_W}" align="center" style="margin: 0 auto; max-width: ${CANVAS_W}px; background-color: ${settings.bgColor}; ${borderCss}">
${rows}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</center>
</body>
</html>`;
}
