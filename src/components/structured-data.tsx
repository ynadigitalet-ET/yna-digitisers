import type { SiteSetting } from "@/db/schema";

function siteUrl(settings: SiteSetting | null): string {
  const fromSettings = settings?.canonicalUrl?.trim();
  if (fromSettings) return fromSettings.replace(/\/+$/, "");
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "https://ynadigitisers.com";
}

/**
 * Renders Schema.org JSON-LD for the Organization and WebSite so Google can
 * recognize the brand name and logo. All values are admin-editable and
 * regenerated on every request from the database settings.
 */
export function StructuredData({ settings }: { settings: SiteSetting | null }) {
  const url = siteUrl(settings);
  const siteName = settings?.siteName || "YNA Digitisers";
  const orgName = settings?.companyName || siteName;
  const logo = settings?.searchLogoUrl || settings?.faviconUrl || `${url}/logo.png`;
  // Resolve relative logo/data URLs to absolute where possible (Schema wants a URL).
  const logoUrl = logo.startsWith("http") || logo.startsWith("data:") ? logo : `${url}${logo.startsWith("/") ? "" : "/"}${logo}`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: orgName,
        url,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
        ...(settings?.companyEmail ? { email: settings.companyEmail } : {}),
        ...(settings?.companyPhone ? { telephone: settings.companyPhone } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: siteName,
        url,
        publisher: { "@id": `${url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject here (no user-controlled HTML).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
