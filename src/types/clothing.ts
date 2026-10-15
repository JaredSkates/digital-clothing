import { Category } from "@/constants/clothing";

export type ClothingFormInput = {
  name: string;
  category: Category | "";
  imgUri: string | null;
};
