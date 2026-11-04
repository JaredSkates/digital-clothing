export const CATEGORIES = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "outerwear", label: "Outerwear" },
  { value: "footwear", label: "Footwear" },
  { value: "accessory", label: "Accessory" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const SUB_CATEGORIES = {
  top: [
    { value: "t-shirt", label: "T-shirt" },
    { value: "long-sleeve", label: "Long Sleeve" },
    { value: "blouse", label: "Blouse" },
    { value: "other", label: "Other" },
  ],
  bottom: [
    { value: "shorts", label: "Shorts" },
    { value: "pants", label: "Pants" },
    { value: "jeans", label: "Jeans" },
    { value: "skirt", label: "Skirt" },
    { value: "other", label: "Other" },
  ],
  outerwear: [
    { value: "jacket", label: "Jacket" },
    { value: "coat", label: "Coat" },
    { value: "sweater", label: "Sweater" },
    { value: "other", label: "Other" },
  ],
  footwear: [
    { value: "sneakers", label: "Sneakers" },
    { value: "boots", label: "Boots" },
    { value: "dress-shoes", label: "Dress Shoes" },
    { value: "other", label: "Other" },
  ],
  accessory: [
    { value: "hat", label: "Hat" },
    { value: "scarf", label: "Scarf" },
    { value: "other", label: "Other" },
  ],
} as const;

export type SubCategory = (typeof SUB_CATEGORIES)[Category][number]["value"];

export const FORMALITIES = ["casual", "smart-casual", "formal"] as const;

export type Formality = (typeof FORMALITIES)[number];

type OccasionDefinition = {
  value: string;
  label: string;
  preferredFormalities: readonly Formality[];
  excludedSubCategories: readonly SubCategory[];
};

export const OCCASIONS = [
  {
    value: "casual",
    label: "Casual",
    preferredFormalities: ["casual"],
    excludedSubCategories: [],
  },
  {
    value: "school",
    label: "School",
    preferredFormalities: ["casual", "smart-casual"],
    excludedSubCategories: [],
  },
  {
    value: "work",
    label: "Work",
    preferredFormalities: ["smart-casual", "formal"],
    excludedSubCategories: ["shorts"],
  },
  {
    value: "date",
    label: "Date",
    preferredFormalities: ["smart-casual", "formal"],
    excludedSubCategories: [],
  },
  {
    value: "formal",
    label: "Formal",
    preferredFormalities: ["formal"],
    excludedSubCategories: ["shorts"],
  },
  {
    value: "gym",
    label: "Gym",
    preferredFormalities: ["casual"],
    excludedSubCategories: [],
  },
] as const satisfies readonly OccasionDefinition[];

export type OccasionValue = (typeof OCCASIONS)[number]["value"];
export type Occasion = (typeof OCCASIONS)[number];
