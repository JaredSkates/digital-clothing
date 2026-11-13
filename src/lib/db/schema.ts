// db/schema.ts
import { OccasionPreset, SubCategory } from "@/types/outfits";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { CATEGORIES, FORMALITIES, STYLES } from "../../constants/closet-item";

// ==========================================
// 1. Enums
// ==========================================

const categoryEnum = pgEnum("category", CATEGORIES);
const closetItemFitEnum = pgEnum("closet_item_fit", [
  "slim",
  "regular",
  "relaxed",
  "oversized",
]);
const closetItemMaterialEnum = pgEnum("closet_item_material", [
  "cotton",
  "denim",
  "linen",
  "wool",
  "leather",
  "synthetic",
  "other",
]);
const closetItemFormalityEnum = pgEnum("closet_item_formality", FORMALITIES);
const closetItemStyleEnum = pgEnum("closet_item_style", STYLES);
export const weatherResistanceEnum = pgEnum("weather_resistance", [
  "none",
  "low",
  "medium",
  "high",
]);

// ==========================================
// 2. Core Tables
// ==========================================

export const ClosetItem = pgTable("ClosetItem", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),
  imgUri: text("img_uri").notNull(),

  category: categoryEnum("category").notNull(),
  subCategory: text("sub_category").$type<SubCategory>(),

  colorHex: text("color_hex"), // e.g., "#2B2B2B"
  material: closetItemMaterialEnum("material"),
  fit: closetItemFitEnum("fit"),

  waterResistance: weatherResistanceEnum("water_resistance"),
  windResistance: weatherResistanceEnum("wind_resistance"),

  formalities: closetItemFormalityEnum("formalities")
    .array()
    .notNull()
    .default([]),
  styles: closetItemStyleEnum("styles").array().notNull().default([]),

  size: text("size"),
  warmth: integer("warmth"),

  wornCount: integer("worn_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const SavedOutfit = pgTable("SavedOutfit", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  occasion: text("occasion").$type<OccasionPreset>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("Tags", {
  id: uuid("tag_id").primaryKey().defaultRandom(),
  tagName: text("tag_name").notNull().unique(),
});

// ==========================================
// 3. Relation Tables
// ==========================================

export const SavedOutfitItem = pgTable(
  "SavedOutfitItem",
  {
    SavedOutfitId: uuid("saved_outfit_id")
      .notNull()
      .references(() => SavedOutfit.id, { onDelete: "cascade" }),
    ClosetItemId: uuid("closet_item_id")
      .notNull()
      .references(() => ClosetItem.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.SavedOutfitId, table.ClosetItemId] }),
  ],
);

export const closetItemTags = pgTable(
  "ClosetItemTags",
  {
    closetItemId: uuid("closet_item_id")
      .notNull()
      .references(() => ClosetItem.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.closetItemId, table.tagId] })],
);
