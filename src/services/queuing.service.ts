import { redis } from "src/database/redis.js";

export const Queuing = {
  addToQueueIfNotExists: async (bucket: string, userId: string) => {
    const allUsersInQueue = await redis.lrange(bucket, 0, -1);
    if (!allUsersInQueue.includes(userId)) {
      await redis.rpush(bucket, userId);
    }
  },

  removeFromQueue: async (bucket: string, userId: string) => {
    await redis.lrem(bucket, 1, userId);
  },

  removeFromAllQueues: async (userId: string) => {
    const allBuckets = await redis.keys("bucket:*");
    for (const bucket of allBuckets) {
      await redis.lrem(bucket, 1, userId);
    }
  },
};
