import { Outfit } from "@/types/outfits";
import { WeatherReport } from "@/types/weather";

const COLD_POINT = 65;

export function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export function totalWarmth(o: Outfit): number {
  return Object.values(o).reduce((sum, item) => sum + (item?.warmth ?? 0), 0);
}

export function needsOuterwear(w: WeatherReport): boolean {
  const cold = w.feelsLike < COLD_POINT;
  const wet = w.precipitationMode !== "no";

  return cold || wet;
}

export function findTargetWarmth(feelsLike: number): number {
  if (feelsLike >= 80) return 2;
  if (feelsLike >= 65) return 4;
  if (feelsLike >= 50) return 6;
  if (feelsLike >= 35) return 8;

  return 10;
}
