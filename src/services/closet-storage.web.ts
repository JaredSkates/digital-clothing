import { ClosetItem, NewClosetItem } from "@/types/clothing";

/**
 * Web fallback for closet-storage.ts.
 *
 * expo-file-system doesn't run on web, so on web the closet only lives in
 * memory and is cleared when the page reloads. Metro picks this file
 * automatically on web, the same way it picks app-tabs.web.tsx.
 */

let items: ClosetItem[] = [];

export async function getClosetItems(): Promise<ClosetItem[]> {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

export async function addClosetItem(input: NewClosetItem): Promise<ClosetItem> {
  const item: ClosetItem = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  items = [...items, item];
  return item;
}