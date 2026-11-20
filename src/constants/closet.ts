// Accessories remain a closet category, but are not part of generated outfits yet.
export const CATEGORIES = [
  "top",
  "bottom",
  "onePiece",
  "outerwear",
  "footwear",
  "accessory",
] as const;

export const SUB_CATEGORIES = {
  top: [
    "t-shirt",
    "long-sleeve",
    "blouse",
    "button-down",
    "hoodie",
    "sweater",
    "cardigan",
    "other",
  ],
  bottom: [
    "shorts",
    "pants",
    "jeans",
    "skirt",
    "leggings",
    "sweatpants",
    "other",
  ],
  onePiece: ["dress", "jumpsuit", "other"],
  outerwear: ["jacket", "coat", "blazer", "other"],
  footwear: [
    "sneakers",
    "boots",
    "dress-shoes",
    "heels",
    "sandals",
    "loafers",
    "other",
  ],
  accessory: ["hat", "scarf", "bags", "belts", "jewelry", "other"],
} as const;

export const WARMTH_LEVELS = [
  { value: 0, label: "none" },
  { value: 1, label: "light" },
  { value: 2, label: "moderate" },
  { value: 3, label: "warm" },
  { value: 4, label: "very-warm" },
] as const;

export const WEATHER_RESISTANCE_LEVELS = [
  { value: 0, label: "none" },
  { value: 1, label: "low" },
  { value: 2, label: "medium" },
  { value: 3, label: "high" },
] as const;

export const FORMALITIES = [
  "casual",
  "smart-casual",
  "business-casual",
  "formal",
] as const;

export const STYLES = [
  "streetwear",
  "minimalist",
  "vintage",
  "alternative",
  "preppy",
  "athletic",
] as const;

export const FITS = ["slim", "regular", "relaxed", "oversized"] as const;

export const MATERIALS = [
  "cotton",
  "denim",
  "linen",
  "wool",
  "leather",
  "synthetic",
  "other",
] as const;

export const COLD_POINT = 65;
export const MAX_OUTFIT_SLOTS = 4;
export const TOP_K = 5;

// ---------- Color OKLCH ----------
export const ACHROMATIC_EPSILON = 1e-3;
export const MUTED_CHROMA_MAX = 0.04;
export const VIVID_CHROMA_MINIMUM = 0.14;

export const MONOCHROMATIC_MAXIMUM_ARC = 15;
export const ANALOGOUS_MAXIMUM_ARC = 75; // Increased from ~45° or 60° to capture broader analogous families
export const COMPLEMENTARY_HUE_TOLERANCE = 25; // Widened tolerance around the anchor poles
export const TRIADIC_HUE_TOLERANCE = 30; // Widened to allow minor hue shifts in 3-way palettes
export const TETRADIC_HUE_TOLERANCE = 25; // Tolerance for 4-color double-complementary palettes
export const HARMONY_SCORE = {
  neutralAnchored: 0.8,
  monochromatic: 1.0,
  analogous: 0.9,
  complementary: 0.95,
  splitComplementary: 0.9,
  tetradic: 0.85,
  coordinatedMultiColor: 0.75,
  unrelated: 0.4,
};
// A single vivid piece at or below this area share is a "focal accent".
export const FOCAL_ACCENT_MAXIMUM_AREA = 0.3;
export const ACCENT_SCORE = {
  noVividPieces: 0.85, // calm tonal outfit
  focalAccent: 1,
  largeVividPiece: 0.8,
  twoVividPieces: 0.65,
  threeOrMoreVividPieces: 0.4,
};

// Contrast between the lightest and darkest piece.
export const LIGHTNESS_SPREAD = {
  flatBelow: 0.15,
  subtleBelow: 0.3,
  idealUpTo: 0.7,
};
export const LIGHTNESS_SCORE = {
  flat: 0.45,
  subtle: 0.7,
  ideal: 1,
  stark: 0.85,
};

// Steps off target at which the score reaches 0.
export const COLD_FALLOFF = 3; // underdressed: steeper
export const HOT_FALLOFF = 4; // overdressed: more forgiving
