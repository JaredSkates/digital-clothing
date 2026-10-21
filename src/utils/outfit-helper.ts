import { Category, Occasion } from "@/constants/closet-item";
import { ClosetItem } from "@/lib/db/schema";
import { Outfit } from "@/types/outfits";
import { WeatherReport } from "@/types/weather";

const COLD_POINT = 65;
const MAX_WARMTH_DIFFERENCE = 1;

// Returns true if the occasion doesn't explicitly rule out this subcategory
export function isFitForOccasion(
  item: ClosetItem,
  occasion?: Occasion,
): boolean {
  if (!occasion || item.subCategory == null) return true;
  return !occasion.excludedSubCategories.includes(item.subCategory);
}

// Returns true if the item's warmth is close enough to the target weather warmth
export function isFitForWeather(
  item: ClosetItem,
  weather?: WeatherReport,
): boolean {
  if (!weather) return true;
  const target = findTargetWarmth(weather.feelsLike);
  return Math.abs((item.warmth ?? 0) - target) <= MAX_WARMTH_DIFFERENCE;
}

export function groupByCategory(
  items: ClosetItem[],
): Record<Category, ClosetItem[]> {
  const groups: Record<Category, ClosetItem[]> = {
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

export function hasRequiredItems(
  closet: Record<Category, ClosetItem[]>,
): boolean {
  return closet.top.length > 0 && closet.bottom.length > 0;
}

export function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export function totalWarmth(o: Outfit): number {
  return Object.values(o).reduce((sum, item) => sum + (item?.warmth ?? 0), 0);
}

export function warmthDifference(outfit: Outfit, target: number): number {
  return Math.abs(totalWarmth(outfit) - target);
}

export function needsOuterwear(w?: WeatherReport): boolean | null {
  if (!w) return null;

  const cold = w.feelsLike < COLD_POINT;
  const wet = w.precipitationMode !== "no";

  return cold || wet;
}

export function findTargetWarmth(feelsLike: number): number {
  if (feelsLike >= 80) return 2;
  if (feelsLike >= 65) return 4;
  if (feelsLike >= 50) return 6;
  if (feelsLike >= 35) return 8;

  return 10;
}
