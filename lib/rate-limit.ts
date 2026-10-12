// lib/rate-limit.ts
import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// If Upstash isn't configured, skip limiting (safe for local dev)
const configured = Boolean(url && token);

const redis = configured ? new Redis({ url: url!, token: token! }) : null;

// Hourly limiter: 10 uploads per hour per IP
export const hourlyLimiter = configured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "rl:upload:hourly",
      analytics: true,
    })
  : null;

// Daily limiter: 50 uploads per day per IP
export const dailyLimiter = configured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
      prefix: "rl:upload:daily",
      analytics: true,
    })
  : null;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "hourly" | "daily"; reset: number; limit: number };

/** Get the client IP from a Request. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function checkUploadRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  if (!hourlyLimiter || !dailyLimiter) {
    return { ok: true };
  }

  const [hourly, daily] = await Promise.all([
    hourlyLimiter.limit(ip),
    dailyLimiter.limit(ip),
  ]);

  if (!hourly.success) {
    return { ok: false, reason: "hourly", reset: hourly.reset, limit: 10 };
  }

  if (!daily.success) {
    return { ok: false, reason: "daily", reset: daily.reset, limit: 50 };
  }

  return { ok: true };
}
export const reportLimiter = configured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "rl:report",
      analytics: true,
    })
  : null;

export async function checkReportRateLimit(
  ip: string,
): Promise<{ ok: true } | { ok: false; reset: number }> {
  if (!reportLimiter) return { ok: true };

  const result = await reportLimiter.limit(ip);
  if (result.success) return { ok: true };
  return { ok: false, reset: result.reset };
}
