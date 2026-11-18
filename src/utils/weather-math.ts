import { REGION_WEIGHTS } from "@/config/weights";
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
): number {
  if (target === 0) return 1;

  if (warmth === true) {
    return (
      scoreWarmthDifference(protection.upperBody, target) *
        REGION_WEIGHTS.upperBody +
      scoreWarmthDifference(protection.lowerBody, target) *
        REGION_WEIGHTS.lowerBody +
      scoreWarmthDifference(protection.feet, target) * REGION_WEIGHTS.feet
    );
  }

  return (
    Math.min(protection.upperBody / target, 1) * REGION_WEIGHTS.upperBody +
    Math.min(protection.lowerBody / target, 1) * REGION_WEIGHTS.lowerBody +
    Math.min(protection.feet / target, 1) * REGION_WEIGHTS.feet
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

export function getWindResistance(outfit: Outfit): RegionValues {
  const resistance = (item: ClosetItemType | undefined) =>
    item?.windResistance ?? 0;

  return {
    upperBody: resistance(outfit.outerwear ?? outfit.top ?? outfit.onePiece),

    lowerBody: resistance(outfit.bottom ?? outfit.onePiece),

    feet: resistance(outfit.footwear),
  };
}

export function getWaterResistance(outfit: Outfit): RegionValues {
  const resistance = (item: ClosetItemType | undefined) =>
    item?.waterResistance ?? 0;

  return {
    upperBody: resistance(outfit.outerwear ?? outfit.top ?? outfit.onePiece),

    lowerBody: resistance(outfit.bottom ?? outfit.onePiece),

    feet: resistance(outfit.footwear),
  };
}
