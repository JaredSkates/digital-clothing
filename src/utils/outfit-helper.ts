import { VISUAL_AREA_WEIGHT } from "@/config/weights";
import { COLD_POINT } from "@/constants/closet";
import type {
  Category,
  ClosetItemType,
  ColorReadyItem,
  OccasionPreset,
  Outfit,
} from "@/types";
import type { ForecastDetails } from "@/types/weather";
import { classifyColorRole, hexToOklch } from "./color-math";

export function isAllowedForOccasion(
  item: ClosetItemType,
  occasion?: OccasionPreset,
): boolean {
  if (!occasion || !item.subCategory) return true;

  return !occasion.bannedSubCategories.includes(item.subCategory);
}

export function groupByCategory(
  items: ClosetItemType[],
): Record<Category, ClosetItemType[]> {
  const groups: Record<Category, ClosetItemType[]> = {
    top: [],
    bottom: [],
    onePiece: [],
    outerwear: [],
    footwear: [],
    accessory: [],
  };

  for (const item of items) {
    groups[item.category].push(item);
  }

  return groups;
}

// An outfit needs either a top/bottom pair or a one-piece item.
export function hasRequiredItems(
  closet: Record<Category, ClosetItemType[]>,
): boolean {
  return (
    (closet.top.length > 0 && closet.bottom.length > 0) ||
    closet.onePiece.length > 0
  );
}

export function listOutfitItems(outfit: Outfit): ClosetItemType[] {
  return Object.values(outfit).filter(
    (item): item is ClosetItemType =>
      item != null && item.category !== "accessory",
  );
}

export function needsOuterwear(weather?: ForecastDetails): boolean | null {
  if (!weather) return null;

  const cold = weather.feelsLike < COLD_POINT;
  const wet = weather.precipitationMode !== "no";

  return cold || wet;
}

export function prepareOutfit(outfit: Outfit): ColorReadyItem[] {
  const preparedItems: ColorReadyItem[] = [];

  for (const item of Object.values(outfit)) {
    if (!item || item.category === "accessory") continue;

    const oklch = hexToOklch(item.colorHex);
    const colorRole = classifyColorRole(oklch);
    const visualAreaWeight = VISUAL_AREA_WEIGHT[item.category] ?? 0;

    preparedItems.push({
      item,
      oklch,
      colorRole,
      visualAreaWeight,
    });
  }

  return preparedItems;
}
