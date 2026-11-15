import { verifyToken } from "@clerk/backend";
import { StatusError } from "expo-server";

/**
 * The result of a successful {@link requireAuth} call.
 *
 * `userId` is derived strictly from the verified Clerk session token (its `sub`
 * claim). It is NEVER read from the request body or any other client-supplied
 * value, so routes can trust it as the authenticated user's id.
 */
export interface AuthedRequest {
  userId: string;
  claims: Record<string, unknown>;
}

/**
 * Verify the Clerk session token on an incoming `Request` and return the
 * verified user id (and remaining claims).
 *
 * Server-only: this module is imported exclusively by `*+api.ts` routes so that
 * `CLERK_SECRET_KEY` never enters the client bundle.
 *
 * Preconditions:
 * - `CLERK_SECRET_KEY` is present in the server environment. If it is missing
 *   this is a server misconfiguration and a `StatusError(500)` is thrown (the
 *   runtime surfaces it as a 500) after logging server-side.
 *
 * Postconditions:
 * - On success, returns `{ userId, claims }` where `userId === payload.sub`
 *   (the Clerk user id) and `claims` is the rest of the verified JWT payload.
 * - On a missing `Authorization: Bearer <token>` header, or an invalid/expired
 *   token, throws `StatusError(401, 'Unauthorized')`. The `expo-server` runtime
 *   catches the `StatusError` and turns it into a `401` `Response`, so routes
 *   may simply let it propagate.
 */
export async function requireAuth(request: Request): Promise<AuthedRequest> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) {
    throw new StatusError(401, "Unauthorized");
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    // Server misconfiguration — the secret is server-only and must be set.
    console.error(
      "[require-auth] CLERK_SECRET_KEY is not set; cannot verify tokens.",
    );
    throw new StatusError(500, "Server auth is misconfigured");
  }

  let payload;
  try {
    payload = await verifyToken(token, { secretKey });
  } catch (error) {
    // Log server-side for debugging; respond with a generic 401.
    console.error("[require-auth] Token verification failed:", error);
    throw new StatusError(401, "Unauthorized");
  }

  const { sub, ...claims } = payload;
  if (typeof sub !== "string" || sub.length === 0) {
    console.error("[require-auth] Verified token is missing a `sub` claim.");
    throw new StatusError(401, "Unauthorized");
  }

  // Postcondition: userId comes only from the verified token, never the body.
  return { userId: sub, claims: claims as Record<string, unknown> };
}
