import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { ClosetItem } from "@/types/clothing";

export default function ClosetItemCard({ item }: { item: ClosetItem }) {
  return (
    // `cell` keeps every card exactly half the row, even a lone last card
    <View style={styles.cell}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <Image
          source={{ uri: item.imgUri }}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />
        <ThemedView type="backgroundElement" style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {item.category}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    maxWidth: "50%",
    padding: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  info: {
    padding: Spacing.two,
    gap: Spacing.half,
  },
});