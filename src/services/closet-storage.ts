import { Directory, File, Paths } from "expo-file-system";

import { ClosetItem, NewClosetItem } from "@/types/clothing";

type StoredItem = Omit<ClosetItem, "imgUri"> & { fileName: string };

const closetDir = new Directory(Paths.document, "closet");
const indexFile = new File(closetDir, "items.json");

async function readIndex(): Promise<StoredItem[]> {
  if (!indexFile.exists) return [];

  try {
    return JSON.parse(await indexFile.text());
  } catch {
    return [];
  }
}

function writeIndex(items: StoredItem[]) {
  if (!indexFile.exists) indexFile.create({ intermediates: true });
  indexFile.write(JSON.stringify(items));
}

export async function getClosetItems(): Promise<ClosetItem[]> {
  const stored = await readIndex();
  const items: ClosetItem[] = [];

  for (const { fileName, ...rest } of stored) {
    const image = new File(closetDir, fileName);
    // skip any missing image files
    if (image.exists) items.push({ ...rest, imgUri: image.uri });
  }

  return items.sort((a, b) => b.createdAt - a.createdAt); // newest first
}

export async function addClosetItem({
  imgUri,
  ...details
}: NewClosetItem): Promise<ClosetItem> {
  closetDir.create({ intermediates: true, idempotent: true });

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const source = new File(imgUri);
  const image = new File(closetDir, `${id}${source.extension || ".jpg"}`);
  await source.copy(image);

  const item = { id, ...details, createdAt: Date.now() };
  writeIndex([...(await readIndex()), { ...item, fileName: image.name }]);

  return { ...item, imgUri: image.uri };
}