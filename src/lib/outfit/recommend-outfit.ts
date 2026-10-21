import { Category, Occasion } from "../../constants/closet-item";
import { Outfit } from "../../types/outfits";
import { WeatherReport } from "../../types/weather";
import {
  findTargetWarmth,
  groupByCategory,
  hasRequiredItems,
  isFitForOccasion,
  isFitForWeather,
  needsOuterwear,
  pickRandom,
  warmthDifference,
} from "../../utils/outfit-helper";
import { ClosetItem } from "../db/schema";

const BASE_MATCH_SCORE = 100;
const FORMALITY_PENALTY = 10;

function filterByContext(
  items: ClosetItem[],
  weather?: WeatherReport,
  occasion?: Occasion,
): ClosetItem[] {
  return items.filter(
    (item) =>
      isFitForOccasion(item, occasion) && isFitForWeather(item, weather),
  );
}

function buildAllOutfits(
  closet: Record<Category, ClosetItem[]>,
  mustWearOuterwear: boolean | null,
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

function scoreOutfit(
  outfit: Outfit,
  targetWarmth: number,
  occasion?: Occasion,
): number {
  let score = BASE_MATCH_SCORE - warmthDifference(outfit, targetWarmth);

  if (occasion) {
    for (const item of Object.values(outfit)) {
      if (
        item &&
        item.formality !== null &&
        !occasion.preferredFormalities.includes(item.formality)
      ) {
        score -= FORMALITY_PENALTY;
      }
    }
  }
  return score;
}

// Scores every outfit and returns all that tie for the highest score
function selectBestOutfits(
  outfits: Outfit[],
  weather?: WeatherReport,
  occasion?: Occasion,
): Outfit[] {
  const targetWarmth = weather ? findTargetWarmth(weather.feelsLike) : 0;

  let bestScore = -Infinity;
  let best: Outfit[] = [];

  for (const outfit of outfits) {
    const score = scoreOutfit(outfit, targetWarmth, occasion);
    if (score > bestScore) {
      bestScore = score;
      best = [outfit];
    } else if (score === bestScore) {
      best.push(outfit);
    }
  }
  return best;
}

export function recommendBestOutfit(
  items: ClosetItem[],
  weather?: WeatherReport,
  occasion?: Occasion,
): Outfit | null {
  const allowedItems = filterByContext(items, weather, occasion);
  const closet = groupByCategory(allowedItems);

  if (!hasRequiredItems(closet)) return null;

  const requiresOuterwear = weather ? needsOuterwear(weather) : null;
  const allOutfits = buildAllOutfits(closet, requiresOuterwear);
  const bestOutfits = selectBestOutfits(allOutfits);

  return pickRandom(bestOutfits) ?? null;
}
