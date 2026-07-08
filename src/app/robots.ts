import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

function resolveBaseUrl(canonical?: string | null): string {
  const raw = (canonical && canonical.trim()) || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://ynadigitisers.com";
  return raw.replace(/\/+$/, "");
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const base = resolveBaseUrl(settings?.canonicalUrl);
  const indexable = settings?.robotsIndex !== false;

  // When indexing is disabled in the admin dashboard, block all crawlers.
  if (!indexable) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Never expose admin or internal API routes to crawlers.
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
