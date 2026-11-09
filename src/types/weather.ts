import { LucideIcon } from "lucide-react-native";

export type WeatherData = {
  id?: number;
  temp: number;
  description: string;
  high: number;
  low: number;
  timeOfDay?: string;
  locationName: string;
};

export type WeatherInfo = Omit<WeatherData, "locationName">;

export interface WeatherMeta {
  Icon: LucideIcon;
  gradient: GradientColors;
  overlay: string;
  iconColor: string;
  textColor: string;
  subTextColor: string;
}

type GradientColors = readonly [string, string, ...string[]];
