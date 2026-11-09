import { Link, type Href } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useEmailPasswordAuth } from "@/hooks/use-email-password-auth";
import { useGoogleSSO } from "@/hooks/use-google-sso";
import { useTheme } from "@/hooks/use-theme";

/** Route groups are invisible in the URL, so `(auth)/sign-up` is just `/sign-up`. */
const SIGN_UP_HREF = "/sign-up" as Href;

/**
 * Custom themed sign-in screen: email + password plus a Google SSO option.
 *
 * On a successful session the root guard flips and the gate navigates, so this
 * screen performs no navigation of its own on success. Failures are shown
 * inline and the entered form state is preserved. A Google cancel resolves with
 * an empty message and is treated as a silent no-op.
 */
export default function SignInScreen() {
  const theme = useTheme();
  const { signInWithEmail, submitting: emailSubmitting } =
    useEmailPasswordAuth();
  const { startGoogle, submitting: googleSubmitting } = useGoogleSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitting = emailSubmitting || googleSubmitting;

  const onSubmit = async () => {
    setError(null);
    const result = await signInWithEmail(email, password);
    // On success the guard flips and the gate navigates — nothing to do here.
    if (!result.ok && result.message) setError(result.message);
  };

  const onGoogle = async () => {
    setError(null);
    const result = await startGoogle();
    // Empty message => silent cancel; only surface real errors.
    if (!result.ok && result.message) setError(result.message);
  };

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.form}>
          <View style={styles.heading}>
            <ThemedText type="subtitle">Welcome back</ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              Sign in to your wardrobe
            </ThemedText>
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Email
            </ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              editable={!submitting}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Password
            </ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
              editable={!submitting}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
            />
          </View>

          {error ? (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.primary },
              submitting && styles.disabled,
            ]}
          >
            {emailSubmitting ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <ThemedText type="smallBold" themeColor="primaryText">
                Sign in
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.backgroundSelected },
              ]}
            />
            <ThemedText type="small" themeColor="textSecondary">
              or
            </ThemedText>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.backgroundSelected },
              ]}
            />
          </View>

          <Pressable
            onPress={onGoogle}
            disabled={submitting}
            style={[
              styles.googleButton,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected,
              },
              submitting && styles.disabled,
            ]}
          >
            {googleSubmitting ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <ThemedText type="smallBold">Continue with Google</ThemedText>
            )}
          </Pressable>

          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              Don&apos;t have an account?{" "}
            </ThemedText>
            <Link href={SIGN_UP_HREF} asChild>
              <Pressable disabled={submitting} hitSlop={8}>
                <ThemedText type="smallBold" themeColor="primary">
                  Sign up
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: {
    color: "#e5484d",
  },
  primaryButton: {
    height: 52,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.one,
  },
  disabled: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  googleButton: {
    height: 52,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
});
