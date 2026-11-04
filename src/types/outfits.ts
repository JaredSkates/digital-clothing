import type { ClosetItemType } from "@/lib/db/schema";

export type Outfit = {
  top: ClosetItemType;
  bottom: ClosetItemType;
  outerwear?: ClosetItemType;
  shoes?: ClosetItemType;
  accessory?: ClosetItemType;
};
