export const CATEGORIES = [
  "Top",
  "Bottom",
  "Outerwear",
  "Footwear",
  "Accessory",
] as const;

export type Category = (typeof CATEGORIES)[number];
