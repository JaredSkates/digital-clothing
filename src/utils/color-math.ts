import { CFG } from "@/config/weights";
import { VIVID_CHROMA_MINIMUM } from "@/constants/closet";
import type {
  Adjustment,
  ColorFamily,
  ColorReadyItem,
  ColorTrait,
  OklchColor,
} from "@/types";

export function isValidHexCode(hexCode: string): boolean {
  const cleanedHex = hexCode.trim().replace(/^#/, "");
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleanedHex);
}

function normalizeHexToSixDigits(hexCode: string): string {
  if (!isValidHexCode(hexCode)) {
    throw new Error(`Invalid hex color: "${hexCode}"`);
  }

  const cleanedHex = hexCode.trim().replace(/^#/, "");

  if (cleanedHex.length === 3) {
    return cleanedHex
      .split("")
      .map((character) => character + character)
      .join("");
  }

  return cleanedHex;
}

function roundToDecimals(value: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

function srgbChannelToLinear(channelValue: number): number {
  // converts into its corresponding linear light value
  // between 0.0 (black) to 1.0 (full intensity)
  if (channelValue <= 0.04045) {
    return channelValue / 12.92;
  }
  return Math.pow((channelValue + 0.055) / 1.055, 2.4);
}

function hexToLinearRgb(hexCode: string): {
  linearRed: number;
  linearGreen: number;
  linearBlue: number;
} {
  const cleanedHex = normalizeHexToSixDigits(hexCode);

  const redSrgb = parseInt(cleanedHex.slice(0, 2), 16) / 255.0;
  const greenSrgb = parseInt(cleanedHex.slice(2, 4), 16) / 255.0;
  const blueSrgb = parseInt(cleanedHex.slice(4, 6), 16) / 255.0;

  return {
    linearRed: srgbChannelToLinear(redSrgb),
    linearGreen: srgbChannelToLinear(greenSrgb),
    linearBlue: srgbChannelToLinear(blueSrgb),
  };
}

export function hexToOklch(hexCode: string): OklchColor {
  const { linearRed, linearGreen, linearBlue } = hexToLinearRgb(hexCode);

  // Step 1: Convert Linear RGB to LMS cone responses (Ottosson's OKLab matrix)
  const longCone =
    0.4122214708 * linearRed +
    0.5363325363 * linearGreen +
    0.0514459929 * linearBlue;

  const mediumCone =
    0.2119034982 * linearRed +
    0.6806995451 * linearGreen +
    0.1073969566 * linearBlue;

  const shortCone =
    0.0883024619 * linearRed +
    0.2817188376 * linearGreen +
    0.6299787005 * linearBlue;

  // Step 2: Apply cube-root non-linearity
  const longCompressed = Math.cbrt(longCone);
  const mediumCompressed = Math.cbrt(mediumCone);
  const shortCompressed = Math.cbrt(shortCone);

  // Step 3: Convert to OKLab coordinates
  const lightness =
    0.2104542553 * longCompressed +
    0.793617785 * mediumCompressed -
    0.0040720468 * shortCompressed;

  const greenRedAxis =
    1.9779984951 * longCompressed -
    2.428592205 * mediumCompressed +
    0.4505937099 * shortCompressed;

  const blueYellowAxis =
    0.0259040371 * longCompressed +
    0.7827717662 * mediumCompressed -
    0.808675766 * shortCompressed;

  // Step 4: Convert OKLab Cartesian coordinates into OKLCH polar coordinates
  const chroma = Math.sqrt(
    greenRedAxis * greenRedAxis + blueYellowAxis * blueYellowAxis,
  );

  const rawDegrees = Math.atan2(blueYellowAxis, greenRedAxis) * (180 / Math.PI);
  const normalizedHue = ((rawDegrees % 360) + 360) % 360;

  return {
    lightness: roundToDecimals(lightness, 3),
    chroma: roundToDecimals(chroma, 3),
    hue: roundToDecimals(normalizedHue, 1),
  };
}

// ============================ Roles & Families ============================

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
export function round2(value: number): number {
  return Number(value.toFixed(2));
}
export function sumDeltas(adjustments: Adjustment[]): number {
  return adjustments.reduce((total, adj) => total + adj.delta, 0);
}
export function hueGap(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}
const DEG_TO_RAD = Math.PI / 180;

export function scoreHueDistance(deg: number): number {
  const rad = deg * DEG_TO_RAD;

  // this is different from the main base score as hue distance works best with two hues
  // With the bonus is should add up close to the main base score
  const BaseScore = 0.7;
  // 1. Small bonus for colors that are close to the exact same color (peaks at 0°)
  const sameColorBonus = 0.05 * Math.cos(rad);
  // 2. Bigger bonus for colors at the two extremes: exact match (0°) OR total opposite (180°)
  //    (Automatically punishes awkward in-between colors around 90° or pi/2)
  const matchOrOppositeBonus = 0.2 * Math.cos(2 * rad);

  const totalScore = BaseScore + sameColorBonus + matchOrOppositeBonus;
  return clamp01(totalScore);
}
export function getLightnessSpread(items: ColorReadyItem[]): number {
  if (items.length < 2) return 0;
  const values = items.map((item) => item.oklch.lightness);
  return Math.max(...values) - Math.min(...values);
}

// three hues spread evenly around the wheel (~120 degrees apart)
export function isTriadic(hues: number[]) {
  if (hues.length !== 3) return false;
  const [h1, h2, h3] = hues;
  const gaps = [hueGap(h1, h2), hueGap(h1, h3), hueGap(h2, h3)];

  return gaps.every((gap) => Math.abs(gap - 120) <= CFG.triadicTolerance);
}
export function isSplitComplementary(hues: number[]): boolean {
  if (hues.length !== 3) return false;

  const [h1, h2, h3] = hues;
  const from1to2 = hueGap(h1, h2);
  const from1to3 = hueGap(h1, h3);
  const from2to3 = hueGap(h2, h3);

  const nearTarget = (gap: number) => Math.abs(gap - 150) <= 35;

  // Check each hue in turn as the base hue (two ~150° gaps from it).
  const h1IsBase = nearTarget(from1to2) && nearTarget(from1to3);
  const h2IsBase = nearTarget(from1to2) && nearTarget(from2to3);
  const h3IsBase = nearTarget(from1to3) && nearTarget(from2to3);

  return h1IsBase || h2IsBase || h3IsBase;
}
// ----- helper functions -------

export function getHueFamily(hue: number): ColorFamily {
  if (hue < 30) return "red";
  if (hue < 80) return "orange";
  if (hue < 114) return "yellow";
  if (hue < 165) return "green";
  if (hue < 275) return "blue";
  if (hue < 330) return "purple";

  return "red";
}
function isEarthTone(
  hue: number,
  chroma: number,
  isLight: boolean,
  isDark: boolean,
): boolean {
  const earthMax = isLight || isDark ? 0.07 : 0.11;

  return hue >= 30 && hue <= 135 && chroma <= earthMax;
}
function isNeutralColor(
  chroma: number,
  isLight: boolean,
  isDark: boolean,
  isEarth: boolean,
  isCool: boolean,
): boolean {
  if (chroma <= 0.035) return true; // near-gray
  if (isLight && chroma <= 0.05) return true; // cream, off-white
  if (isEarth) return true; // brown, tan, khaki (already chroma-capped)
  if (isDark && isCool && chroma <= 0.09) return true; // navy, charcoal-blue
  if (isDark && chroma <= 0.04) return true; // near-black

  return false;
}
function isAchromaticColor({
  lightness,
  brightness,
}: {
  lightness: number;
  brightness: ColorTrait;
}) {
  const colorFamily: ColorFamily =
    lightness >= 0.9 ? "white" : lightness < 0.3 ? "black" : "gray";
  const traits: ColorTrait[] = ["achromatic", "neutral", brightness];

  return {
    colorFamily,
    label: traits.join("-"),
    traits,
  };
}
function readjustColorFamily({
  colorFamily,
  isCool,
  isWarm,
  isLight,
  isEarth,
  isMuted,
}: {
  colorFamily: ColorFamily;
  isCool: boolean;
  isWarm: boolean;
  isLight: boolean;
  isEarth: boolean;
  isMuted: boolean;
}) {
  if (colorFamily === "red" && isCool) return "purple";
  if (colorFamily === "purple" && isWarm) return "red";

  if (isEarth && isMuted) {
    if (colorFamily === "orange" || colorFamily === "yellow") {
      return isLight ? "beige" : "brown";
    }
  }

  return colorFamily;
}
// -----------------------------

export function classifyColor(color: OklchColor) {
  const { lightness, chroma, hue } = color;

  const isLight = lightness >= 0.73;
  const isDark = lightness <= 0.4;

  const brightness = isLight ? "light" : isDark ? "dark" : "midtone";

  // Achromatic colors. (chroma is near zero)
  if (chroma <= 0.02 || hue === null) {
    return isAchromaticColor({ lightness, brightness });
  }

  // Temperature
  const isWarm = hue <= 120 || hue >= 330;
  const isCool = hue >= 135 && hue <= 310;

  // Saturation
  const isVivid = chroma >= VIVID_CHROMA_MINIMUM;
  const isMuted = !isVivid;
  const isEarth = isEarthTone(hue, chroma, isLight, isDark);
  const isNeutral = isNeutralColor(chroma, isLight, isDark, isEarth, isCool);

  // Color family
  let colorFamily: ColorFamily = getHueFamily(hue);
  colorFamily = readjustColorFamily({
    colorFamily,
    isCool,
    isWarm,
    isLight,
    isEarth,
    isMuted,
  });

  // Traits
  const traits: ColorTrait[] = [];

  traits.push(isVivid ? "vivid" : "muted");
  traits.push(brightness);

  if (isEarth) traits.push("earth");
  if (isNeutral) traits.push("neutral");
  if (isWarm) traits.push("warm");
  if (isCool) traits.push("cool");

  return {
    colorFamily,
    label: traits.join("-"),
    traits,
  };
}
