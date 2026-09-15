import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, View } from "react-native";

type WeatherProps = {
  current_temp: string;
  status: string;
  high_point: string;
  low_point: string;
  icon?: string;
  bgColor?: string;
};

export default function WeatherCard(props: WeatherProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        <Ionicons name="thunderstorm" size={25} style={styles.text} />
        <Text style={styles.text}>{props.current_temp}</Text>
        <Text>{props.status}</Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={styles.text}>High: {props.high_point}</Text>
        <Text style={styles.text}>Low: {props.low_point}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "rgba(5, 166, 252, 0.83)",
    gap: 10,
    padding: 18,
    borderRadius: 15,
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
});
