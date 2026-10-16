import { WeatherReport } from "@/types/weather";
import { Clothing } from "../db/schema";

// const COLD_POINT = 65;

// function needsOuterwear(w: WeatherReport): boolean {
//   const cold = w.feelsLike < COLD_POINT;
//   const wet = w.precipitationMode !== "no";

//   return cold || wet;
// }

type Outfit = { top: Clothing; bottom: Clothing };

function splitByCategory(items: Clothing[]) {
  const tops: Clothing[] = [];
  const bottoms: Clothing[] = [];

  for (const item of items) {
    if (item.category === "top") tops.push(item);
    else if (item.category === "bottom") bottoms.push(item);
  }

  return { tops, bottoms };
}

function totalWarmth(o: Outfit): number {
  return (o.top.warmth ?? 0) + (o.bottom.warmth ?? 0);
}

function findTargetWarmth(feelsLike: number): number {
  if (feelsLike >= 80) return 2;
  if (feelsLike >= 65) return 4;
  if (feelsLike >= 50) return 6;
  if (feelsLike >= 35) return 8;

  return 10;
}

function makeOutfits(tops: Clothing[], bottoms: Clothing[]) {
  const outfits: Outfit[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      outfits.push({ top, bottom });
    }
  }

  return outfits;
}

export function recommendBestOutfit(items: Clothing[], weather: WeatherReport) {
  const { tops, bottoms } = splitByCategory(items);

  // find every combinations
  const allCombos = makeOutfits(tops, bottoms);

  // filter by context (weather only for now)
  const target = findTargetWarmth(weather.feelsLike);
  const eligibleCombos = allCombos.filter(
    (o) => Math.abs(totalWarmth(o) - target) <= 1,
  );
  if (eligibleCombos.length === 0) return null; // nothing to wear

  // score outfits (later)

  // randomly pick from the survivors
  return eligibleCombos[Math.floor(Math.random() * eligibleCombos.length)];
}
