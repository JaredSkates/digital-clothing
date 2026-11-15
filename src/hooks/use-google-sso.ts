import { useSSO } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import type { AuthFlowResult } from "@/hooks/use-email-password-auth";

// Clerk's Expo SSO guide: dismiss any lingering auth session popup on load so
// the in-app browser can hand the OAuth redirect back to the app. Safe to call
// at module scope; it is a no-op outside of a pending auth session.
WebBrowser.maybeCompleteAuthSession();

/**
 * Warm up the native in-app browser on mount and cool it down on unmount.
 *
 * Recommended by Clerk's Expo SSO guide to reduce OAuth browser latency on
 * Android. The browser warm-up APIs are native-only, so this is skipped on web
 * (`expo-web-browser` no-ops there, but we avoid the calls entirely to keep the
 * web path clean).
 */
function useWarmUpBrowser(): void {
  useEffect(() => {
    if (Platform.OS === "web") return;

    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

/** Map any thrown value to a human-readable message; never rethrows. */
function extractSSOError(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const clerkErrors = (err as { errors?: { message?: string }[] }).errors;
    const first = clerkErrors?.[0]?.message;
    if (first) return first;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong signing in with Google. Please try again.";
}

interface UseGoogleSSO {
  /**
   * Run the Google OAuth browser flow.
   *
   * Resolves to `{ ok: true }` when a session becomes active,
   * `{ ok: false, message: "" }` on user cancel (empty message => silent),
   * or `{ ok: false, message }` on a genuine error. Never throws.
   */
  startGoogle(): Promise<AuthFlowResult>;
  submitting: boolean;
}

export function useGoogleSSO(): UseGoogleSSO {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [submitting, setSubmitting] = useState(false);

  const startGoogle = async (): Promise<AuthFlowResult> => {
    setSubmitting(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return { ok: true };
      }

      // No session created => user cancelled or the flow was incomplete.
      // Empty message signals a silent cancel to the UI (no error banner).
      return { ok: false, message: "" };
    } catch (err) {
      return { ok: false, message: extractSSOError(err) };
    } finally {
      setSubmitting(false);
    }
  };

  return { startGoogle, submitting };
}
