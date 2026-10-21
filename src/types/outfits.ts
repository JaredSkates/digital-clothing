import { ClosetItem } from "@/lib/db/schema";

export type Outfit = {
  top: ClosetItem;
  bottom: ClosetItem;
  outerwear?: ClosetItem;
  shoes?: ClosetItem;
  accessory?: ClosetItem;
};
