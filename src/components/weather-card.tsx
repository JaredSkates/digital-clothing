import { WeatherData } from "@/types/weather";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

type WeatherProps = {
  weather: WeatherData | null;
};

export default function WeatherCard({ weather }: WeatherProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.locationText}>{weather?.locationName}</Text>
      <View style={styles.contentRow}>
        <View style={styles.leftSide}>
          {weather?.icon && (
            <Image
              source={{
                uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
              }}
              style={styles.icon}
              contentFit="contain"
            />
          )}
          <Text style={styles.tempText}>{weather?.temp}</Text>
          <Text style={styles.text}>{weather?.status}</Text>
        </View>
        <View style={styles.rightSide}>
          <Text style={styles.text}>High: {weather?.high}</Text>
          <Text style={styles.text}>Low: {weather?.low}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    backgroundColor: "rgba(5, 166, 252, 0.83)",
    gap: 10,
    padding: 18,
    borderRadius: 15,
  },
  locationText: {
    color: "#fff",
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
    color: "#fff",
    fontWeight: "bold",
  },
  icon: {
    width: 50,
    height: 50,
  },
  tempText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 30,
  },
});
