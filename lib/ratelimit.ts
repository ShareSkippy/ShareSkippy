// Simple in-memory rate limiting stub
// In production, replace with Upstash Redis or similar persistent store

const cache = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  ip: string,
  key: string,
  limit: number,
  windowSec: number
): Promise<boolean> {
  const now = Date.now();
  const cacheKey = `${ip}:${key}`;
  const record = cache.get(cacheKey);

  // If no record exists or window has expired, create new record
  if (!record || record.resetAt < now) {
    cache.set(cacheKey, {
      count: 1,
      resetAt: now + windowSec * 1000,
    });
    return true;
  }

  // If limit exceeded, deny request
  if (record.count >= limit) {
    return false;
  }

  // Increment count
  record.count += 1;
  return true;
}

// Clean up expired entries periodically (optional)
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  for (const [key, record] of entries) {
    if (record.resetAt < now) {
      cache.delete(key);
    }
  }
}, 60000); // Clean up every minute
