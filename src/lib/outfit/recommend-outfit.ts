import { ClosetItemType } from "@/types/closet-item";
import type { Category, OccasionPreset, Outfit } from "../../types/outfits";
import type { ForecastDetails } from "../../types/weather";
import {
  groupByCategory,
  hasRequiredItems,
  isAllowedForOccasion,
  needsOuterwear,
} from "../../utils/outfit-helper";
import {
  calculateWeightedScore,
  scorePreference,
  scoreWeatherSuitability,
} from "./outfit-scorer";

export type OutfitContext = {
  occasion: OccasionPreset;
  weather?: ForecastDetails;
};

function filterEligibleItems(
  items: ClosetItemType[],
  context: OutfitContext,
): ClosetItemType[] {
  return items.filter((item) => isAllowedForOccasion(item, context.occasion));
}

export function scoreOutfit(outfit: Outfit, context: OutfitContext) {
  const items = [
    outfit.top,
    outfit.bottom,
    ...(outfit.outerwear ? [outfit.outerwear] : []),
  ];

  const preferredFormalities = context.occasion.preferredFormalities ?? [];
  const preferredStyles = context.occasion.preferredStyles ?? [];
  const weather = context.weather;

  const breakdown = {
    styleRelevance: scorePreference(
      items,
      preferredStyles,
      (item) => item.styles,
    ),
    formality: scorePreference(
      items,
      preferredFormalities,
      (item) => item.formalities,
    ),
    weatherSuitability: scoreWeatherSuitability(outfit, weather),
    colorHarmony: null,
    silhouette: null,
    materialCompatibility: null,
  };

  return {
    outfit,
    breakdown,
    score: calculateWeightedScore(breakdown),
  };
}

export function generateBaseOutfits(
  closet: Record<Category, ClosetItemType[]>,
  context: OutfitContext,
): Outfit[] {
  if (!hasRequiredItems(closet)) return [];

  const shouldIncludeOuterwear =
    needsOuterwear(context.weather) && (closet.outerwear?.length ?? 0) > 0;

  return closet.top.flatMap((top) =>
    closet.bottom.flatMap((bottom) => {
      // If outerwear is required and options are available, combine top + bottom + outerwear
      if (shouldIncludeOuterwear) {
        return closet.outerwear.map((outerwear) => ({
          top,
          bottom,
          outerwear,
        }));
      }

      // Default: base pair without outerwear
      return [{ top, bottom }];
    }),
  );
}

const TOP_POOL_SIZE = 5;

export function rankOutfits(
  items: ClosetItemType[],
  occasion: OccasionPreset,
  weather?: ForecastDetails,
) {
  const context: OutfitContext = { weather, occasion };
  const eligibleItems = filterEligibleItems(items, context);
  if (eligibleItems.length === 0) return [];

  const closet = groupByCategory(eligibleItems);
  return generateBaseOutfits(closet, context)
    .map((outfit) => scoreOutfit(outfit, context))
    .filter((candidate) => candidate.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function recommendBestOutfit(
  items: ClosetItemType[],
  occasion: OccasionPreset,
  weather?: ForecastDetails,
): Outfit | null {
  const ranked = rankOutfits(items, occasion, weather);
  if (ranked.length === 0) return null;

  const topPool = ranked.slice(0, TOP_POOL_SIZE);
  return topPool[Math.floor(Math.random() * topPool.length)].outfit;
}
