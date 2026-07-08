"use client";

import { Turnstile } from "@/components/turnstile";

/**
 * Drop-in Turnstile field for forms. Reads the public site key from the
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY env var (inlined at build time). When the key
 * is absent it renders nothing, so forms remain fully usable before setup.
 */
export function TurnstileField({ className = "" }: { className?: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  if (!siteKey) {
    return null;
  }
  return <Turnstile siteKey={siteKey} className={className} />;
}
