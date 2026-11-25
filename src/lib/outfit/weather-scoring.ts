import {
  BODY_WARMTH_WEIGHTS,
  PROTECTION_WEIGHTS,
  WEATHER_SCORE_WEIGHTS,
} from "@/config/weights";
import type { Outfit } from "@/types";
import type { ForecastDetails } from "@/types/weather";
import {
  findTargetRain,
  findTargetWarmth,
  findTargetWind,
  getProtectionValues,
  getWarmth,
  scoreRegions,
} from "@/utils/weather-math";

// An exact match to the warmth target scores 1. Too much or too little warmth lowers the score.
export function scoreWarmth(outfit: Outfit, feelsLike: number): number {
  const target = findTargetWarmth(feelsLike);

  return scoreRegions(getWarmth(outfit), target, true, BODY_WARMTH_WEIGHTS);
}

// No protection needed or meeting the four-slot wind target earns full points.
export function scoreWind(outfit: Outfit, windSpeed: number): number {
  const target = findTargetWind(windSpeed);

  return scoreRegions(
    getProtectionValues(outfit, "windResistance"),
    target,
    false,
    PROTECTION_WEIGHTS,
  );
}

// Rain and snow use whichever amount is higher to set the four-slot target.
export function scoreRain(outfit: Outfit, weather: ForecastDetails): number {
  const precipitation = Math.max(weather.rainVolume, weather.snowVolume);
  const target = findTargetRain(precipitation);

  return scoreRegions(
    getProtectionValues(outfit, "waterResistance"),
    target,
    false,
    PROTECTION_WEIGHTS,
  );
}

// Weather score: warmth counts for 50%, rain for 30%, and wind for 20%.
// Without usable data there is no weather score.
export function scoreWeatherProtection(
  outfit: Outfit,
  weather?: ForecastDetails,
): number | null {
  if (!weather) return null;

  let total = 0;
  let totalWeight = 0;

  const metrics = [
    {
      score: scoreWarmth(outfit, weather.feelsLike),
      weight: WEATHER_SCORE_WEIGHTS.warmth,
    },
    {
      score: scoreRain(outfit, weather),
      weight: WEATHER_SCORE_WEIGHTS.rain,
    },
    {
      score: scoreWind(outfit, weather.windSpeed),
      weight: WEATHER_SCORE_WEIGHTS.wind,
    },
  ];

  for (const { score, weight } of metrics) {
    if (score !== null && score !== undefined) {
      total += score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? total / totalWeight : null;
}
