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

// Form data + the picked image, i.e. everything needed to add an item to the closet
export type NewClosetItem = ClothingInput & { imgUri: string };

// An item that has been saved to the closet
export type ClosetItem = Clothing & { id: string; createdAt: number };