import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import WeatherCard from "@/components/weather-card";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useWeather } from "@/hooks/use-weather";
import { WeatherData } from "@/types/weather";

export default function HomeScreen() {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("");
  const { weather } = useWeather(coords);

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const { coords } = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(coords);

      setCoords(coords);
      setLocationName([place?.city, place?.region].filter(Boolean).join(", "));
    }

    getLocation();
  }, []);

  const weatherData: WeatherData | null = weather
    ? { ...weather, locationName }
    : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WeatherCard weather={weatherData} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
