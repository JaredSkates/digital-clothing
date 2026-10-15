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

// Enforce categories at database level matching the app constants
export const categoryEnum = pgEnum("category", [
  "Top",
  "Bottom",
  "Outerwear",
  "Footwear",
  "Accessory",
]);

export const clothing = pgTable("clothing", {
  // UUID for client-side generation and offline support
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  imgUri: text("img_uri").notNull(),
  category: categoryEnum("category").notNull(),
  wornCount: integer("worn_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const tags = pgTable("tags", {
  id: uuid("tag_id").primaryKey().defaultRandom(),
  tagName: text("tag_name").notNull().unique(),
});

export const clothingTags = pgTable(
  "clothing_tags",
  {
    clothingId: uuid("clothing_id")
      .notNull()
      .references(() => clothing.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  // Return an array instead of an object to clear the deprecation error
  (table) => [primaryKey({ columns: [table.clothingId, table.tagId] })],
);

// inferred types to eliminate type drift
export type Clothing = typeof clothing.$inferSelect;
export type NewClothing = typeof clothing.$inferInsert;
