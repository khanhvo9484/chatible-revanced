import { Redis } from "ioredis";
import { env } from "src/env.js";

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
});
