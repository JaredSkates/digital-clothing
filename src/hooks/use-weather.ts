import { useEffect, useState } from "react";

import { fetchWeather } from "@/services/api-weather";
import { WeatherInfo } from "@/types/weather";

export function useWeather(latitude?: number, longitude?: number) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWeather({ latitude, longitude });
        if (!cancelled) setWeather(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load weather");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return { weather, loading, error };
}
