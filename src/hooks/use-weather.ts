import { useEffect, useState } from "react";

import { fetchWeather } from "@/services/weather";
import { WeatherInfo } from "@/types/weather";

export function useWeather(
  coords: { latitude: number; longitude: number } | null,
) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWeather(coords)
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load weather");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coords?.latitude, coords?.longitude]);

  return { weather, loading, error };
}