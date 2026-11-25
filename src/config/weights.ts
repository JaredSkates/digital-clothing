import type { OutfitScoreBreakdown, RegionValues } from "@/types";

export const OUTFIT_SCORE_WEIGHTS = {
  styleRelevance: 0.15,
  formality: 0.3,
  weatherProtection: 0.3,
  colorHarmony: 0.25,
} satisfies Partial<Record<keyof OutfitScoreBreakdown, number>>;

export const WEATHER_SCORE_WEIGHTS = {
  warmth: 0.4,
  rain: 0.3,
  wind: 0.3,
} as const;

export const BODY_WARMTH_WEIGHTS: RegionValues = {
  upperBody: 0.4,
  lowerBody: 0.4,
  feet: 0.2,
};

// Rain and wind hit the upper body hardest.
export const PROTECTION_WEIGHTS: RegionValues = {
  upperBody: 0.65,
  lowerBody: 0.25,
  feet: 0.1,
};

const COLOR_HARMONY_CONFIG = {
  // How visually large each category is. Shoes matter, but far less than a top.
  visualWeight: {
    top: 1,
    bottom: 1,
    onePiece: 1,
    outerwear: 0.8,
    footwear: 0.3,
  } as Record<string, number>,
  fallbackWeight: 0.5,

  analogousMaxGap: 40,
  complementaryMinGap: 145,
  triadicTolerance: 15,

  // --- clustering ---
  /** Hues within this many degrees count as "the same color". Keep well below analogousMaxGap. */
  clusterTolerance: 25,

  // --- base score per scheme (before adjustments) ---
  baseScore: 0.85,

  // --- score adjustments: positive = bonus (capped by maxBonus), negative = penalty ---
  adjust: {
    maxBonus: 0.1,
    colorPop: 0.05,
    goodContrast: 0.05,
    neutralBalance: 0.05,
    boldMood: 0.05,
    tooManyVivid: -0.1,
    calmButBright: -0.05,
  },

  // --- what triggers an adjustment ---
  threshold: {
    contrastSpread: 0.35, // lightness spread for the contrast bonus
    tooManyVivid: 2, // vivid pieces before the penalty
    calmMoodVivid: 1, // vivid pieces that clash with a calm mood
  },
} as const;

export const CFG = COLOR_HARMONY_CONFIG;
