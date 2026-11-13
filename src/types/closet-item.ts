import { ClosetItem } from "@/lib/db/schema";
import { Category } from "./outfits";

export type ClosetItemFormInput = {
  name: string;
  category: Category | "";
  imgUri: string | null;
};

export type ClosetItemType = typeof ClosetItem.$inferSelect;
export type NewClosetItemType = typeof ClosetItem.$inferInsert;
