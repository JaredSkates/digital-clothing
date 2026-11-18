import type {
  CATEGORIES,
  FITS,
  FORMALITIES,
  MATERIALS,
  STYLES,
  SUB_CATEGORIES,
  WARMTH_LEVELS,
  WEATHER_RESISTANCE_LEVELS,
} from "@/constants/closet";
import type { ClosetItem, SavedOutfit } from "@/lib/db/schema";

export type Category = (typeof CATEGORIES)[number];
export type ItemCategory = Exclude<Category, "accessory">;
export type SubCategory = (typeof SUB_CATEGORIES)[Category][number];
export type Formality = (typeof FORMALITIES)[number];
export type Style = (typeof STYLES)[number];
export type Fit = (typeof FITS)[number];
export type Material = (typeof MATERIALS)[number];

export type WarmthLevel = (typeof WARMTH_LEVELS)[number]["value"]; // 0 | 1 | 2 | 3 | 4
export type WeatherResistance =
  (typeof WEATHER_RESISTANCE_LEVELS)[number]["value"]; // 0 | 1 | 2 | 3

export type ClosetItemFormInput = {
  name: string;
  category: Category | "";
  imgUri: string | null;
};

export type ClosetItemType = typeof ClosetItem.$inferSelect;
export type NewClosetItemType = typeof ClosetItem.$inferInsert;

export type Outfit = {
  top?: ClosetItemType;
  bottom?: ClosetItemType;
  onePiece?: ClosetItemType;
  outerwear?: ClosetItemType;
  shoes?: ClosetItemType;
};

export type OutfitScoreBreakdown = {
  styleRelevance: number | null;
  formality: number | null;
  weatherSuitability: number | null;
  colorHarmony: ColorHarmonyResult | null;
  silhouette: number | null;
  materialCompatibility: number | null;
};

export type SavedOutfitType = typeof SavedOutfit.$inferSelect;
export type NewSavedOutfitType = typeof SavedOutfit.$inferInsert;

export type OccasionType =
  | "everyday"
  | "school"
  | "work"
  | "date"
  | "interview"
  | "party"
  | "gym";

export interface OccasionPreset {
  id: OccasionType;
  name: string;
  bannedSubCategories: SubCategory[];
  preferredFormalities: Formality[];
  preferredStyles: Style[];
}

export interface OklchColor {
  lightness: number;
  chroma: number;
  hue: number;
}

export interface ColorHarmonyResult {
  score: number;
  detectedScheme: string;
  neutralsDetected: string[];
  subScores: {
    lightnessContrast: string;
    chromaHierarchy: string;
    hueHarmony: string;
    visualProportions: string;
  };
  convertedOklchColors: Record<string, OklchColor>;
}
