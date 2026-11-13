import {
  CATEGORIES,
  FORMALITIES,
  STYLES,
  SUB_CATEGORIES,
  WARMTH_LEVELS,
} from "@/constants/closet-item";
import type { SavedOutfit, tags } from "@/lib/db/schema";
import { ClosetItemType } from "./closet-item";

// Outfits use four core slots; accessories stay in the closet but are not added to outfits yet.
export type Outfit = {
  top: ClosetItemType;
  bottom: ClosetItemType;
  outerwear?: ClosetItemType;
  shoes?: ClosetItemType;
};
export type SavedOutfitType = typeof SavedOutfit.$inferSelect;
export type NewSavedOutfitType = typeof SavedOutfit.$inferInsert;
export type Warmth = keyof typeof WARMTH_LEVELS;
export type TagType = typeof tags.$inferSelect;
export type NewTagType = typeof tags.$inferInsert;

export type Category = (typeof CATEGORIES)[number];
export type SubCategory = (typeof SUB_CATEGORIES)[Category][number];
export type Formality = (typeof FORMALITIES)[number];
export type Style = (typeof STYLES)[number];
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
