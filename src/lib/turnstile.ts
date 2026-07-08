// Cloudflare Turnstile server-side verification.
//
// The secret key is read from the environment only and never exposed to the
// client. The public site key is exposed via NEXT_PUBLIC_TURNSTILE_SITE_KEY
// (safe to expose — it is designed to be public).
//
// Behavior when NOT configured: if no secret key is set, verification is
// skipped (returns ok) so local development and existing deployments keep
// working. Once the secret key is present, verification is strictly enforced.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare's official always-passing test keys. When these are used we treat
// Turnstile as "test mode" but still perform the real verification round-trip.
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export function getTurnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export interface TurnstileResult {
  ok: boolean;
  message?: string;
}

/**
 * Verifies a Turnstile token against Cloudflare's siteverify API.
 *
 * @param token   The `cf-turnstile-response` value submitted by the client.
 * @param remoteIp Optional client IP for extra validation.
 */
export async function verifyTurnstileToken(token: string | null | undefined, remoteIp?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Not configured → skip verification so the site keeps working until the
  // admin adds Cloudflare credentials. This is the documented opt-in behavior.
  if (!secret) {
    return { ok: true };
  }

  if (!token) {
    return { ok: false, message: "Please complete human verification." };
  }

  try {
    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);
    if (remoteIp) {
      body.append("remoteip", remoteIp);
    }

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      // Turnstile verification should be quick; never let it hang a request.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error("[turnstile] Verification endpoint returned", res.status);
      return { ok: false, message: "Verification failed. Please refresh and try again." };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (data.success) {
      return { ok: true };
    }

    const codes = data["error-codes"] || [];
    if (codes.includes("timeout-or-duplicate")) {
      return { ok: false, message: "Verification expired. Please try again." };
    }
    console.warn("[turnstile] Verification rejected", codes);
    return { ok: false, message: "Verification failed. Please refresh and try again." };
  } catch (error) {
    console.error("[turnstile] Verification request failed", error);
    return { ok: false, message: "Verification failed. Please refresh and try again." };
  }
}
