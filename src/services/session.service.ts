import { eq } from "drizzle-orm";
import { db } from "src/database/db.js";
import { redis } from "src/database/redis.js";
import { sessions } from "src/database/schema.js";

export const REDIS_BUCKETS = {
  male: "bucket:male",
  female: "bucket:female",
  other: "bucket:other",
};

export const Sessions = {
  createSession: async (firstId: string, secondId: string) => {
    let session = null;
    const [user1Id, user2Id] = sortUserIdsByDescendingNumericValue([
      firstId,
      secondId,
    ]);
    // Check if the session already exists
    const existingSession = await db.query.sessions.findFirst({
      where: (sessions, { eq }) =>
        eq(sessions.user1Id, user1Id) && eq(sessions.user2Id, user2Id),
    });

    if (existingSession) {
      session = existingSession;
    } else {
      const newSession = await db.insert(sessions).values({
        user1Id,
        user2Id,
      });
      session = newSession;
    }

    await redis.sadd(`${user1Id}`, `${user2Id}`);
    await redis.sadd(`${user2Id}`, `${user1Id}`);
    return session;
  },

  getSession: async (user1Id: string, user2Id: string) => {
    // Check if the session exists in the database
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) =>
        eq(sessions.user1Id, user1Id) && eq(sessions.user2Id, user2Id),
    });

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  },

  deleteSession: async (firstId: string, secondId: string) => {
    const [user1Id, user2Id] = sortUserIdsByDescendingNumericValue([
      firstId,
      secondId,
    ]);
    // Delete the session from the database
    await db
      .delete(sessions)
      .where(eq(sessions.user1Id, user1Id) && eq(sessions.user2Id, user2Id));

    // Remove the session from Redis
    await redis.srem(`${user1Id}`, `${user2Id}`);
    await redis.srem(`${user2Id}`, `${user1Id}`);
  },

  getPartnerId: async (userId: string) => {
    // Get the partner ID from Redis
    const partnerId = await redis.srandmember(userId);
    if (partnerId) {
      return partnerId;
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) =>
        eq(sessions.user1Id, userId) || eq(sessions.user2Id, userId),
    });

    if (!session) {
      return null;
    }

    const partner =
      session.user1Id === userId ? session.user2Id : session.user1Id;
    await redis.sadd(userId, partner);
    return partner;
  },
};

export function sortUserIdsByDescendingNumericValue(
  userIds: string[]
): string[] {
  const sorted = userIds
    .map((id) => id.replace(/\D/g, "")) // keep only digits
    .sort((a, b) => Number(b) - Number(a)); // sort descending
  return sorted;
}
