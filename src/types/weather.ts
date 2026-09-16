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
