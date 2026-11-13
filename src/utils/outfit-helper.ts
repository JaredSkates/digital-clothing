import { MAX_WARMTH_LEVEL, RESISTANCE_LEVELS } from "@/constants/closet-item";
import { ClosetItemType } from "@/types/closet-item";
import type { Category, OccasionPreset, Outfit } from "@/types/outfits";
import type { ForecastDetails } from "@/types/weather";

const COLD_POINT = 65; // in fahrenheit
export const MAX_OUTFIT_SLOTS = 4;

export function isAllowedForOccasion(
  item: ClosetItemType,
  occasion?: OccasionPreset,
): boolean {
  if (!occasion || !item.subCategory) return true;

  return !occasion.bannedSubCategories.includes(item.subCategory);
}
export function getWarmthTolerance(itemCount: number) {
  return (MAX_WARMTH_LEVEL * itemCount) / 2; // change the divisor here when tuning
}

export function groupByCategory(
  items: ClosetItemType[],
): Record<Category, ClosetItemType[]> {
  const groups: Record<Category, ClosetItemType[]> = {
    top: [],
    bottom: [],
    outerwear: [],
    footwear: [],
    accessory: [],
  };

  for (const item of items) {
    groups[item.category].push(item);
  }

  return groups;
}

// should have at least a top and a bottom
export function hasRequiredItems(
  closet: Record<Category, ClosetItemType[]>,
): boolean {
  return closet.top.length > 0 && closet.bottom.length > 0;
}

// outfit's accumulated warmth
export function totalWarmth(outfit: Outfit): number | null {
  let warmth = 0;

  for (const value of Object.values(outfit)) {
    if (!value) continue;

    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      if (item.warmth == null) return null;
      warmth += item.warmth;
    }
  }

  return warmth;
}

// distance between an outfit and target warmth
export function warmthDifference(
  outfit: Outfit,
  target: number,
): number | null {
  const warmth = totalWarmth(outfit);
  return warmth == null ? null : Math.abs(warmth - target);
}

// Counts the worn outfit pieces that can set a target; accessories are not part of Outfit.
export function getOutfitLength(outfit: Outfit): number {
  return [outfit.top, outfit.bottom, outfit.outerwear, outfit.shoes].filter(
    (item) => item != null,
  ).length;
}

// returns true if cold enough or its raining
export function needsOuterwear(w?: ForecastDetails): boolean | null {
  if (!w) return null;

  const cold = w.feelsLike < COLD_POINT;
  const wet = w.precipitationMode !== "no";

  return cold || wet;
}

// Scale targets against the four outfit slots, even when outerwear or shoes are missing.
function scaleTarget(target: number, outfitLength: number): number {
  const slots = Math.min(Math.max(outfitLength, 0), MAX_OUTFIT_SLOTS);
  return (target * slots) / MAX_OUTFIT_SLOTS;
}

// Four core slots need at most 16 warmth points (4 per item).
export function findTargetWarmth(
  feelsLike: number,
  outfitLength: number,
): number {
  let fourSlotTarget: number;
  if (feelsLike >= 85) fourSlotTarget = 3.2;
  else if (feelsLike >= 65) fourSlotTarget = 6.4;
  else if (feelsLike >= 45) fourSlotTarget = 9.6;
  else if (feelsLike >= 35) fourSlotTarget = 12.8;
  else fourSlotTarget = 16;

  return scaleTarget(fourSlotTarget, outfitLength);
}

// Rain is measured in mm/h. Four core slots need at most 12 resistance points.
export function findTargetRain(
  rainAmount: number,
  outfitLength: number,
): number {
  let fourSlotTarget: number;
  if (rainAmount === 0) fourSlotTarget = 0;
  else if (rainAmount < 2.5) fourSlotTarget = 4;
  else if (rainAmount < 10) fourSlotTarget = 8;
  else fourSlotTarget = 12;

  return scaleTarget(fourSlotTarget, outfitLength);
}

// wind mph
export function findTargetWind(
  windSpeed: number,
  outfitLength: number,
): number {
  let fourSlotTarget: number;
  if (windSpeed < 9) fourSlotTarget = 0;
  else if (windSpeed < 16) fourSlotTarget = 4;
  else if (windSpeed < 23) fourSlotTarget = 8;
  else fourSlotTarget = 12;

  return scaleTarget(fourSlotTarget, outfitLength);
}

export function getTotalResistance(
  outfit: Outfit,
  getResistance: (item: ClosetItemType) => ClosetItemType["waterResistance"],
): number {
  let total = 0;

  for (const value of Object.values(outfit)) {
    if (!value) continue;

    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      total += RESISTANCE_LEVELS[getResistance(item) ?? "none"];
    }
  }

  return total;
}
