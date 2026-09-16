import { WeatherData } from "@/types/weather";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { getWeatherBg } from "./weather-gradients";

type WeatherProps = {
  weather: WeatherData | null;
};

export default function WeatherCard({ weather }: WeatherProps) {
  const dash = (value?: string) => value || "-";
  const { Icon, gradient, overlay, iconColor, textColor, subTextColor } =
    getWeatherBg(weather?.id, weather?.timeOfDay);

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: overlay, borderRadius: 15 },
        ]}
      />
      <Text style={[styles.locationText, { color: textColor }]}>
        {dash(weather?.locationName)}
      </Text>
      <View style={styles.contentRow}>
        <View style={styles.leftSide}>
          <Icon color={iconColor} />
          <Text style={[styles.tempText, { color: textColor }]}>
            {dash(weather?.temp)}
          </Text>
          <Text style={[styles.text, { color: subTextColor }]}>
            {dash(weather?.description)}
          </Text>
        </View>
        <View style={styles.rightSide}>
          <Text style={[styles.text, { color: subTextColor }]}>
            High: {dash(weather?.high)}
          </Text>
          <Text style={[styles.text, { color: subTextColor }]}>
            Low: {dash(weather?.low)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    gap: 8,
    padding: 16,
    borderRadius: 15,
    overflow: "hidden",
  },
  locationText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftSide: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  rightSide: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
    gap: 5,
  },
  text: {
    fontWeight: "bold",
  },
  tempText: {
    fontWeight: "bold",
    fontSize: 30,
  },
});
