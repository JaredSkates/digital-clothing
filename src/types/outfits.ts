import { Clothing } from "@/lib/db/schema";

export type Outfit = {
  top: Clothing;
  bottom: Clothing;
  outerwear?: Clothing;
  shoes?: Clothing;
  accessory?: Clothing;
};
