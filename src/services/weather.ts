import { WeatherInfo } from "@/types/weather";

export async function fetchWeather(coords: {
  latitude: number;
  longitude: number;
}): Promise<WeatherInfo> {
  const APIkey = process.env.EXPO_PUBLIC_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=imperial&appid=${APIkey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data?.cod !== 200) {
    throw new Error(data?.message ?? "Weather data not found");
  }

  const weatherInfo = data.weather?.[0];
  const main = data.main;

  if (!weatherInfo || !main) {
    throw new Error("Weather data not found");
  }

  return {
    temp: main.temp,
    description: weatherInfo.description,
    high: main.temp_max ?? main.temp,
    low: main.temp_min ?? main.temp,
    timeOfDay: weatherInfo.icon?.includes("d") ? "day" : "night",
    id: weatherInfo.id,
  };
}
