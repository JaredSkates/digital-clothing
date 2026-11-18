import type { Outfit } from "@/types";
import type { ForecastDetails } from "@/types/weather";
import {
  findTargetRain,
  findTargetWarmth,
  findTargetWind,
  getWarmth,
  getWaterResistance,
  getWindResistance,
  scoreRegions,
} from "@/utils/weather-math";

// An exact match to the warmth target scores 1. Too much or too little warmth lowers the score.
export function scoreWarmth(outfit: Outfit, feelsLike: number): number {
  const target = findTargetWarmth(feelsLike);

  return scoreRegions(getWarmth(outfit), target, true);
}

// No protection needed or meeting the four-slot wind target earns full points.
export function scoreWind(outfit: Outfit, windSpeed: number): number {
  const target = findTargetWind(windSpeed);

  return scoreRegions(getWindResistance(outfit), target, false);
}

// Rain and snow use whichever amount is higher to set the four-slot target.
export function scoreRain(outfit: Outfit, weather: ForecastDetails): number {
  const precipitation = Math.max(weather.rainVolume, weather.snowVolume);
  const target = findTargetRain(precipitation);

  return scoreRegions(getWaterResistance(outfit), target, false);
}
