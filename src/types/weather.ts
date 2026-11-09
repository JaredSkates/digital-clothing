import { LucideIcon } from "lucide-react-native";

export type WeatherReport = {
  id?: number;
  temp: number;
  feelsLike: number;
  description: string;
  high: number;
  low: number;
  precipitationMode: string;
  rainVolume: number;
  snowVolume: number;
  humidity: number;
  windSpeed: number;
  cloudiness: number;
  timeOfDay: "day" | "night";
  locationName: string;
};

export type ForecastDetails = Omit<WeatherReport, "locationName">;

export interface WeatherTheme {
  Icon: LucideIcon;
  gradient: GradientColors;
  overlay: string;
  iconColor: string;
  textColor: string;
  subTextColor: string;
}

type GradientColors = readonly [string, string, ...string[]];
