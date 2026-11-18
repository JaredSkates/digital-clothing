import type { OutfitScoreBreakdown } from "@/types";

export const OUTFIT_SCORE_WEIGHTS = {
  styleRelevance: 0.36,
  formality: 0.315,
  weatherSuitability: 0.225,
  colorHarmony: 0.1,
} satisfies Partial<Record<keyof OutfitScoreBreakdown, number>>;

export const WEATHER_SCORE_WEIGHTS = {
  warmth: 0.5,
  rain: 0.3,
  wind: 0.2,
} as const;
