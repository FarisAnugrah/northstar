import { Redis } from "@upstash/redis";

// Create a singleton to prevent multiple connections in dev
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "https://dummy.upstash.io",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "dummy_token",
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
