import { Category } from "@/constants/closet-item";

export type ClosetItemFormInput = {
  name: string;
  category: Category | "";
  imgUri: string | null;
};
