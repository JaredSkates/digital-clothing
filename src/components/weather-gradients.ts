import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  LucideIcon,
  Moon,
  Snowflake,
  Sun,
  Tornado,
  Wind,
} from "lucide-react-native";

export const GRADIENTS = {
  clearDay: ["#5fafff", "#2290ff"],
  clearNight: ["#131b3a", "#3c4d98"],
  cloudyDay: ["#9AACC2", "#B9C6D6"],
  cloudyNight: ["#080f1e", "#2a305a"],
  rainDay: ["#7C93AC", "#8FAAB8"],
  rainNight: ["#516d89", "#4A6584"],
  storm: ["#4A4E6B", "#3A3D57"],
  snow: ["#D7E4EE", "#C3D3E0"],
  mist: ["#A9B8C4", "#73838f"],
} as const;

export type GradientColors = readonly [string, string, ...string[]];

export const OVERLAY_WASH = "rgba(255,255,255,0.14)";
export const OVERLAY_WASH_LIGHT = "rgba(255,255,255,0.25)"; // for already-pale gradients (snow, clouds)
export const OVERLAY_WASH_DARK = "rgba(255,255,255,0.05)"; // for already-dark gradients (storm, clear night)
const DEFAULT_TXT_COLOR = "rgba(255,255,255,0.95)";

export interface WeatherMeta {
  Icon: LucideIcon;
  gradient: GradientColors;
  overlay: string;
  iconColor: string;
  textColor: string;
  subTextColor: string;
}

const STYLES = {
  storm: {
    Icon: CloudLightning,
    gradient: GRADIENTS.storm,
    overlay: OVERLAY_WASH_DARK,
    iconColor: "rgba(255,224,120,0.9)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.7)",
  },
  drizzleDay: {
    Icon: CloudDrizzle,
    gradient: GRADIENTS.rainDay,
    overlay: OVERLAY_WASH,
    iconColor: "rgba(255,255,255,0.9)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.75)",
  },
  drizzleNight: {
    Icon: CloudDrizzle,
    gradient: GRADIENTS.rainNight,
    overlay: OVERLAY_WASH_DARK,
    iconColor: "rgba(200,225,255,0.85)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.72)",
  },
  rainDay: {
    Icon: CloudRain,
    gradient: GRADIENTS.rainDay,
    overlay: OVERLAY_WASH,
    iconColor: "rgba(255,255,255,0.9)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.75)",
  },
  rainNight: {
    Icon: CloudRain,
    gradient: GRADIENTS.rainNight,
    overlay: OVERLAY_WASH_DARK,
    iconColor: "rgba(200,225,255,0.9)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.75)",
  },
  snow: {
    Icon: Snowflake,
    gradient: GRADIENTS.snow,
    overlay: OVERLAY_WASH_LIGHT,
    iconColor: "rgba(70,95,120,0.8)",
    textColor: "rgba(58,74,90,0.9)",
    subTextColor: "rgba(58,74,90,0.7)",
  },
  fog: {
    Icon: CloudFog,
    gradient: GRADIENTS.mist,
    overlay: OVERLAY_WASH,
    iconColor: "rgba(255,255,255,0.85)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.7)",
  },
  tornado: {
    Icon: Tornado,
    gradient: GRADIENTS.storm,
    overlay: OVERLAY_WASH_DARK,
    iconColor: "rgba(230,140,140,0.9)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.7)",
  },
  wind: {
    Icon: Wind,
    gradient: GRADIENTS.mist,
    overlay: OVERLAY_WASH,
    iconColor: "rgba(60,75,90,0.8)",
    textColor: "rgba(45,58,71,0.92)",
    subTextColor: "rgba(45,58,71,0.7)",
  },
  clearDay: {
    Icon: Sun,
    gradient: GRADIENTS.clearDay,
    overlay: OVERLAY_WASH,
    iconColor: "rgba(255, 213, 0, 0.95)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.78)",
  },
  clearNight: {
    Icon: Moon,
    gradient: GRADIENTS.clearNight,
    overlay: OVERLAY_WASH_DARK,
    iconColor: "rgba(255, 229, 159, 0.9)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.72)",
  },
  fewCloudsDay: {
    Icon: CloudSun,
    gradient: GRADIENTS.cloudyDay,
    overlay: OVERLAY_WASH_LIGHT,
    iconColor: "rgba(70,85,105,0.85)",
    textColor: "rgba(51,64,79,0.92)",
    subTextColor: "rgba(51,64,79,0.7)",
  },
  fewCloudsNight: {
    Icon: CloudMoon,
    gradient: GRADIENTS.cloudyNight,
    overlay: OVERLAY_WASH_DARK,
    iconColor: "rgba(255,244,214,0.85)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.7)",
  },
  cloudyDay: {
    Icon: Cloud,
    gradient: GRADIENTS.cloudyDay,
    overlay: OVERLAY_WASH_LIGHT,
    iconColor: "rgba(70,85,105,0.85)",
    textColor: "rgba(51,64,79,0.92)",
    subTextColor: "rgba(51,64,79,0.7)",
  },
  cloudyNight: {
    Icon: Cloud,
    gradient: GRADIENTS.cloudyNight,
    overlay: OVERLAY_WASH_DARK,
    iconColor: "rgba(226,232,240,0.85)",
    textColor: DEFAULT_TXT_COLOR,
    subTextColor: "rgba(255,255,255,0.7)",
  },
} satisfies Record<string, WeatherMeta>;

export function getWeatherBg(id?: number, timeOfDay?: string): WeatherMeta {
  const isNight = timeOfDay?.startsWith("n") ?? false;

  if (!id) return STYLES.clearDay;
  if (id >= 200 && id < 300) return STYLES.storm;
  if (id >= 300 && id < 400)
    return isNight ? STYLES.drizzleNight : STYLES.drizzleDay;
  if (id >= 500 && id < 600)
    return id === 511
      ? STYLES.snow
      : isNight
        ? STYLES.rainNight
        : STYLES.rainDay;
  if (id >= 600 && id < 700) return STYLES.snow;
  if (id >= 701 && id < 800) {
    if (id === 781) return STYLES.tornado;
    if (id === 771) return STYLES.wind;
    return STYLES.fog;
  }
  if (id === 800) return isNight ? STYLES.clearNight : STYLES.clearDay;
  if (id > 800 && id < 900) {
    if (id === 801)
      return isNight ? STYLES.fewCloudsNight : STYLES.fewCloudsDay;
    return isNight ? STYLES.cloudyNight : STYLES.cloudyDay;
  }
  return isNight ? STYLES.clearNight : STYLES.clearDay;
}
