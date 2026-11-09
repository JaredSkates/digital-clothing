import { requireAuth } from "@/server/require-auth";
import { upsertUser } from "@/services/user-service";

/**
 * `POST /api/users/sync` — server-only Expo Router API route.
 *
 * Authenticated endpoint that provisions (upserts) the current user. The
 * `userId` is derived strictly from the verified Clerk session token inside
 * `requireAuth` — never from the request body — so a client cannot provision
 * or overwrite another user's row.
 *
 * Flow:
 * 1. `requireAuth(request)` reads the `Authorization: Bearer <token>` header
 *    and verifies it with `@clerk/backend`. On a missing/invalid token it
 *    throws a `StatusError(401)` (and `StatusError(500)` on server
 *    misconfiguration). We let that propagate: the `expo-server` runtime
 *    catches `StatusError` and turns it into the matching status `Response`,
 *    so no try/catch is needed here. (Behavior verified against the Expo SDK
 *    v57 API routes docs — handlers return/throw standard primitives and the
 *    runtime maps `StatusError` to a `Response`.)
 * 2. Email enrichment is **best-effort** from the verified claims. A Clerk JWT
 *    includes `email` only when the token template adds it, so it is often
 *    absent; the `users` table allows a null email, so we pass
 *    `(claims.email as string) ?? null`.
 * 3. `upsertUser` persists the row idempotently and returns it.
 *
 * `Response.json` serializes the row's `createdAt`/`updatedAt` `Date`s to ISO
 * strings, matching the client helper's string-typed `UserRow`.
 */
export async function POST(request: Request): Promise<Response> {
  const { userId, claims } = await requireAuth(request);

  // Best-effort email from the verified claims (may be absent; null is OK).
  const email =
    typeof claims.email === "string" && claims.email.length > 0
      ? claims.email
      : null;

  const userRow = await upsertUser({ clerkUserId: userId, email });

  return Response.json(userRow);
}
