import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";

/**
 * Thin auth gate (the app's entry route).
 *
 * While Clerk resolves auth state (`!isLoaded`), it keeps the native splash up
 * (it was held open in the root layout via `preventAutoHideAsync`) and renders
 * a themed loading view. Once auth state is known, it hides the native splash
 * and redirects: signed-in users to the app tabs, signed-out users to sign-in.
 *
 * Route groups are invisible in the URL, so `(app)/(tabs)` and `(auth)/sign-in`
 * resolve to `/` and `/sign-in`; the group-qualified hrefs below are accepted
 * by the typed routes. The component re-renders when `isSignedIn` flips, so a
 * sign-in/out transition re-evaluates the redirect to the matching group.
 *
 * This screen contains no authentication UI of its own.
 */
export default function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    // Only release the native splash once auth state has resolved so the user
    // never sees a flash of the wrong screen.
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return <Redirect href={isSignedIn ? "/(app)/(tabs)" : "/(auth)/sign-in"} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
