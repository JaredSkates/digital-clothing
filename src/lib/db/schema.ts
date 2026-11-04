// db/schema.ts
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  FORMALITIES,
  type OccasionValue,
  type SubCategory,
} from "../../constants/closet-item";

// ==========================================
// 1. Enums
// ==========================================

export const categoryEnum = pgEnum("category", [
  "top",
  "bottom",
  "outerwear",
  "footwear",
  "accessory",
]);

export const closetItemFitEnum = pgEnum("closet_item_fit", [
  "slim",
  "regular",
  "relaxed",
  "oversized",
]);

export const closetItemMaterialEnum = pgEnum("closet_item_material", [
  "cotton",
  "denim",
  "linen",
  "wool",
  "leather",
  "synthetic",
  "other",
]);

export const closetItemFormalityEnum = pgEnum(
  "closet_item_formality",
  FORMALITIES,
);

// ==========================================
// 2. Core Tables
// ==========================================

export const ClosetItem = pgTable("ClosetItem", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),
  imgUri: text("img_uri").notNull(),

  category: categoryEnum("category").notNull(),
  subCategory: text("sub_category").$type<SubCategory>(),
  color: text("color"),
  material: closetItemMaterialEnum("material"),
  fit: closetItemFitEnum("fit"),
  formality: closetItemFormalityEnum("formality"),
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
  occasion: text("occasion").$type<OccasionValue>(),
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

// ==========================================
// 4. Inferred Types
// ==========================================

export type ClosetItemType = typeof ClosetItem.$inferSelect;
export type NewClosetItemType = typeof ClosetItem.$inferInsert;

export type SavedOutfitType = typeof SavedOutfit.$inferSelect;
export type NewSavedOutfitType = typeof SavedOutfit.$inferInsert;

export type TagType = typeof tags.$inferSelect;
export type NewTagType = typeof tags.$inferInsert;
