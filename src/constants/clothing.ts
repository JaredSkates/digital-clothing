export const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Footwear",
  "Accessories",
] as const;

export type Category = (typeof CATEGORIES)[number];
