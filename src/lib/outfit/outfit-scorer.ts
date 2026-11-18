import {
  COLOR_SUB_WEIGHTS,
  OUTFIT_SCORE_WEIGHTS,
  WEATHER_SCORE_WEIGHTS,
} from "@/config/weights";
import type {
  ClosetItemType,
  ColorScoreResult,
  Outfit,
  OutfitScoreBreakdown,
} from "@/types";
import { listOutfitItems, prepareOutfit } from "@/utils/outfit-helper";
import type { ForecastDetails } from "../../types/weather";
import {
  scoreAccentHierarchy,
  scoreHueHarmony,
  scoreLightnessContrast,
} from "./color-scoring";
import { scoreRain, scoreWarmth, scoreWind } from "./weather-scoring";

// Items with no preference data are skipped. The score is the share of the rest that match.
export function scorePreference(
  outfit: Outfit,
  preferredValues: string[],
  getValues: (item: ClosetItemType) => string[],
): number | null {
  if (preferredValues.length === 0) return null;

  const itemsWithMetadata = listOutfitItems(outfit)
    .map(getValues)
    .filter((values) => values.length > 0);

  if (itemsWithMetadata.length === 0) return null;

  const matchingItems = itemsWithMetadata.filter((values) =>
    values.some((value) => preferredValues.includes(value)),
  );

  return matchingItems.length / itemsWithMetadata.length;
}

// Weather score: warmth counts for 50%, rain for 30%, and wind for 20%.
// Without usable data there is no weather score.
export function scoreWeatherProtection(
  outfit: Outfit,
  weather?: ForecastDetails,
): number | null {
  if (!weather) return null;

  let total = 0;
  let totalWeight = 0;

  const metrics = [
    {
      score: scoreWarmth(outfit, weather.feelsLike),
      weight: WEATHER_SCORE_WEIGHTS.warmth,
    },
    {
      score: scoreRain(outfit, weather),
      weight: WEATHER_SCORE_WEIGHTS.rain,
    },
    {
      score: scoreWind(outfit, weather.windSpeed),
      weight: WEATHER_SCORE_WEIGHTS.wind,
    },
  ];

  for (const { score, weight } of metrics) {
    if (score !== null && score !== undefined) {
      total += score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? total / totalWeight : null;
}

export function scoreColorHarmony(outfit: Outfit): ColorScoreResult {
  const items = prepareOutfit(outfit);
  const harmony = scoreHueHarmony(items);
  const accent = scoreAccentHierarchy(items);
  const contrast = scoreLightnessContrast(items);
  const score =
    harmony.score * COLOR_SUB_WEIGHTS.harmony +
    accent.score * COLOR_SUB_WEIGHTS.accent +
    contrast * COLOR_SUB_WEIGHTS.contrast;

  return {
    score,
    harmonyScheme: harmony.scheme,
    vividPieceCount: accent.vividCount,
  };
}

export function calculateWeightedScore(
  breakdown: OutfitScoreBreakdown,
): number {
  let total = 0;
  // Missing scores are skipped, so only available scores affect the final result.
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(OUTFIT_SCORE_WEIGHTS)) {
    const entry = breakdown[key as keyof typeof OUTFIT_SCORE_WEIGHTS];

    if (entry === null || entry === undefined) continue;

    const numericScore = typeof entry === "number" ? entry : entry.score;

    total += numericScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;

  return total / totalWeight;
}
