import type { OutfitScoreBreakdown } from "@/lib/outfit/outfit-scorer";
import type { ClosetItemType } from "@/types/closet-item";
import type { OccasionPreset } from "@/types/outfits";

export const WARMTH_LEVELS = {
  0: "No added warmth",
  1: "Very lightweight",
  2: "Lightweight / moderate",
  3: "Warm",
  4: "Very warm",
} as const;

export const MAX_WARMTH_LEVEL = 4;

// Accessories remain a closet category, but are not part of generated outfits yet.
export const CATEGORIES = [
  "top",
  "bottom",
  "outerwear",
  "footwear",
  "accessory",
] as const;

export const SUB_CATEGORIES = {
  top: ["t-shirt", "long-sleeve", "blouse", "dress-shirt", "other"],
  bottom: ["shorts", "pants", "jeans", "skirt", "leggings", "other"],
  outerwear: ["jacket", "coat", "sweater", "blazer", "other"],
  footwear: ["sneakers", "boots", "dress-shoes", "heels", "other"],
  accessory: ["hat", "scarf", "other"],
} as const;

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

export const OCCASION_PRESETS: OccasionPreset[] = [
  {
    id: "everyday",
    name: "Everyday",
    bannedSubCategories: [],
    preferredFormalities: ["casual", "smart-casual"],
    preferredStyles: [
      "streetwear",
      "minimalist",
      "vintage",
      "alternative",
      "athletic",
    ],
  },
  {
    id: "school",
    name: "School",
    bannedSubCategories: [],
    preferredFormalities: ["casual", "smart-casual"],
    preferredStyles: [
      "streetwear",
      "minimalist",
      "vintage",
      "preppy",
      "athletic",
    ],
  },
  {
    id: "work",
    name: "Work",
    bannedSubCategories: [],
    preferredFormalities: ["smart-casual", "business-casual"],
    preferredStyles: ["minimalist", "preppy", "vintage"],
  },
  {
    id: "date",
    name: "Date",
    bannedSubCategories: [],
    preferredFormalities: ["smart-casual", "casual"],
    preferredStyles: ["minimalist", "vintage", "alternative", "preppy"],
  },
  {
    id: "interview",
    name: "Interview",
    bannedSubCategories: ["shorts", "leggings"],
    preferredFormalities: ["business-casual", "formal"],
    preferredStyles: ["minimalist", "preppy"],
  },
  {
    id: "party",
    name: "Party",
    bannedSubCategories: [],
    preferredFormalities: ["smart-casual", "casual"],
    preferredStyles: ["streetwear", "vintage", "alternative", "preppy"],
  },
  {
    id: "gym",
    name: "Gym",
    bannedSubCategories: [
      "jeans",
      "pants",
      "skirt",
      "dress-shoes",
      "heels",
      "boots",
    ],
    preferredFormalities: [],
    preferredStyles: ["athletic"],
  },
];

export const SCORE_WEIGHTS = {
  styleRelevance: 0.4,
  formality: 0.35,
  weatherSuitability: 0.25,
} satisfies Partial<Record<keyof OutfitScoreBreakdown, number>>;

export const RESISTANCE_LEVELS = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
} satisfies Record<NonNullable<ClosetItemType["waterResistance"]>, number>;
