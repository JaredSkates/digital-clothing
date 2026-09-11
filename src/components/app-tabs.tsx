import Ionicons from "@react-native-vector-icons/ionicons";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Pressable, StyleSheet, useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ThemedView } from "./themed-view";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [is_menu_open, set_is_menu_open] = useState(false);
  const router = useRouter();

  const handleFABPress = () => {
    set_is_menu_open(!is_menu_open);
  };

  const handleImagePress = () => {
    set_is_menu_open(false);
    router.push("/modal");
  };

  return (
    <ThemedView style={styles.container}>
      {/* Main Navbar */}
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        labelStyle={{ selected: { color: colors.text } }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require("@/assets/images/tabIcons/home.png")}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* Action Buttons */}
      <ThemedView style={styles.fabContainer}>
        <Pressable
          style={({ pressed: isPressed }) => [
            styles.fab,
            isPressed && styles.fabPressed,
          ]}
          onPress={handleFABPress}
        >
          <Ionicons
            name={is_menu_open ? "close" : "add"}
            size={28}
            color="#fff"
          />
        </Pressable>

        {is_menu_open && (
          <>
            {/* Action Button 1 */}
            <Pressable
              style={[styles.fab, styles.actionFab]}
              onPress={handleImagePress}
            >
              <Ionicons name="image" size={25} color="#fff" />
            </Pressable>

            {/* Action Button 2 */}
            <Pressable
              style={[styles.fab, styles.actionFab]}
              onPress={() => console.log("Action 2")}
            >
              <Ionicons name="shirt" size={25} color="#fff" />
            </Pressable>
          </>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  fabContainer: {
    position: "absolute",
    bottom: 90, // Pinned 90px from the screen bottom (above native tabs)
    right: 20,
    alignItems: "center",
    flexDirection: "column-reverse", // buttons stacked from bottom to top
    gap: 14,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  actionFab: {
    backgroundColor: "#334",
  },
});
