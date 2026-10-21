// db/schema.ts
import type { SubCategory } from "../../constants/closet-item";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Enforce at database level matching the app constants
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
  "polyester",
  "leather",
  "silk",
  "knit",
  "other",
]);

export const closetItemFormalityEnum = pgEnum("closet_item_formality", [
  "casual",
  "smart-casual",
  "formal",
]);

export const closetItem = pgTable("closetItem", {
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

export const tags = pgTable("tags", {
  id: uuid("tag_id").primaryKey().defaultRandom(),
  tagName: text("tag_name").notNull().unique(),
});

export const closetItemTags = pgTable(
  "closetItem_tags",
  {
    closetItemId: uuid("closetItem_id")
      .notNull()
      .references(() => closetItem.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  // Return an array instead of an object to clear the deprecation error
  (table) => [primaryKey({ columns: [table.closetItemId, table.tagId] })],
);

// inferred types to eliminate type drift
export type ClosetItem = typeof closetItem.$inferSelect;
export type NewClosetItem = typeof closetItem.$inferInsert;
