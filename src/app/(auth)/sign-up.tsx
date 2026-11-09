import { Link } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useEmailPasswordAuth } from "@/hooks/use-email-password-auth";
import { useTheme } from "@/hooks/use-theme";

/**
 * Custom email/password sign-up screen.
 *
 * Collects an email and password via controlled inputs and submits them
 * through `useEmailPasswordAuth().signUpWithEmail`. On success the hook sets
 * the active session, the root guard flips, and the gate navigates — so this
 * screen does nothing navigation-wise on success. On `{ ok: false, message }`
 * it shows the (non-empty) message inline and preserves the entered form
 * state. There is no verification-code step: verification is assumed disabled
 * in the Clerk dashboard, and if the hook reports that verification appears
 * enabled, that message is simply displayed inline.
 */
export default function SignUpScreen() {
  const theme = useTheme();
  const { signUpWithEmail, submitting } = useEmailPasswordAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const result = await signUpWithEmail(email, password);
    if (!result.ok && result.message) {
      setError(result.message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ThemedView style={styles.form}>
          <ThemedText type="subtitle" style={styles.heading}>
            Create account
          </ThemedText>

          <ThemedView style={styles.field}>
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
              editable={!submitting}
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                },
              ]}
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Password
            </ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoComplete="password-new"
              secureTextEntry
              editable={!submitting}
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                },
              ]}
            />
          </ThemedView>

          {error ? (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={[
              styles.button,
              { backgroundColor: theme.primary },
              submitting && styles.buttonDisabled,
            ]}
          >
            <ThemedText type="small" style={{ color: theme.primaryText }}>
              {submitting ? "Creating account…" : "Sign up"}
            </ThemedText>
          </Pressable>

          <ThemedView style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              Already have an account?{" "}
            </ThemedText>
            <Link href="/sign-in" asChild>
              <Pressable disabled={submitting}>
                <ThemedText type="linkPrimary">Sign in</ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: {
    color: "#e5484d",
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.three,
  },
});
