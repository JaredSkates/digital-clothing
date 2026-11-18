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
