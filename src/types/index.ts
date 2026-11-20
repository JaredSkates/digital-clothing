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

// ---------- Frontend ---------
export type ClosetItemFormInput = {
  name: string;
  category: Category | "";
  imgUri: string | null;
};

// ----------- closet item data ------------------

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

export type ClosetItemType = typeof ClosetItem.$inferSelect;
export type NewClosetItemType = typeof ClosetItem.$inferInsert;

// ---------------- outfit -----------------

export type Outfit = Partial<Record<Category, ClosetItemType>>;

export type OutfitScoreBreakdown = {
  styleRelevance: number | null;
  formality: number | null;
  weatherProtection: number | null;
  colorHarmony: ColorScoreResult;
  silhouette: number | null;
  materialCompatibility: number | null;
};

export type ScoredOutfit = {
  outfit: Outfit;
  score: number; // 0 to 1
  breakdown: OutfitScoreBreakdown;
};

export type BodyRegion = "upperBody" | "lowerBody" | "feet";

export type RegionValues = Record<BodyRegion, number>;

// ------------------ occasion ----------------------

export type OccasionType =
  | "everyday"
  | "school"
  | "work"
  | "date"
  | "interview"
  | "party"
  | "gym";

export type OccasionPreset = {
  id: OccasionType;
  name: string;
  bannedSubCategories: SubCategory[];
  preferredFormalities: Formality[];
  preferredStyles: Style[];
};
// --------------- color scoring -----------

export type OklchColor = {
  lightness: number;
  chroma: number;
  hue: number;
};
export type ColorFamily =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "black"
  | "gray"
  | "white"
  | "brown"
  | "beige";

export type ColorTrait =
  | "achromatic"
  | "neutral"
  | "vivid"
  | "muted"
  | "light"
  | "midtone"
  | "dark"
  | "earth"
  | "warm"
  | "cool";
export interface ColorClassification {
  /** e.g. "muted-earth-neutral", "dark-neutral", "vivid" */
  label: string;
  colorFamily: ColorFamily;
  /** All matching descriptors so nothing is lost */
  traits: ColorTrait[];
}

export type ColorScoreResult = {
  score: number;
};

export type ColorReadyItem = {
  item: ClosetItemType;
  oklch: OklchColor;
  colorRole: ColorTrait[];
  colorFamily: ColorFamily;
  visualAreaWeight: number;
};

// ---------------------------------------
export type SavedOutfitType = typeof SavedOutfit.$inferSelect;
export type NewSavedOutfitType = typeof SavedOutfit.$inferInsert;
