import { CFG } from "@/config/weights";
import type {
  Adjustment,
  ColorHarmonyOptions,
  ColorReadyItem,
  ColorScheme,
  ColorScoreResult,
  Outfit,
} from "@/types";
import {
  clamp01,
  classifyColor,
  getLightnessSpread,
  hexToOklch,
  hueGap,
  isSplitComplementary,
  isTriadic,
  round2,
  scoreHueDistance,
  sumDeltas,
} from "@/utils/color-math";

/* ============================================================================
 * Color harmony scorer
 *   1. PREPARE      OKLCH + classification + visual weight per piece
 *   2. SPLIT        achromatics (white/gray/black) vs chromatic pieces
 *   3. CLUSTER      group chromatic hues that read as "the same color"
 *   4. NAME + BASE  name the scheme, score it with one smooth hue curve
 *   5. ADJUST       vivid count, light/dark contrast, neutral anchor, taste
 *   6. RESULT       { score, scheme, notes[], breakdown }
 *
 * Every number you may want to tune is in CFG (@/config/weights).
 * ========================================================================== */

/* ------------------------------- 1. PREPARE ------------------------------- */

const hasTrait = (
  object: ColorReadyItem,
  trait: ColorReadyItem["colorRole"][number],
) => object.colorRole.includes(trait);

const isVividPiece = (piece: ColorReadyItem) => hasTrait(piece, "vivid");

export function prepareOutfit(outfit: Outfit): ColorReadyItem[] {
  const preparedItems: ColorReadyItem[] = [];

  for (const item of Object.values(outfit)) {
    if (!item || item.category === "accessory" || !item.colorHex) continue;

    const oklch = hexToOklch(item.colorHex);
    const { colorFamily, traits } = classifyColor(oklch);
    const visualWeight = CFG.visualWeight[item.category] ?? CFG.fallbackWeight;

    preparedItems.push({
      item,
      oklch,
      colorFamily,
      colorRole: traits,
      visualWeight,
    });
  }

  // bring the biggest visual weights towards the front
  return preparedItems.sort((a, b) => b.visualWeight - a.visualWeight);
}

/* ------------------------------- 2. SPLIT --------------------------------- */

// Only true achromatics (white, gray, black) stay off the wheel.
// Navy, brown, tan etc. keep their hue and get clustered.
function separateAchromatics(outfit: ColorReadyItem[]) {
  const achromatics = outfit.filter((p) => hasTrait(p, "achromatic"));
  const chromatics = outfit.filter((p) => !hasTrait(p, "achromatic"));
  return { achromatics, chromatics };
}

/* ------------------------------- 3. CLUSTER ------------------------------- */

// One hue per cluster. A piece joins a cluster if it is within `tolerance` degrees
export function getHueClusters(
  chromatics: ColorReadyItem[],
  tolerance = CFG.clusterTolerance,
) {
  const hues: number[] = [];

  for (const { oklch } of chromatics) {
    const belongsToCluster = hues.some(
      (h) => hueGap(h, oklch.hue) <= tolerance,
    );
    if (!belongsToCluster) hues.push(oklch.hue);
  }

  return hues;
}

/* ------------------------------ 4. NAME + BASE ----------------------------- */

function getBaseScheme(
  clusters: number[],
  achromatics: ColorReadyItem[],
  chromatics: ColorReadyItem[],
  notes: string[],
): { scheme: ColorScheme; base: number } {
  // no hue clusters
  if (clusters.length === 0) {
    notes.push("All-neutral palette.");
    return { scheme: "neutral", base: CFG.baseScore };
  }

  // 1. one hue
  if (clusters.length === 1) {
    const isAccent = chromatics.length === 1 && achromatics.length > 0;

    notes.push(
      isAccent
        ? `Neutral base accented by ${chromatics[0].colorFamily}.`
        : "Single hue with varying lightness and chroma.",
    );

    return {
      scheme: isAccent ? "accented-neutral" : "monochromatic",
      base: CFG.baseScore,
    };
  }

  // 2. two hues
  if (clusters.length === 2) {
    const gap = hueGap(clusters[0], clusters[1]);
    const base = scoreHueDistance(gap);

    if (gap <= CFG.analogousMaxGap) {
      notes.push("Colors sit close together on the wheel.");
      return { scheme: "analogous", base };
    }

    if (gap >= CFG.complementaryMinGap) {
      notes.push("Colors sit across from each other for contrast.");
      return { scheme: "complementary", base };
    }

    notes.push("Multiple hues clash or compete.");
    return { scheme: "busy", base };
  }

  // 3. three or more hues: check the named schemes first
  if (isTriadic(clusters)) {
    notes.push("Three colors spaced evenly around the wheel.");
    return { scheme: "triadic", base: CFG.baseScore };
  }

  if (isSplitComplementary(clusters)) {
    notes.push("One base color, plus two colors beside its complement.");
    return {
      scheme: "split-complementary",
      base: CFG.baseScore,
    };
  }

  // 3+ clusters fallback: judged by the widest gap
  const maxGap = Math.max(
    ...clusters.flatMap((h1, i) =>
      clusters.slice(i + 1).map((h2) => hueGap(h1, h2)),
    ),
  );
  const base = scoreHueDistance(maxGap);

  if (maxGap <= CFG.analogousMaxGap) {
    notes.push("Colors sit close together on the wheel.");
    return { scheme: "analogous", base };
  }

  notes.push("Multiple hues clash or compete.");
  return { scheme: "busy", base };
}

/* ------------------------------ 5. ADJUST/NOTES ---------------------------- */

function applyAdjustments(
  preparedOutfit: ColorReadyItem[],
  hueCount: number,
  hasAchromatics: boolean,
  options: ColorHarmonyOptions,
  notes: string[],
): Adjustment[] {
  const adjustments: Adjustment[] = [];
  const mood = options.colorMood ?? "balanced";
  const vividCount = preparedOutfit.filter(
    (item) => isVividPiece(item) && item.visualWeight >= 0.3, // e.g., tops, bottoms, dresses, coats
  ).length;

  const add = (label: string, delta: number, note?: string) => {
    adjustments.push({ label, delta });
    if (note) notes.push(note);
  };

  if (hueCount === 1 && hasAchromatics && vividCount === 1) {
    add(
      "Color pop",
      CFG.adjust.colorPop,
      "One color stands out against neutrals.",
    );
  }

  if (vividCount >= CFG.threshold.tooManyVivid) {
    add(
      "Too many vivid pieces",
      CFG.adjust.tooManyVivid,
      "Several bright pieces compete.",
    );
  }

  if (getLightnessSpread(preparedOutfit) >= CFG.threshold.contrastSpread) {
    add("Good light/dark contrast", CFG.adjust.goodContrast);
  }

  if (hueCount >= 2 && hasAchromatics) {
    add(
      "Neutral balance",
      CFG.adjust.neutralBalance,
      "Neutrals tie the colors together.",
    );
  }

  if (mood === "calm" && vividCount >= CFG.threshold.calmMoodVivid) {
    add("Bright for a calm mood", CFG.adjust.calmButBright);
  } else if (mood === "bold" && vividCount >= 1) {
    add("Fits a bold mood", CFG.adjust.boldMood);
  }

  return adjustments;
}

/* --------------------------------- PUBLIC ---------------------------------- */

/**
 * Scores how well the colors of a whole outfit work together (0 to 1).
 * Returns `score: null` when no piece has a usable color, so callers can skip
 * it instead of counting it as a zero. Accessories are excluded (see prepareOutfit).
 */
export function scoreColorHarmony(
  outfit: Outfit,
  options: ColorHarmonyOptions = {},
): ColorScoreResult {
  const preparedOutfit = prepareOutfit(outfit);

  if (preparedOutfit.length === 0) {
    return {
      score: null,
      scheme: null,
      notes: [],
      breakdown: {
        base: 0,
        adjustments: [],
        clusters: [],
        achromatic: [],
        chromatic: [],
      },
    };
  }

  // 1. split achromatics and chromatics
  const { achromatics, chromatics } = separateAchromatics(preparedOutfit);

  // 2. cluster chromatic hues
  const clusters = getHueClusters(chromatics);

  // 3. name the scheme and get the base score
  const notes: string[] = [];
  const { scheme, base } = getBaseScheme(
    clusters,
    achromatics,
    chromatics,
    notes,
  );

  // 4. apply contrast, vividness, and taste adjustments
  const adjustments = applyAdjustments(
    preparedOutfit,
    clusters.length,
    achromatics.length > 0,
    options,
    notes,
  );

  // 5. result (bonuses are capped, penalties are not)
  const score = clamp01(
    round2(base + Math.min(sumDeltas(adjustments), CFG.adjust.maxBonus)),
  );

  return {
    score,
    scheme,
    notes,
    breakdown: {
      base: round2(base),
      adjustments,
      clusters,
      achromatic: achromatics.map((p) => p.item.category),
      chromatic: chromatics.map((p) => p.item.category),
    },
  };
}
