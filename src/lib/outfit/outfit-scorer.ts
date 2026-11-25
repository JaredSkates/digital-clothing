import { OUTFIT_SCORE_WEIGHTS } from "@/config/weights";
import type { ClosetItemType, Outfit, OutfitScoreBreakdown } from "@/types";
import { listOutfitItems } from "@/utils/outfit-helper";

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
    if (numericScore === null || numericScore === undefined) continue;

    total += numericScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;

  return total / totalWeight;
}
