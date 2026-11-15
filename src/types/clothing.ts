import { Category } from "@/constants/clothing";

// Main type saved in the database
export type Clothing = {
  id?: string;
  name: string;
  category: Category;
  imgUri: string;
};

// form data
export type ClothingInput = Omit<Clothing, "id" | "imgUri">;
export type ClothingFormProps = {
  onSubmit: (data: ClothingInput) => void;
};
