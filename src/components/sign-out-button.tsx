import { useAuth } from "@clerk/expo";
import { useState } from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SignOutButtonProps = {
  style?: ViewStyle;
};

/**
 * Signs the current user out via Clerk.
 *
 * Calling `signOut()` flips `isSignedIn` to false; the root `Stack.Protected`
 * guards then make the `(app)` group unreachable and the gate routes back to
 * `(auth)/sign-in` automatically — so this button performs no navigation of its
 * own. Disabled while the sign-out request is in flight.
 */
export default function SignOutButton({ style }: SignOutButtonProps) {
  const { signOut } = useAuth();
  const theme = useTheme();
  const [signingOut, setSigningOut] = useState(false);

  const onPress = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      // Guard flip + gate handle navigation; nothing to do on success.
    } catch (error) {
      console.error("[sign-out-button] sign out failed:", error);
      setSigningOut(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      onPress={onPress}
      disabled={signingOut}
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.backgroundSelected },
        pressed && styles.pressed,
        signingOut && styles.disabled,
        style,
      ]}
    >
      <ThemedText type="smallBold" themeColor="textSecondary">
        {signingOut ? "Signing out…" : "Sign out"}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
