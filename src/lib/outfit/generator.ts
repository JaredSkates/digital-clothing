import { TOP_K } from "@/constants/closet";
import type {
  Category,
  ClosetItemType,
  OccasionPreset,
  Outfit,
  ScoredOutfit,
} from "@/types";
import type { ForecastDetails } from "../../types/weather";
import {
  groupByCategory,
  hasRequiredItems,
  isAllowedForOccasion,
  needsOuterwear,
} from "../../utils/outfit-helper";
import {
  calculateWeightedScore,
  scoreColorHarmony,
  scorePreference,
  scoreWeatherProtection,
} from "./outfit-scorer";

export type OutfitContext = {
  occasion: OccasionPreset;
  weather?: ForecastDetails;
};

// hard filters
function filterEligibleItems(
  items: ClosetItemType[],
  context: OutfitContext,
): ClosetItemType[] {
  return items.filter((item) => isAllowedForOccasion(item, context.occasion));
}

// score [top, bottom, outerwear(optional)]
export function scoreOutfit(
  outfit: Outfit,
  context: OutfitContext,
): ScoredOutfit {
  const preferredFormalities = context.occasion.preferredFormalities ?? [];
  const preferredStyles = context.occasion.preferredStyles ?? [];
  const weather = context.weather;

  const breakdown = {
    styleRelevance: scorePreference(
      outfit,
      preferredStyles,
      (item) => item.styles,
    ),
    formality: scorePreference(
      outfit,
      preferredFormalities,
      (item) => item.formalities,
    ),
    weatherProtection: scoreWeatherProtection(outfit, weather),
    colorHarmony: scoreColorHarmony(outfit),
    silhouette: null,
    materialCompatibility: null,
  };

  return {
    outfit,
    breakdown,
    score: calculateWeightedScore(breakdown),
  };
}

function buildCoreOutfits(pools: Record<Category, ClosetItemType[]>): Outfit[] {
  const outfits: Outfit[] = [];
  for (const top of pools.top) {
    for (const bottom of pools.bottom) outfits.push({ top, bottom });
  }
  for (const onePiece of pools.onePiece) outfits.push({ onePiece });
  return outfits;
}

export function generateOutfits(
  closet: Record<Category, ClosetItemType[]>,
  context: OutfitContext,
): Outfit[] {
  if (!hasRequiredItems(closet)) return [];

  const outerwearOptions =
    needsOuterwear(context.weather) && closet.outerwear.length > 0
      ? closet.outerwear
      : [undefined];
  const footwearOptions =
    closet.footwear.length > 0 ? closet.footwear : [undefined];

  return buildCoreOutfits(closet).flatMap((coreOutfit) =>
    footwearOptions.flatMap((footwear) =>
      outerwearOptions.map((outerwear) => ({
        ...coreOutfit,
        ...(footwear ? { footwear } : {}),
        ...(outerwear ? { outerwear } : {}),
      })),
    ),
  );
}

// filter, create, score, and rank
export function rankOutfits(
  items: ClosetItemType[],
  occasion: OccasionPreset,
  weather?: ForecastDetails,
) {
  const context: OutfitContext = { weather, occasion };
  const eligibleItems = filterEligibleItems(items, context);
  if (eligibleItems.length === 0) return [];

  const closet = groupByCategory(eligibleItems);
  return generateOutfits(closet, context)
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

  const topPool = ranked.slice(0, TOP_K);
  return topPool[Math.floor(Math.random() * topPool.length)].outfit;
}
