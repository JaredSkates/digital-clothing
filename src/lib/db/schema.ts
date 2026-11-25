// db/schema.ts
import {
  OccasionProfile,
  SubCategory,
  WarmthLevel,
  WeatherResistance,
} from "@/types";
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
  CATEGORIES,
  FITS,
  FORMALITIES,
  MATERIALS,
  STYLES,
} from "../../constants/closet";

// ==========================================
// 1. Enums
// ==========================================

const categoryEnum = pgEnum("category", CATEGORIES);
const closetItemFitEnum = pgEnum("closet_item_fit", FITS);
const closetItemMaterialEnum = pgEnum("closet_item_material", MATERIALS);
const closetItemFormalityEnum = pgEnum("closet_item_formality", FORMALITIES);
const closetItemStyleEnum = pgEnum("closet_item_style", STYLES);

// ==========================================
// 2. Core Tables
// ==========================================

export const ClosetItem = pgTable("ClosetItem", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),
  imgUri: text("img_uri").notNull(),

  category: categoryEnum("category").notNull(),
  subCategory: text("sub_category").$type<SubCategory>().notNull(),

  colorHex: text("color_hex").notNull(),
  material: closetItemMaterialEnum("material").notNull(),
  fit: closetItemFitEnum("fit"),

  waterResistance: integer("water_resistance")
    .$type<WeatherResistance>()
    .notNull()
    .default(0),
  windResistance: integer("wind_resistance")
    .$type<WeatherResistance>()
    .notNull()
    .default(0),

  formalities: closetItemFormalityEnum("formalities")
    .array()
    .notNull()
    .default([]),
  styles: closetItemStyleEnum("styles").array().notNull().default([]),

  size: text("size"),
  warmth: integer("warmth").$type<WarmthLevel>().notNull(),

  wornCount: integer("worn_count").default(0).notNull(),
  lastWornAt: timestamp("last_worn_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const SavedOutfit = pgTable("SavedOutfit", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  occasion: text("occasion").$type<OccasionProfile>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// export const tags = pgTable("Tags", {
//   id: uuid("tag_id").primaryKey().defaultRandom(),
//   tagName: text("tag_name").notNull().unique(),
// });

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

// export const closetItemTags = pgTable(
//   "ClosetItemTags",
//   {
//     closetItemId: uuid("closet_item_id")
//       .notNull()
//       .references(() => ClosetItem.id, { onDelete: "cascade" }),
//     tagId: uuid("tag_id")
//       .notNull()
//       .references(() => tags.id, { onDelete: "cascade" }),
//   },
//   (table) => [primaryKey({ columns: [table.closetItemId, table.tagId] })],
// );
