import { BODY_WARMTH_WEIGHTS } from "@/config/weights";
import { COLD_FALLOFF, HOT_FALLOFF } from "@/constants/closet";
import type { ClosetItemType, Outfit, RegionValues } from "@/types";

export function findTargetWarmth(feelsLike: number): number {
  if (feelsLike >= 85) return 1;
  else if (feelsLike >= 65) return 2;
  else if (feelsLike >= 45) return 3;
  return 4;
}

export function findTargetRain(rainAmount: number): number {
  if (rainAmount === 0) return 0;
  if (rainAmount < 2.5) return 1;
  if (rainAmount < 10) return 2;
  return 3;
}

// Wind speed is measured in miles per hour.
export function findTargetWind(windSpeed: number): number {
  if (windSpeed < 9) return 0;
  if (windSpeed < 16) return 1;
  if (windSpeed < 23) return 2;
  return 3;
}

// one step under always costs about 0.33 and one step over costs 0.25
export function scoreWarmthDifference(warmth: number, target: number): number {
  const delta = warmth - target; // negative = underdressed
  const distance = Math.abs(delta);
  const falloff = delta < 0 ? COLD_FALLOFF : HOT_FALLOFF;

  return Math.max(0, 1 - distance / falloff);
}

export function scoreRegions(
  protection: RegionValues,
  target: number,
  warmth: boolean,
  weights: RegionValues = BODY_WARMTH_WEIGHTS,
): number {
  if (target === 0 && !warmth) return 1;

  const score = (value: number) =>
    warmth ? scoreWarmthDifference(value, target) : Math.min(value / target, 1);

  return (
    score(protection.upperBody) * weights.upperBody +
    score(protection.lowerBody) * weights.lowerBody +
    score(protection.feet) * weights.feet
  );
}

export function getWarmth(outfit: Outfit): RegionValues {
  const warmth = (item: ClosetItemType | undefined) => item?.warmth ?? 0;

  return {
    upperBody:
      warmth(outfit.top) + warmth(outfit.outerwear) + warmth(outfit.onePiece),

    lowerBody: warmth(outfit.bottom) + warmth(outfit.onePiece),

    feet: warmth(outfit.footwear),
  };
}

type ProtectionKey = "windResistance" | "waterResistance";

export function getProtectionValues(
  outfit: Outfit,
  key: ProtectionKey,
): RegionValues {
  const value = (item: ClosetItemType | undefined) => item?.[key] ?? 0;

  return {
    upperBody: value(outfit.outerwear) + value(outfit.top ?? outfit.onePiece),
    lowerBody: value(outfit.bottom ?? outfit.onePiece),
    feet: value(outfit.footwear),
  };
}
