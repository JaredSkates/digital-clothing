import type { NewClosetItemType, OccasionProfile, SubCategory } from "@/types";

export const SUBCATEGORY_DEFAULTS: Partial<
  Record<
    SubCategory,
    Partial<Pick<NewClosetItemType, "warmth" | "formalities">>
  >
> = {
  // Tops
  "t-shirt": { warmth: 1, formalities: ["casual"] },
  "long-sleeve": { warmth: 2, formalities: ["casual", "smart-casual"] },
  blouse: { warmth: 1, formalities: ["smart-casual", "business-casual"] },
  "button-down": {
    warmth: 2,
    formalities: ["smart-casual", "business-casual", "formal"],
  },
  hoodie: { warmth: 3, formalities: ["casual"] },
  sweater: { warmth: 3, formalities: ["casual", "smart-casual"] },
  cardigan: { warmth: 2, formalities: ["smart-casual", "business-casual"] },

  // Bottoms
  shorts: { warmth: 0, formalities: ["casual"] },
  skirt: { warmth: 1, formalities: ["casual", "smart-casual"] },
  jeans: { warmth: 2, formalities: ["casual", "smart-casual"] },
  pants: { warmth: 2, formalities: ["smart-casual", "business-casual"] },
  leggings: { warmth: 2, formalities: ["casual"] },
  sweatpants: { warmth: 2, formalities: ["casual"] },

  // One-Pieces
  dress: { warmth: 2, formalities: ["smart-casual", "formal"] },
  jumpsuit: { warmth: 2, formalities: ["casual", "smart-casual"] },

  // Outerwear
  jacket: { warmth: 2, formalities: ["casual", "smart-casual"] },
  coat: { warmth: 4, formalities: ["smart-casual", "business-casual"] },
  blazer: { warmth: 2, formalities: ["business-casual", "formal"] },

  // Shoes
  sneakers: { warmth: 1, formalities: ["casual"] },
  "dress-shoes": { warmth: 1, formalities: ["business-casual", "formal"] },
  heels: {
    warmth: 1,
    formalities: ["smart-casual", "business-casual", "formal"],
  },
  sandals: { warmth: 0, formalities: ["casual"] },
  boots: { warmth: 3, formalities: ["casual", "smart-casual"] },
  loafers: {
    warmth: 1,
    formalities: ["smart-casual", "business-casual"],
  },
};

export const OCCASION_PRESETS: OccasionProfile[] = [
  {
    id: "everyday",
    name: "Everyday",
    bannedSubCategories: [],
    preferredFormalities: ["casual", "smart-casual"],
    preferredStyles: [
      "streetwear",
      "minimalist",
      "vintage",
      "alternative",
      "athletic",
    ],
  },
  {
    id: "school",
    name: "School",
    bannedSubCategories: [],
    preferredFormalities: ["casual", "smart-casual"],
    preferredStyles: [
      "streetwear",
      "minimalist",
      "vintage",
      "preppy",
      "athletic",
    ],
  },
  {
    id: "work",
    name: "Work",
    bannedSubCategories: [],
    preferredFormalities: ["smart-casual", "business-casual"],
    preferredStyles: ["minimalist", "preppy", "vintage"],
  },
  {
    id: "date",
    name: "Date",
    bannedSubCategories: [],
    preferredFormalities: ["smart-casual", "casual"],
    preferredStyles: ["minimalist", "vintage", "alternative", "preppy"],
  },
  {
    id: "interview",
    name: "Interview",
    bannedSubCategories: ["shorts", "leggings", "sandals"],
    preferredFormalities: ["business-casual", "formal"],
    preferredStyles: ["minimalist", "preppy"],
  },
  {
    id: "party",
    name: "Party",
    bannedSubCategories: [],
    preferredFormalities: ["smart-casual", "casual"],
    preferredStyles: ["streetwear", "vintage", "alternative", "preppy"],
  },
  {
    id: "gym",
    name: "Gym",
    bannedSubCategories: [
      "jeans",
      "pants",
      "skirt",
      "dress-shoes",
      "heels",
      "boots",
    ],
    preferredFormalities: [],
    preferredStyles: ["athletic"],
  },
];
