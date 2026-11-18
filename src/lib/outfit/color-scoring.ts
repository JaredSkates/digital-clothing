import { ColorReadyItem } from "@/types";
import {
  ACCENT_SCORE,
  ANALOGOUS_MAXIMUM_ARC,
  COMPLEMENTARY_HUE_TOLERANCE,
  COMPLEMENTARY_MINIMUM_ANGLE,
  FOCAL_ACCENT_MAXIMUM_AREA,
  HARMONY_SCORE,
  LIGHTNESS_SCORE,
  LIGHTNESS_SPREAD,
  MONOCHROMATIC_MAXIMUM_ARC,
  TRIADIC_HUE_TOLERANCE,
} from "../../constants/closet";
import {
  calculateShortestHueAngle,
  calculateSmallestArcCoveringHues,
} from "../../utils/color-math";

// ---------- Hue harmony ----------

function areAllHuesNearAnyAnchor(
  hues: number[],
  anchorHues: number[],
  toleranceDegrees: number,
): boolean {
  return hues.every((hue) =>
    anchorHues.some(
      (anchorHue) =>
        calculateShortestHueAngle(hue, anchorHue) <= toleranceDegrees,
    ),
  );
}

function isComplementaryOrSplitComplementary(hues: number[]): boolean {
  for (let firstIndex = 0; firstIndex < hues.length; firstIndex++) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < hues.length;
      secondIndex++
    ) {
      const angleBetween = calculateShortestHueAngle(
        hues[firstIndex],
        hues[secondIndex],
      );
      if (angleBetween < COMPLEMENTARY_MINIMUM_ANGLE) continue;

      const hasOnlyTwoHueFamilies = areAllHuesNearAnyAnchor(
        hues,
        [hues[firstIndex], hues[secondIndex]],
        COMPLEMENTARY_HUE_TOLERANCE,
      );
      if (hasOnlyTwoHueFamilies) return true;
    }
  }
  return false;
}

function isTriadic(hues: number[]): boolean {
  if (hues.length < 3) return false;

  return hues.some((startingHue) => {
    const anchors = [
      startingHue,
      (startingHue + 120) % 360,
      (startingHue + 240) % 360,
    ];
    const everyHueFits = areAllHuesNearAnyAnchor(
      hues,
      anchors,
      TRIADIC_HUE_TOLERANCE,
    );
    const everyAnchorUsed = anchors.every((anchor) =>
      hues.some(
        (hue) =>
          calculateShortestHueAngle(hue, anchor) <= TRIADIC_HUE_TOLERANCE,
      ),
    );
    return everyHueFits && everyAnchorUsed;
  });
}

export function scoreHueHarmony(items: ColorReadyItem[]): {
  score: number;
  scheme: string;
} {
  const chromaticHues = items
    .filter((entry) => entry.colorRole !== "neutral")
    .map((entry) => entry.oklch.hue);

  if (chromaticHues.length <= 1) {
    return {
      score: HARMONY_SCORE.neutralAnchored,
      scheme: "neutral base with at most one color",
    };
  }

  const smallestArc = calculateSmallestArcCoveringHues(chromaticHues);

  if (smallestArc <= MONOCHROMATIC_MAXIMUM_ARC) {
    return { score: HARMONY_SCORE.monochromatic, scheme: "monochromatic" };
  }
  if (smallestArc <= ANALOGOUS_MAXIMUM_ARC) {
    return { score: HARMONY_SCORE.analogous, scheme: "analogous" };
  }
  if (isComplementaryOrSplitComplementary(chromaticHues)) {
    return { score: HARMONY_SCORE.complementary, scheme: "complementary" };
  }
  if (isTriadic(chromaticHues)) {
    return { score: HARMONY_SCORE.triadic, scheme: "triadic" };
  }
  return { score: HARMONY_SCORE.unresolved, scheme: "unrelated hues" };
}

// ---------- Accent hierarchy (one statement piece, not five) ----------

export function scoreAccentHierarchy(items: ColorReadyItem[]): {
  score: number;
  vividCount: number;
} {
  const vividItems = items.filter((entry) => entry.colorRole === "vivid");

  if (vividItems.length === 0) {
    return { score: ACCENT_SCORE.noVividPieces, vividCount: 0 };
  }
  if (vividItems.length === 1) {
    const isSmallEnoughToBeAccent =
      vividItems[0].visualAreaWeight <= FOCAL_ACCENT_MAXIMUM_AREA;
    return {
      score: isSmallEnoughToBeAccent
        ? ACCENT_SCORE.focalAccent
        : ACCENT_SCORE.largeVividPiece,
      vividCount: 1,
    };
  }
  if (vividItems.length === 2) {
    return { score: ACCENT_SCORE.twoVividPieces, vividCount: 2 };
  }
  return {
    score: ACCENT_SCORE.threeOrMoreVividPieces,
    vividCount: vividItems.length,
  };
}

// ---------- Light/dark contrast ----------

export function scoreLightnessContrast(items: ColorReadyItem[]): number {
  const lightnessValues = items.map((entry) => entry.oklch.lightness);
  const spread = Math.max(...lightnessValues) - Math.min(...lightnessValues);

  if (spread < LIGHTNESS_SPREAD.flatBelow) return LIGHTNESS_SCORE.flat;
  if (spread < LIGHTNESS_SPREAD.subtleBelow) return LIGHTNESS_SCORE.subtle;
  if (spread <= LIGHTNESS_SPREAD.idealUpTo) return LIGHTNESS_SCORE.ideal;
  return LIGHTNESS_SCORE.stark;
}
