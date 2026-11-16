import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClosetItemCard from "@/components/closet-item-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useCloset } from "@/hooks/use-closet";
import { useTheme } from "@/hooks/use-theme";

export default function ClosetScreen() {
  const theme = useTheme();
  const { items, loading, error } = useCloset();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.title}>
          My Closet
        </ThemedText>

        {loading ? (
          <ActivityIndicator
            style={styles.message}
            color={theme.textSecondary}
          />
        ) : error ? (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            {error}
          </ThemedText>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => <ClosetItemCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <ThemedView style={styles.empty}>
                <ThemedText type="smallBold">Your closet is empty</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Tap + and then the image button to add items.
                </ThemedText>
              </ThemedView>
            }
          />
        )}
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
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.two,
  },
  title: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  list: {
    // extra room at the bottom so the last row isn't hidden behind the tab bar / + button
    paddingBottom: BottomTabInset + Spacing.six + Spacing.three,
  },
  message: {
    marginTop: Spacing.six,
    textAlign: "center",
  },
  empty: {
    marginTop: Spacing.six,
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});