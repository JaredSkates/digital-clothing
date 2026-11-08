import { useAuth, useUser } from "@clerk/expo";
import { useEffect, useRef, useState } from "react";

import { postUserSync } from "@/lib/api";

/** Lifecycle of the once-per-session user provisioning upsert. */
export type SyncStatus = "loading" | "synced" | "error";

export interface UseUserSync {
  status: SyncStatus;
  userId: string | null;
}

/**
 * Provision the current Clerk user exactly once per session and expose the sync
 * status. The hook never touches the DB directly: it `POST`s to the
 * authenticated `/api/users/sync` route via {@link postUserSync} in `@/lib/api`,
 * passing the Clerk bearer token from `useAuth().getToken`. The server derives
 * the user id + email from the verified session and upserts the `users` row, so
 * the DB client/connection string are never bundled into the client.
 *
 * `useUser()` supplies the user object (to know *when* to sync) and the exposed
 * `userId`; `useAuth()` supplies `getToken` for the bearer header.
 *
 * While the Clerk user object is still loading, reports `status: 'loading'` and
 * `userId: null`. Once the user is available the sync fires a single time
 * (guarded by a ref keyed on the user id, so re-renders don't re-fire but a
 * different signed-in user still syncs). On success the status becomes
 * `'synced'`; on failure it becomes `'error'` and the detail is logged. The
 * hook never throws, so the app shell still renders when sync fails
 * (Requirement 11.3).
 */
export function useUserSync(): UseUserSync {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [status, setStatus] = useState<SyncStatus>("loading");

  // Tracks the user id we have already attempted to sync, so re-renders don't
  // re-fire the request while still allowing a different user to sync.
  const syncedUserIdRef = useRef<string | null>(null);

  const userId = isLoaded && user ? user.id : null;

  useEffect(() => {
    // User object not yet available — stay in the loading state.
    if (!isLoaded || !user) {
      setStatus("loading");
      return;
    }

    // Already synced (or syncing) this user this session.
    if (syncedUserIdRef.current === user.id) {
      return;
    }
    syncedUserIdRef.current = user.id;

    let cancelled = false;
    setStatus("loading");

    const sync = async () => {
      try {
        await postUserSync(getToken);
        if (!cancelled) setStatus("synced");
      } catch (error) {
        // Do not throw: the authenticated shell must still render when the
        // provisioning sync fails (Requirement 11.3).
        console.error("[use-user-sync] user provisioning failed:", error);
        if (!cancelled) setStatus("error");
      }
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, getToken]);

  return { status, userId };
}
