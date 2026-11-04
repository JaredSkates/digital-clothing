import { describe, expect, it } from "vitest";
import {
  OCCASIONS,
  type Category,
  type SubCategory,
} from "../../constants/closet-item";
import type { ClosetItemType } from "../db/schema";
import type { Outfit } from "../../types/outfits";
import {
  occasionPenalty,
  totalWarmth,
  warmthDifference,
  weatherPenalty,
} from "../../utils/outfit-helper";
import {
  chooseFromBest,
  filterEligibleItems,
  generateCandidateOutfits,
  isValidOutfit,
  rankOutfits,
  recommendBestOutfit,
} from "./recommend-outfit";

let nextId = 0;

function makeItem(
  category: Category,
  subCategory: SubCategory,
  warmth: number | null = null,
): ClosetItemType {
  nextId += 1;
  return {
    id: `item-${nextId}`,
    name: `Item ${nextId}`,
    imgUri: "",
    category,
    subCategory,
    color: null,
    material: null,
    fit: null,
    formality: null,
    size: null,
    warmth,
    wornCount: 0,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    deletedAt: null,
  };
}

describe("outfit recommendation stages", () => {
  it("filters excluded items while leaving other subcategories eligible", () => {
    const shorts = makeItem("bottom", "shorts");
    const other = makeItem("bottom", "other");

    expect(
      filterEligibleItems([shorts, other], { occasion: OCCASIONS[2] }),
    ).toEqual([other]);
  });

  it("generates category-based candidates and validates required outerwear", () => {
    const top = makeItem("top", "t-shirt");
    const bottom = makeItem("bottom", "pants");
    const outerwear = makeItem("outerwear", "jacket");
    const candidates = generateCandidateOutfits([top, bottom, outerwear]);
    const coldContext = {
      weather: {
        temp: 40,
        feelsLike: 40,
        description: "",
        high: 40,
        low: 40,
        precipitationMode: "no",
        locationName: "",
      },
    };

    expect(candidates).toHaveLength(2);
    expect(candidates.every((candidate) => candidate.top === top)).toBe(true);
    expect(candidates.every((candidate) => candidate.bottom === bottom)).toBe(
      true,
    );
    expect(
      candidates.filter((candidate) => isValidOutfit(candidate, coldContext)),
    ).toEqual([expect.objectContaining({ outerwear })]);
  });

  it("ranks by existing scores and chooses a tied best outfit deterministically", () => {
    const top = makeItem("top", "t-shirt", 2);
    const warmerTop = makeItem("top", "long-sleeve", 0);
    const bottom = makeItem("bottom", "pants", 0);
    const outfits: Outfit[] = [
      { top: warmerTop, bottom },
      { top, bottom },
    ];
    const context = {
      weather: {
        temp: 80,
        feelsLike: 80,
        description: "",
        high: 80,
        low: 80,
        precipitationMode: "no",
        locationName: "",
      },
    };

    const ranked = rankOutfits(outfits, context);

    expect(ranked[0].outfit).toBe(outfits[1]);
    expect(chooseFromBest(ranked, () => 0)).toBe(outfits[1]);
    expect(chooseFromBest([], () => 0)).toBeNull();
  });

  it("does not interpret missing warmth as zero", () => {
    const outfit: Outfit = {
      top: makeItem("top", "t-shirt", null),
      bottom: makeItem("bottom", "pants", 2),
    };
    const weather = {
      temp: 80,
      feelsLike: 80,
      description: "",
      high: 80,
      low: 80,
      precipitationMode: "no",
      locationName: "",
    };

    expect(totalWarmth(outfit)).toBeNull();
    expect(warmthDifference(outfit, 2)).toBeNull();
    expect(weatherPenalty(outfit, weather)).toBe(0);
  });

  it("does not penalize an outfit when an item's formality is unknown", () => {
    const outfit: Outfit = {
      top: makeItem("top", "t-shirt"),
      bottom: makeItem("bottom", "pants"),
    };

    expect(occasionPenalty(outfit, OCCASIONS[4])).toBe(0);
  });

  it("runs the stages in order and returns null when required items are absent", () => {
    const top = makeItem("top", "t-shirt");
    const pants = makeItem("bottom", "pants");
    const shorts = makeItem("bottom", "shorts");

    expect(recommendBestOutfit([top, pants, shorts], undefined, OCCASIONS[2]))
      .toMatchObject({ top, bottom: pants });
    expect(recommendBestOutfit([top])).toBeNull();
  });
});
