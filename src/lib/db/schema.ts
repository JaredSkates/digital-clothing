// db/schema.ts
import { pgTable, serial, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const clothing = pgTable('clothing', {
  clothingId: serial('clothing_id').primaryKey(),
  name: text('name').notNull(),
  imgUri: text('img_uri').notNull().unique(),
  category: text('category').notNull(),
  wornCount: integer('worn_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tags = pgTable('tags', {
  tagId: serial('tag_id').primaryKey(),
  tagName: text('tag_name').notNull().unique(),
});

export const clothingTags = pgTable('clothing_tags', {
  clothingId: integer('clothing_id').notNull().references(() => clothing.clothingId),
  tagId: integer('tag_id').notNull().references(() => tags.tagId),
}, (table) => ({
  pk: primaryKey({ columns: [table.clothingId, table.tagId] }),
}));