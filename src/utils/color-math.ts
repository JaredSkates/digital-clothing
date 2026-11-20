import { VISUAL_AREA_WEIGHT } from "@/config/weights";
import { ACHROMATIC_EPSILON, VIVID_CHROMA_MINIMUM } from "@/constants/closet";
import type {
  ColorFamily,
  ColorReadyItem,
  ColorTrait,
  OklchColor,
  Outfit,
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
  const earthMax = isLight || isDark ? 0.07 : 0.14;

  return hue >= 30 && hue <= 135 && chroma <= earthMax;
}

function isNeutralColor(
  chroma: number,
  isLight: boolean,
  isDark: boolean,
  isEarth: boolean,
): boolean {
  if (isEarth) return true;
  if (isLight && chroma <= 0.04) return true;
  if (isDark && chroma < 0.08) return true;
  if (chroma <= 0.03) return true;

  return false;
}

function isAchromaticColor({
  isLight,
  isDark,
  brightness,
}: {
  isLight: boolean;
  isDark: boolean;
  brightness: ColorTrait;
}) {
  const colorFamily: ColorFamily = isLight
    ? "white"
    : isDark
      ? "black"
      : "gray";

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

export function classifyColor(color: OklchColor) {
  const { lightness, chroma, hue } = color;

  const isLight = lightness >= 0.7;
  const isDark = lightness <= 0.4;

  const brightness = isLight ? "light" : isDark ? "dark" : "midtone";

  // Achromatic colors. (chroma is near zero)
  if (chroma <= ACHROMATIC_EPSILON || hue === null) {
    return isAchromaticColor({ isLight, isDark, brightness });
  }

  // Saturation
  const isVivid = chroma >= VIVID_CHROMA_MINIMUM;
  const isMuted = !isVivid;
  const isEarth = isEarthTone(hue, chroma, isLight, isDark);
  const isNeutral = isNeutralColor(chroma, isLight, isDark, isEarth);

  // Temperature
  const isWarm = hue <= 120 || hue >= 330;
  const isCool = hue >= 135 && hue <= 310;

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

export function prepareOutfit(outfit: Outfit): ColorReadyItem[] {
  const preparedItems: ColorReadyItem[] = [];

  for (const item of Object.values(outfit)) {
    if (!item || item.category === "accessory") continue;

    const oklch = hexToOklch(item.colorHex);
    const stats = classifyColor(oklch);
    const role = stats.traits;
    const family = stats.colorFamily;
    const visualAreaWeight = VISUAL_AREA_WEIGHT[item.category] ?? 0;

    preparedItems.push({
      item,
      oklch,
      colorRole: role,
      colorFamily: family,
      visualAreaWeight,
    });
  }

  return preparedItems;
}
