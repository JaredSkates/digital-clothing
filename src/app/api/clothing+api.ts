import { StatusError } from "expo-server";

import { CATEGORIES, type Category } from "@/constants/clothing";
import {
  createClothing,
  isDuplicateClothingError,
} from "@/services/clothing-service";
import { requireAuth } from "@/server/require-auth";

/**
 * Server-only Expo Router API route: create a clothing item.
 *
 * Flow (see design.md "API route: clothing"):
 * 1. `requireAuth(request)` verifies the Clerk bearer token and returns the
 *    trusted `userId` (derived from the token's `sub`, never the body). A
 *    missing/invalid token throws `StatusError(401)`; a server misconfiguration
 *    throws `StatusError(500)`. We call it OUTSIDE the `createClothing`
 *    try/catch so the runtime surfaces those as a proper 401/500 and they are
 *    never remapped to a generic 500 by the DB error handling below.
 * 2. Parse and validate `{ name, category, imgUri }` from the JSON body. Invalid
 *    input returns a `400` and the service is never called.
 * 3. `createClothing` runs with the VERIFIED `userId`. A per-user
 *    `(user_id, img_uri)` duplicate maps to `409`; any other failure maps to
 *    `500` (logged server-side here and in the service).
 *
 * The runtime converts a thrown `StatusError` into a `Response` with the given
 * status and JSON body, so auth failures propagate as-is.
 */
export async function POST(request: Request): Promise<Response> {
  // Let requireAuth's StatusError (401/500) propagate to the runtime unchanged.
  const { userId } = await requireAuth(request);

  // Parse the JSON body. A malformed body is a client error, not a 500.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, category, imgUri } = (body ?? {}) as {
    name?: unknown;
    category?: unknown;
    imgUri?: unknown;
  };

  // Validate before touching the service — never call it with invalid input.
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    return Response.json(
      { error: "name is required" },
      { status: 400 },
    );
  }
  if (typeof imgUri !== "string" || imgUri.length === 0) {
    return Response.json(
      { error: "imgUri is required" },
      { status: 400 },
    );
  }
  if (
    typeof category !== "string" ||
    !CATEGORIES.includes(category as Category)
  ) {
    return Response.json(
      { error: "category is invalid" },
      { status: 400 },
    );
  }

  try {
    const row = await createClothing({
      userId, // VERIFIED userId — never from the request body.
      name: trimmedName,
      category: category as Category,
      imgUri,
    });
    // createdAt is a Date; Response.json serializes it to an ISO string,
    // matching what the client helper expects.
    return Response.json(row, { status: 201 });
  } catch (err) {
    // A StatusError here (unexpected) should keep its intended status.
    if (err instanceof StatusError) {
      throw err;
    }
    if (isDuplicateClothingError(err)) {
      return Response.json({ error: "duplicate" }, { status: 409 });
    }
    console.error("[api/clothing] failed to create clothing:", err);
    return Response.json(
      { error: "Couldn't save this item. Please try again." },
      { status: 500 },
    );
  }
}
