import { ForecastDetails } from "@/types/weather";

export async function fetchWeather(coords: {
  latitude: number;
  longitude: number;
}): Promise<ForecastDetails> {
  const APIkey = process.env.EXPO_PUBLIC_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=imperial&appid=${APIkey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Weather data not found");
  }

  const weatherInfo = data.weather?.[0];
  const main = data.main;

  if (!weatherInfo || !main) {
    throw new Error("Weather data not found");
  }

  const rainVolume = data.rain?.["1h"] ?? 0;
  const snowVolume = data.snow?.["1h"] ?? 0;
  const isPrecipitation = rainVolume > 0 || snowVolume > 0;

  return {
    temp: main.temp,
    feelsLike: main.feels_like ?? main.temp,
    description: weatherInfo.description,
    high: main.temp_max ?? main.temp,
    low: main.temp_min ?? main.temp,
    precipitationMode: isPrecipitation ? weatherInfo.main : "no",
    timeOfDay: weatherInfo.icon?.includes("d") ? "day" : "night",
    id: weatherInfo.id,
  };
}
