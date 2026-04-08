import type { PlacedBlock } from "../components/CanvasBlock";

const MIN_SPAN = 1;

function overlaps(a: PlacedBlock, b: PlacedBlock): boolean {
  const hOverlap = a.col < b.col + b.spanX && a.col + a.spanX > b.col;
  const vOverlap = a.row < b.row + b.spanY && a.row + a.spanY > b.row;
  return hOverlap && vOverlap;
}

/**
 * Shrink overlapping blocks to make room for the moved/resized block.
 * Picks the smallest adjustment (left, right, top, or bottom trim)
 * that clears the overlap. Falls back to pushing down if the block
 * would shrink below minimum size.
 */
export function resolveCollisions(
  blocks: PlacedBlock[],
  movedId: string
): PlacedBlock[] {
  const result = blocks.map((b) => ({ ...b }));
  const moved = result.find((b) => b.id === movedId);
  if (!moved) return result;

  let changed = true;
  let iterations = 0;
  const MAX_ITER = result.length * result.length;

  while (changed && iterations < MAX_ITER) {
    changed = false;
    iterations++;

    for (const other of result) {
      if (other.id === movedId) continue;
      if (!overlaps(moved, other)) continue;

      // How many grid units of overlap on each axis
      const overlapLeft = moved.col + moved.spanX - other.col;
      const overlapRight = other.col + other.spanX - moved.col;
      const overlapTop = moved.row + moved.spanY - other.row;
      const overlapBottom = other.row + other.spanY - moved.row;

      // Candidate fixes: [cost, apply fn]
      // Trim other's left edge (push col right, shrink spanX)
      const candidates: { cost: number; apply: () => void }[] = [];

      if (overlapLeft > 0 && overlapLeft <= other.spanX - MIN_SPAN) {
        candidates.push({
          cost: overlapLeft,
          apply: () => { other.col += overlapLeft; other.spanX -= overlapLeft; },
        });
      }

      // Trim other's right edge (shrink spanX from right)
      if (overlapRight > 0 && overlapRight <= other.spanX - MIN_SPAN) {
        candidates.push({
          cost: overlapRight,
          apply: () => { other.spanX -= overlapRight; },
        });
      }

      // Trim other's top edge (push row down, shrink spanY)
      if (overlapTop > 0 && overlapTop <= other.spanY - MIN_SPAN) {
        candidates.push({
          cost: overlapTop,
          apply: () => { other.row += overlapTop; other.spanY -= overlapTop; },
        });
      }

      // Trim other's bottom edge (shrink spanY from bottom)
      if (overlapBottom > 0 && overlapBottom <= other.spanY - MIN_SPAN) {
        candidates.push({
          cost: overlapBottom,
          apply: () => { other.spanY -= overlapBottom; },
        });
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.cost - b.cost);
        candidates[0].apply();
      } else {
        // Can't shrink enough — push down as fallback
        other.row = moved.row + moved.spanY;
      }

      changed = true;
    }
  }

  // Second pass: resolve any cascading overlaps among non-moved blocks
  const queue = result.filter((b) => b.id !== movedId);
  let pass = 0;
  while (pass < MAX_ITER) {
    let anyOverlap = false;
    pass++;
    for (const a of result) {
      for (const b of result) {
        if (a.id === b.id) continue;
        if (a.id === movedId || b.id === movedId) continue;
        if (!overlaps(a, b)) continue;
        // Push the lower block further down
        const lower = a.row >= b.row ? a : b;
        const upper = lower === a ? b : a;
        lower.row = upper.row + upper.spanY;
        anyOverlap = true;
      }
    }
    if (!anyOverlap) break;
  }

  return result;
}
