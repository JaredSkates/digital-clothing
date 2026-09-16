import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import WeatherCard from "@/components/weather-card";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { WeatherData } from "@/types/weather";

export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const { coords } = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(coords);
      // TODO: place the weather api hook here (input = coords)

      const locationName = [place?.city, place?.region]
        .filter(Boolean)
        .join(", ");
      // TODO: split the icon field from the api and check if its day or night through "d" or "n"

      setWeather({
        temp: "",
        status: "",
        high: "",
        low: "",
        timeOfDay: "",
        id: 0,
        locationName,
      });
    }

    getLocation();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WeatherCard weather={weather} />
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
