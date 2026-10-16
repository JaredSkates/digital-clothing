import { Category } from "@/constants/clothing";
import { Outfit } from "@/types/outfits";
import { WeatherReport } from "@/types/weather";
import {
  findTargetWarmth,
  needsOuterwear,
  pickRandom,
  totalWarmth,
} from "../../utils/outfit-helper";
import { Clothing } from "../db/schema";

function splitByCategory(items: Clothing[]): Record<Category, Clothing[]> {
  const categories: Record<Category, Clothing[]> = {
    top: [],
    bottom: [],
    outerwear: [],
    footwear: [],
    accessory: [],
  };

  for (const item of items) {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  }

  return categories;
}

function makeOutfits(
  closet: Record<Category, Clothing[]>,
  mustWearOuterwear: boolean,
): Outfit[] {
  const outerwearOptions = mustWearOuterwear
    ? closet.outerwear
    : [undefined, ...closet.outerwear];

  return closet.top.flatMap((top) =>
    closet.bottom.flatMap((bottom) =>
      outerwearOptions.map((outerwear) => ({ top, bottom, outerwear })),
    ),
  );
}

export function recommendBestOutfit(items: Clothing[], weather: WeatherReport) {
  const closet = splitByCategory(items);

  // required for an outfit
  if (closet.top.length === 0 || closet.bottom.length === 0) return null;

  // all possible outfits (top, bottom, outerwear?)
  const allCombos = makeOutfits(closet, needsOuterwear(weather));

  // filter by context (weather only for now)
  const targetWarmth = findTargetWarmth(weather.feelsLike);
  const eligibleCombos = allCombos.filter(
    (outfit) => Math.abs(totalWarmth(outfit) - targetWarmth) <= 1,
  );

  if (eligibleCombos.length === 0) return null; // nothing to wear

  // randomly pick from the survivors
  return pickRandom(eligibleCombos);
}
