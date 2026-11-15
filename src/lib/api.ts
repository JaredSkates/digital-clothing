import type { Category } from "@/constants/clothing";

/**
 * Client-safe helper for the authenticated API routes.
 *
 * This module runs in the **client bundle**. It MUST NOT import the DB client
 * (`@/lib/db/*`) or the data services (`@/services/user-service`,
 * `@/services/clothing-service`) — those pull in the Neon connection string and
 * would leak it into the client. All server work happens behind the `+api.ts`
 * routes; here we only attach the Clerk bearer token and do a relative
 * `fetch('/api/...')`.
 *
 * Relative paths (no hardcoded origin) are intentional: per the Expo Router API
 * routes docs, in development relative fetches target the Metro dev-server
 * origin automatically, and in production the origin is set via the
 * `expo-router` config plugin's `origin` field.
 * See: https://docs.expo.dev/router/web/api-routes/
 */

/** Token getter matching Clerk's `useAuth().getToken` signature. */
export type GetToken = () => Promise<string | null>;

/**
 * A `users` row as returned over the wire. Declared locally (not imported from
 * `user-service`) so this client module never transitively imports the DB
 * client. Note `createdAt`/`updatedAt` arrive as ISO strings, not `Date`s.
 */
export interface UserRow {
  userId: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * A `clothing` row as returned over the wire. Declared locally (not imported
 * from `clothing-service`) to keep this module client-safe. Note `createdAt`
 * arrives as an ISO string, not a `Date`.
 */
export interface ClothingRow {
  clothingId: number;
  userId: string;
  name: string;
  imgUri: string;
  category: string;
  wornCount: number;
  createdAt: string;
}

/** Discriminator for the kind of failure an {@link ApiError} represents. */
export type ApiErrorCode = "auth" | "duplicate" | "generic";

/**
 * Error thrown by the client API helper. The `code` discriminator lets callers
 * branch on the failure kind (e.g. show a duplicate-image message on `409`)
 * without inspecting HTTP status codes directly.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/** Type guard: is this a duplicate-image error (clothing `409`)? */
export function isDuplicateApiError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.code === "duplicate";
}

/** Type guard: is this an auth failure (missing token or `401`)? */
export function isAuthApiError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.code === "auth";
}

/**
 * Resolve the bearer token or throw a typed auth error. A missing token means
 * the caller isn't authenticated, so the request is never sent.
 */
async function requireToken(getToken: GetToken): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new ApiError("auth", "You need to be signed in to do that.");
  }
  return token;
}

/** Parse the response body as JSON, tolerating an empty/non-JSON body. */
async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * POST to the relative `/api/users/sync` route with the Clerk bearer token.
 *
 * Resolves with the user row JSON on `200`, or `null` when the server returns
 * a body-less success (e.g. `204`). Rejects with an {@link ApiError}: `code:
 * 'auth'` for a missing token or `401`, `code: 'generic'` for any other non-OK
 * response.
 */
export async function postUserSync(
  getToken: GetToken,
): Promise<UserRow | null> {
  const token = await requireToken(getToken);

  const response = await fetch("/api/users/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return parseJson<UserRow>(response);
  }

  if (response.status === 401) {
    throw new ApiError("auth", "Your session has expired. Please sign in again.", 401);
  }

  throw new ApiError(
    "generic",
    "We couldn't sync your account right now. Please try again.",
    response.status,
  );
}

/**
 * POST to the relative `/api/clothing` route with the Clerk bearer token and a
 * JSON body.
 *
 * Resolves with the created clothing row on `200`/`201`. Rejects with an
 * {@link ApiError}: `code: 'duplicate'` on `409` (use {@link isDuplicateApiError}
 * to detect), `code: 'auth'` on a missing token or `401`, and `code: 'generic'`
 * for any other non-OK response (or a success with no parseable body).
 */
export async function postClothing(
  getToken: GetToken,
  body: { name: string; category: Category; imgUri: string },
): Promise<ClothingRow> {
  const token = await requireToken(getToken);

  const response = await fetch("/api/clothing", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const row = await parseJson<ClothingRow>(response);
    if (!row) {
      throw new ApiError(
        "generic",
        "We couldn't save this item. Please try again.",
        response.status,
      );
    }
    return row;
  }

  if (response.status === 409) {
    throw new ApiError("duplicate", "You've already added this image.", 409);
  }

  if (response.status === 401) {
    throw new ApiError("auth", "Your session has expired. Please sign in again.", 401);
  }

  throw new ApiError(
    "generic",
    "We couldn't save this item. Please try again.",
    response.status,
  );
}
