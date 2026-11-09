import { Stack } from "expo-router";

import { useUserSync } from "@/hooks/use-user-sync";

/**
 * Signed-in app shell. Provisions the current Clerk user into the `users` table
 * on first load via {@link useUserSync} and declares the `(tabs)` anchor plus the
 * modal-presented clothing form.
 *
 * The shell renders regardless of the sync status — it never blocks or
 * early-returns on `'loading'`/`'error'` — so a failed provisioning upsert still
 * leaves the app usable (Requirement 11.3).
 */
export default function AppLayout() {
  useUserSync();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
