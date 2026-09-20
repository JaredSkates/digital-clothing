import { STYLES } from "@/constants/weather-gradients";
import { WeatherMeta } from "@/types/weather";

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
