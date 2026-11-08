// db/schema.ts
import {
    integer,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userId: text("user_id").primaryKey(), // Clerk user ID
  email: text("email"), // may be null (e.g. some SSO cases)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clothing = pgTable(
  "clothing",
  {
    clothingId: serial("clothing_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId),
    name: text("name").notNull(),
    imgUri: text("img_uri").notNull(), // uniqueness now scoped per user
    category: text("category").notNull(),
    wornCount: integer("worn_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userImgUnique: unique("clothing_user_img_uri_unique").on(
      table.userId,
      table.imgUri,
    ),
  }),
);

export const tags = pgTable(
  "tags",
  {
    tagId: serial("tag_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId),
    tagName: text("tag_name").notNull(), // uniqueness now scoped per user
  },
  (table) => ({
    userTagUnique: unique("tags_user_tag_name_unique").on(
      table.userId,
      table.tagName,
    ),
  }),
);

export const clothingTags = pgTable(
  "clothing_tags",
  {
    clothingId: integer("clothing_id")
      .notNull()
      .references(() => clothing.clothingId),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.tagId),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.clothingId, table.tagId] }),
  }),
);
