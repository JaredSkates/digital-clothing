import { isClerkAPIResponseError } from "@clerk/expo";
import { useSignIn, useSignUp } from "@clerk/expo/legacy";
import { useState } from "react";

/**
 * Shared result shape for an auth flow. `ok: true` means a session is now
 * active; `ok: false` carries a human-readable `message` for the UI. An empty
 * message is reserved by some flows (e.g. SSO cancel) to signal a silent
 * failure with no banner.
 */
export type AuthFlowResult = { ok: true } | { ok: false; message: string };

interface UseEmailPasswordAuth {
  /** True once both Clerk sign-in and sign-up resources have loaded. */
  isLoaded: boolean;
  /** True while a sign-in or sign-up request is in flight. */
  submitting: boolean;
  /** Attempt email/password sign-in. Never throws. */
  signInWithEmail(email: string, password: string): Promise<AuthFlowResult>;
  /** Attempt email/password sign-up. Never throws. */
  signUpWithEmail(email: string, password: string): Promise<AuthFlowResult>;
}

/**
 * Map any thrown value to a human-readable message; never rethrows.
 *
 * Prefers the first Clerk API error message when the error is a recognized
 * Clerk API response, falls back to a plain `Error.message`, and finally a
 * generic message.
 */
function extractClerkError(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors?.[0]?.message;
    if (first) return first;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

/**
 * Encapsulate Clerk's `useSignIn`/`useSignUp` create + `setActive` flow behind
 * a screen-friendly API. Screens call this hook rather than Clerk's create
 * flows directly.
 *
 * Uses the classic (`legacy`) Clerk Expo hooks whose `create` + `setActive`
 * shape matches this flow. Both methods catch all Clerk errors and return
 * them as `{ ok: false, message }` — nothing throws out of
 * `signInWithEmail`/`signUpWithEmail`.
 */
export function useEmailPasswordAuth(): UseEmailPasswordAuth {
  const signInHook = useSignIn();
  const signUpHook = useSignUp();
  const [submitting, setSubmitting] = useState(false);

  const isLoaded = signInHook.isLoaded && signUpHook.isLoaded;

  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<AuthFlowResult> => {
    if (!signInHook.isLoaded) return { ok: false, message: "Auth not ready" };

    const { signIn, setActive } = signInHook;
    setSubmitting(true);
    try {
      const attempt = await signIn.create({ identifier: email, password });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        return { ok: true };
      }

      return { ok: false, message: "Additional steps required" };
    } catch (err) {
      return { ok: false, message: extractClerkError(err) };
    } finally {
      setSubmitting(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
  ): Promise<AuthFlowResult> => {
    if (!signUpHook.isLoaded) return { ok: false, message: "Auth not ready" };

    const { signUp, setActive } = signUpHook;
    setSubmitting(true);
    try {
      const attempt = await signUp.create({ emailAddress: email, password });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        return { ok: true };
      }

      // A non-`complete` status here means Clerk wants an extra step (almost
      // always email verification). This app expects verification to be
      // disabled in the Clerk dashboard, so surface that as the likely fix
      // and deliberately do NOT activate a session.
      return {
        ok: false,
        message:
          "Email verification appears to be enabled in Clerk. Disable email verification in your Clerk instance to complete sign-up.",
      };
    } catch (err) {
      return { ok: false, message: extractClerkError(err) };
    } finally {
      setSubmitting(false);
    }
  };

  return { isLoaded, submitting, signInWithEmail, signUpWithEmail };
}
