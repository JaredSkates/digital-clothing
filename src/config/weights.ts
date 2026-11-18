import type { Category, OutfitScoreBreakdown, RegionValues } from "@/types";

export const OUTFIT_SCORE_WEIGHTS = {
  styleRelevance: 0.15,
  formality: 0.3,
  weatherProtection: 0.35,
  colorHarmony: 0.2,
} satisfies Partial<Record<keyof OutfitScoreBreakdown, number>>;

export const WEATHER_SCORE_WEIGHTS = {
  warmth: 0.5,
  rain: 0.3,
  wind: 0.2,
} as const;

export const REGION_WEIGHTS: RegionValues = {
  upperBody: 0.4,
  lowerBody: 0.35,
  feet: 0.25,
};

export const COLOR_SUB_WEIGHTS = { harmony: 0.4, accent: 0.35, contrast: 0.25 };

// Share of visible garment area
export const VISUAL_AREA_WEIGHT: Partial<Record<Category, number>> = {
  top: 0.3,
  bottom: 0.3,
  onePiece: 0.65,
  outerwear: 0.3,
  footwear: 0.08,
};
