import type { Occasion } from "../../constants/closet-item";
import type { Outfit } from "../../types/outfits";
import type { WeatherReport } from "../../types/weather";
import {
  groupByCategory,
  hasRequiredItems,
  isFitForOccasion,
  needsOuterwear,
  scoreOutfit,
} from "../../utils/outfit-helper";
import type { ClosetItemType } from "../db/schema";

export type RecommendationContext = {
  weather?: WeatherReport;
  occasion?: Occasion;
};

export type ScoredOutfit = {
  outfit: Outfit;
  score: number;
};

export function filterEligibleItems(
  items: ClosetItemType[],
  context: RecommendationContext,
): ClosetItemType[] {
  return items.filter((item) => isFitForOccasion(item, context.occasion));
}

export function generateCandidateOutfits(
  items: ClosetItemType[],
): Outfit[] {
  const closet = groupByCategory(items);
  if (!hasRequiredItems(closet)) return [];

  const outerwearOptions = [undefined, ...closet.outerwear];
  const shoeOptions = [undefined, ...closet.footwear];
  const accessoryOptions = [undefined, ...closet.accessory];

  return closet.top.flatMap((top) =>
    closet.bottom.flatMap((bottom) =>
      outerwearOptions.flatMap((outerwear) =>
        shoeOptions.flatMap((shoes) =>
          accessoryOptions.map((accessory) => ({
            top,
            bottom,
            outerwear,
            shoes,
            accessory,
          })),
        ),
      ),
    ),
  );
}

export function isValidOutfit(
  outfit: Outfit,
  context: RecommendationContext,
): boolean {
  if (!outfit.top || !outfit.bottom) return false;
  return !needsOuterwear(context.weather) || Boolean(outfit.outerwear);
}

export function rankOutfits(
  outfits: Outfit[],
  context: RecommendationContext,
): ScoredOutfit[] {
  return outfits
    .map((outfit) => ({
      outfit,
      score: scoreOutfit(outfit, context.weather, context.occasion),
    }))
    .sort((a, b) => b.score - a.score);
}

export function chooseFromBest(
  rankedOutfits: ScoredOutfit[],
  random: () => number = Math.random,
): Outfit | null {
  if (rankedOutfits.length === 0) return null;

  const bestScore = rankedOutfits[0].score;
  const bestOutfits = rankedOutfits.filter(({ score }) => score === bestScore);
  const index = Math.min(
    Math.floor(random() * bestOutfits.length),
    bestOutfits.length - 1,
  );
  return bestOutfits[index].outfit;
}

export function recommendBestOutfit(
  items: ClosetItemType[],
  weather?: WeatherReport,
  occasion?: Occasion,
): Outfit | null {
  const context = { weather, occasion };
  const eligibleItems = filterEligibleItems(items, context);
  const candidates = generateCandidateOutfits(eligibleItems);
  const validOutfits = candidates.filter((outfit) =>
    isValidOutfit(outfit, context),
  );
  const rankedOutfits = rankOutfits(validOutfits, context);

  return chooseFromBest(rankedOutfits);
}
