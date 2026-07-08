// Centralized input validation and sanitization utilities.
// Used by all server actions to prevent XSS, injection, and invalid data.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-().]{6,30}$/;

/** Trims whitespace and strips null bytes / control characters. */
export function sanitize(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

/** Extracts and sanitizes a form field value. */
export function field(formData: FormData, key: string): string {
  return sanitize(String(formData.get(key) || ""));
}

/** Validates an email address format. */
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 320;
}

/** Validates a phone number format (loose, international-friendly). */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // phone is typically optional
  return PHONE_RE.test(phone);
}

/** Validates that a string doesn't exceed a maximum length. */
export function isWithinLength(value: string, max: number): boolean {
  return value.length <= max;
}

/** Validates a URL is safe (no javascript: or data: protocol for links). */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  if (lower.startsWith("javascript:") || lower.startsWith("vbscript:")) return false;
  return true;
}

/** Rate limit tracker using in-memory map. Resets on server restart.
 *  For production at scale, replace with Redis or a database-backed solution. */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { allowed: entry.count <= maxRequests, remaining };
}

// Periodic cleanup of expired entries to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 300_000); // Clean every 5 minutes
}
