import { SCORE_WEIGHTS } from "@/constants/closet-item";
import { ClosetItemType } from "@/types/closet-item";
import {
  findTargetRain,
  findTargetWarmth,
  findTargetWind,
  getOutfitLength,
  getTotalResistance,
  getWarmthTolerance,
  warmthDifference,
} from "@/utils/outfit-helper";
import type { Outfit } from "../../types/outfits";
import type { ForecastDetails } from "../../types/weather";

export type OutfitScoreBreakdown = {
  styleRelevance: number | null;
  formality: number | null;
  weatherSuitability: number | null;
  colorHarmony: number | null;
  silhouette: number | null;
  materialCompatibility: number | null;
};

// Items with no preference data are skipped. The score is the share of the rest that match.
export function scorePreference(
  items: ClosetItemType[],
  preferredValues: string[],
  getValues: (item: ClosetItemType) => string[],
): number | null {
  if (preferredValues.length === 0) return 1;

  const itemsWithMetadata = items
    .map((item) => getValues(item))
    .filter((values) => values.length > 0);

  if (itemsWithMetadata.length === 0) return null;

  const matchingItems = itemsWithMetadata.filter((values) =>
    values.some((value) => preferredValues.includes(value)),
  );

  return matchingItems.length / itemsWithMetadata.length;
}

// Weather score: warmth counts for 50%, rain for 30%, and wind for 20%.
// Without usable data there is no weather score.
export function scoreWeatherSuitability(
  outfit: Outfit,
  weather?: ForecastDetails,
): number | null {
  if (!weather) return null;

  let total = 0;
  let totalWeight = 0;

  const metrics = [
    { score: scoreWarmth(outfit, weather.feelsLike), weight: 0.5 },
    { score: scoreRain(outfit, weather), weight: 0.3 },
    { score: scoreWind(outfit, weather.windSpeed), weight: 0.2 },
  ];

  for (const { score, weight } of metrics) {
    if (score !== null && score !== undefined) {
      total += score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? total / totalWeight : null;
}

// An exact match to the four-slot target scores 1. Too much or too little warmth lowers the score.
export function scoreWarmth(outfit: Outfit, feelsLike: number): number | null {
  const itemCount = getOutfitLength(outfit);
  if (itemCount === 0) return null;

  const target = findTargetWarmth(feelsLike, itemCount);
  const difference = warmthDifference(outfit, target);

  if (difference === null) return null;

  const maxTolerance = getWarmthTolerance(itemCount);
  return Math.max(0, 1 - difference / maxTolerance);
}

// No protection needed or meeting the four-slot wind target earns full points.
export function scoreWind(outfit: Outfit, windSpeed: number): number {
  const target = findTargetWind(windSpeed, getOutfitLength(outfit));

  if (target === 0) return 1;

  const totalResistance = getTotalResistance(
    outfit,
    (item) => item.windResistance,
  );

  return Math.min(totalResistance / target, 1);
}

// Rain and snow use whichever amount is higher to set the four-slot target.
export function scoreRain(outfit: Outfit, weather: ForecastDetails): number {
  const precipitation = Math.max(weather.rainVolume, weather.snowVolume);
  const target = findTargetRain(precipitation, getOutfitLength(outfit));

  if (target === 0) return 1;

  const totalResistance = getTotalResistance(
    outfit,
    (item) => item.waterResistance,
  );

  return Math.min(totalResistance / target, 1);
}

export function calculateWeightedScore(
  breakdown: OutfitScoreBreakdown,
): number | null {
  let total = 0;
  // Missing scores are skipped, so only available scores affect the final result.
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(SCORE_WEIGHTS)) {
    const score = breakdown[key as keyof typeof SCORE_WEIGHTS];

    if (score === null) continue;

    total += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;

  return total / totalWeight;
}
