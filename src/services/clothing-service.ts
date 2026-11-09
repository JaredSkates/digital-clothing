import { db } from "@/lib/db/client";
import { clothing } from "@/lib/db/schema";
import { CATEGORIES, type Category } from "@/constants/clothing";

/**
 * Input for creating a clothing row. `userId` is always supplied by the caller
 * (a hook/screen that read it from Clerk) — the service never reads auth state.
 */
export interface CreateClothingInput {
  userId: string; // Clerk user ID, non-empty
  name: string; // trimmed, non-empty
  category: Category;
  imgUri: string; // non-empty
}

/** A persisted clothing row as returned from the database. */
export interface ClothingRow {
  clothingId: number;
  userId: string;
  name: string;
  imgUri: string;
  category: string;
  wornCount: number;
  createdAt: Date;
}

/** Discriminator for the kind of failure a {@link ClothingServiceError} represents. */
export type ClothingErrorCode = "duplicate" | "db";

/**
 * Error thrown by the clothing service. The `code` discriminator lets callers
 * (e.g. the modal) distinguish a per-user duplicate image from a generic DB
 * failure and show the appropriate message.
 */
export class ClothingServiceError extends Error {
  readonly code: ClothingErrorCode;
  readonly cause?: unknown;

  constructor(code: ClothingErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "ClothingServiceError";
    this.code = code;
    this.cause = cause;
  }
}

/** Type guard: is this a duplicate-image error (per-user `(user_id, img_uri)` violation)? */
export function isDuplicateClothingError(
  err: unknown,
): err is ClothingServiceError {
  return err instanceof ClothingServiceError && err.code === "duplicate";
}

/** Postgres error code for a unique-constraint violation. */
const PG_UNIQUE_VIOLATION = "23505";
/** Composite unique constraint on `(user_id, img_uri)`. */
const CLOTHING_USER_IMG_URI_CONSTRAINT = "clothing_user_img_uri_unique";

/**
 * Map a raw DB error to a typed {@link ClothingServiceError}.
 *
 * A unique violation on the `(user_id, img_uri)` constraint (matched by
 * constraint name or by PG error code `23505`) becomes a `duplicate` error.
 * Everything else becomes a generic `db` error. The underlying detail is logged
 * and preserved as `cause` so callers can distinguish the two cases.
 */
export function mapDbError(err: unknown): ClothingServiceError {
  const record =
    err !== null && typeof err === "object"
      ? (err as Record<string, unknown>)
      : undefined;

  const code = typeof record?.code === "string" ? record.code : undefined;
  const constraint =
    typeof record?.constraint === "string"
      ? record.constraint
      : typeof record?.constraint_name === "string"
        ? (record.constraint_name as string)
        : undefined;

  const message = err instanceof Error ? err.message : String(err);
  const mentionsConstraint =
    constraint === CLOTHING_USER_IMG_URI_CONSTRAINT ||
    message.includes(CLOTHING_USER_IMG_URI_CONSTRAINT);

  if (code === PG_UNIQUE_VIOLATION || mentionsConstraint) {
    console.error(
      "[clothing-service] duplicate clothing (user_id, img_uri):",
      err,
    );
    return new ClothingServiceError(
      "duplicate",
      "You've already added this image.",
      err,
    );
  }

  console.error("[clothing-service] failed to save clothing:", err);
  return new ClothingServiceError(
    "db",
    "Couldn't save this item. Please try again.",
    err,
  );
}

/**
 * Insert a clothing row scoped to `input.userId`.
 *
 * Preconditions: `userId`, trimmed `name`, and `imgUri` are non-empty, and
 * `category ∈ CATEGORIES`. On success the returned row has `worn_count === 0`
 * (DB default; never set here). A `(user_id, img_uri)` collision rejects with a
 * `duplicate` {@link ClothingServiceError} without creating a second row; any
 * other DB error rejects with a generic `db` error.
 */
export async function createClothing(
  input: CreateClothingInput,
): Promise<ClothingRow> {
  if (!input.userId) {
    throw new Error("createClothing: userId is required");
  }
  const name = input.name.trim();
  if (!name) {
    throw new Error("createClothing: name is required");
  }
  if (!input.imgUri) {
    throw new Error("createClothing: imgUri is required");
  }
  if (!CATEGORIES.includes(input.category)) {
    throw new Error(`createClothing: invalid category "${input.category}"`);
  }

  try {
    const [row] = await db
      .insert(clothing)
      .values({
        userId: input.userId,
        name,
        category: input.category,
        imgUri: input.imgUri,
      })
      .returning();

    return {
      clothingId: row.clothingId,
      userId: row.userId,
      name: row.name,
      imgUri: row.imgUri,
      category: row.category,
      wornCount: row.wornCount ?? 0,
      createdAt: row.createdAt ?? new Date(),
    };
  } catch (err) {
    // Rethrow a typed error so the caller can distinguish duplicate vs generic.
    throw mapDbError(err);
  }
}
