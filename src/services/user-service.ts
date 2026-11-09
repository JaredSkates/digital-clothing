import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

/**
 * Input for {@link upsertUser}. `userId`/`email` are supplied strictly by the
 * caller — the service never reads Clerk/auth state itself.
 */
export interface UpsertUserInput {
  clerkUserId: string; // non-empty
  email: string | null;
}

/** A row from the `users` table, mapped to non-null timestamps. */
export interface UserRow {
  userId: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Persist a user keyed by their Clerk user ID.
 *
 * Preconditions: `input.clerkUserId` is a non-empty string.
 * Postconditions: a `users` row with `user_id === input.clerkUserId` exists,
 *   its `email` equals `input.email`, and the resulting row is returned.
 *   Idempotent in `user_id` — repeated calls update email/`updated_at` without
 *   creating a second row.
 */
export async function upsertUser(input: UpsertUserInput): Promise<UserRow> {
  if (
    typeof input.clerkUserId !== "string" ||
    input.clerkUserId.length === 0
  ) {
    throw new Error("upsertUser requires a non-empty clerkUserId.");
  }

  try {
    const [row] = await db
      .insert(users)
      .values({
        userId: input.clerkUserId,
        email: input.email,
      })
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          email: input.email,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("upsertUser did not return a row.");
    }

    return {
      userId: row.userId,
      email: row.email,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  } catch (error) {
    // Log the underlying detail for debugging, surface a user-facing message.
    console.error("[user-service] upsertUser failed:", error);
    throw new Error(
      "We couldn't save your account right now. Please try again in a moment.",
    );
  }
}
