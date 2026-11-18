import {
  DARK_NEUTRAL_CHROMA_MAXIMUM,
  DARK_NEUTRAL_LIGHTNESS_MAXIMUM,
  EARTH_TONE_CHROMA_MAXIMUM,
  EARTH_TONE_HUE_MAXIMUM,
  EARTH_TONE_HUE_MINIMUM,
  EARTH_TONE_LIGHTNESS_MINIMUM,
  NEUTRAL_CHROMA_MAXIMUM,
  VIVID_CHROMA_MINIMUM,
} from "@/constants/closet";
import type { ColorRole, OklchColor } from "@/types";

export function isValidHexCode(hexCode: string): boolean {
  const cleanedHex = hexCode.trim().replace(/^#/, "");
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleanedHex);
}

export function isNeutralColor(color: OklchColor): boolean {
  return color.chroma < 0.045;
}

export function isVividColor(color: OklchColor): boolean {
  return color.chroma >= 0.13;
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

export function calculateShortestHueAngle(
  firstHue: number,
  secondHue: number,
): number {
  const rawDifference = Math.abs(firstHue - secondHue) % 360;
  if (rawDifference > 180) {
    return 360 - rawDifference;
  }
  return rawDifference;
}

// Smallest arc of the color wheel that contains every hue.
// Example: hues 350 and 10 give 20, not 340.
export function calculateSmallestArcCoveringHues(hues: number[]): number {
  if (hues.length <= 1) return 0;

  const sortedHues = [...hues].sort((first, second) => first - second);
  let largestGap = sortedHues[0] + 360 - sortedHues[sortedHues.length - 1];

  for (let index = 1; index < sortedHues.length; index++) {
    const gap = sortedHues[index] - sortedHues[index - 1];
    if (gap > largestGap) largestGap = gap;
  }
  return 360 - largestGap;
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

// ---------- Color roles ----------

// Neutral = what stylists treat as a base color: black, white, grey, beige,
// plus dark navy / brown / charcoal and warm earth tones (camel, tan, khaki).
export function classifyColorRole(color: OklchColor): ColorRole {
  const isPlainNeutral = color.chroma < NEUTRAL_CHROMA_MAXIMUM;

  const isDarkAndQuiet =
    color.lightness <= DARK_NEUTRAL_LIGHTNESS_MAXIMUM &&
    color.chroma < DARK_NEUTRAL_CHROMA_MAXIMUM;

  const isLightWarmEarthTone =
    color.lightness >= EARTH_TONE_LIGHTNESS_MINIMUM &&
    color.hue >= EARTH_TONE_HUE_MINIMUM &&
    color.hue <= EARTH_TONE_HUE_MAXIMUM &&
    color.chroma < EARTH_TONE_CHROMA_MAXIMUM;

  if (isPlainNeutral || isDarkAndQuiet || isLightWarmEarthTone) {
    return "neutral";
  }
  if (color.chroma >= VIVID_CHROMA_MINIMUM) {
    return "vivid";
  }
  return "muted";
}
