import type { Category, Occasion } from "@/constants/closet-item";
import type { ClosetItemType } from "@/lib/db/schema";
import type { Outfit } from "@/types/outfits";
import type { WeatherReport } from "@/types/weather";

const COLD_POINT = 65; // in fahrenheit

// Returns true if the occasion doesn't explicitly rule out this subcategory
export function isFitForOccasion(
  item: ClosetItemType,
  occasion?: Occasion,
): boolean {
  if (!occasion || item.subCategory == null || item.subCategory === "other") {
    return true;
  }
  return !occasion.excludedSubCategories.some(
    (subCategory) => subCategory === item.subCategory,
  );
}

// Scoring
export function weatherPenalty(
  outfit: Outfit,
  weather?: WeatherReport,
): number {
  if (!weather) return 0;
  const difference = warmthDifference(
    outfit,
    findTargetWarmth(weather.feelsLike),
  );
  return difference ?? 0;
}

export function occasionPenalty(outfit: Outfit, occasion?: Occasion): number {
  if (!occasion) return 0;

  return Object.values(outfit).reduce((penalty, item) => {
    if (
      !item ||
      item.formality == null ||
      occasion.preferredFormalities.some(
        (formality) => formality === item.formality,
      )
    ) {
      return penalty;
    }

    return penalty + 10;
  }, 0);
}

export function scoreOutfit(
  outfit: Outfit,
  weather?: WeatherReport,
  occasion?: Occasion,
): number {
  let score = 100;
  score -= weatherPenalty(outfit, weather);
  score -= occasionPenalty(outfit, occasion);
  return score;
}

// Closet utilities
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

// Weather utilities

// outfit's accumulated warmth
export function totalWarmth(outfit: Outfit): number | null {
  let warmth = 0;

  for (const item of Object.values(outfit)) {
    if (!item) continue;
    if (item.warmth == null) return null;
    warmth += item.warmth;
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

// returns true if cold enough or its raining
export function needsOuterwear(w?: WeatherReport): boolean | null {
  if (!w) return null;

  const cold = w.feelsLike < COLD_POINT;
  const wet = w.precipitationMode !== "no";

  return cold || wet;
}

// translates current weather to warmth level
export function findTargetWarmth(feelsLike: number): number {
  if (feelsLike >= 80) return 2;
  if (feelsLike >= 65) return 4;
  if (feelsLike >= 50) return 6;
  if (feelsLike >= 35) return 8;

  return 10;
}
