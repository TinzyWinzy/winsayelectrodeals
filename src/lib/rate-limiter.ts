import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    })
  : null;

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 3600000
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) {
    return { allowed: true, remaining: maxRequests };
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  const oldEntries = await redis.zcount(key, 0, windowStart);
  if (oldEntries > 0) {
    await redis.zremrangebyscore(key, 0, windowStart);
  }

  const count = await redis.zcard(key);

  if (count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  await redis.expire(key, Math.ceil(windowMs / 1000));

  return { allowed: true, remaining: maxRequests - count - 1 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}
