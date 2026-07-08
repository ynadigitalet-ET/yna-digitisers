import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BackToTop, CookieConsent, TawkWidget } from "@/components/site-widgets";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteBackground } from "@/components/site-background";
import { StructuredData } from "@/components/structured-data";
import { getSiteSettings } from "@/lib/settings";
import { parseAppearance } from "@/lib/appearance";
import "./globals.css";

// The background, favicon, and all brand/SEO metadata are fully
// admin-configurable and must reflect the latest saved settings on every
// request without requiring a rebuild.
export const dynamic = "force-dynamic";

function resolveSiteUrl(canonical?: string | null): string | undefined {
  const raw = (canonical && canonical.trim()) || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteName = settings?.siteName || "YNA Digitisers";
  const title = settings?.seoTitle || settings?.siteTitle || "YNA Digitisers — Professional Web Design Solutions";
  const description =
    settings?.seoDescription ||
    "Professional web design solutions by YNA Digitisers. Connecting your business to the digital world.";
  const favicon = settings?.faviconUrl || "/logo.png";
  const baseUrl = resolveSiteUrl(settings?.canonicalUrl);

  const ogTitle = settings?.ogTitle || title;
  const ogDescription = settings?.ogDescription || description;
  const twitterTitle = settings?.twitterTitle || ogTitle;
  const twitterDescription = settings?.twitterDescription || ogDescription;
  const ogImage = settings?.searchLogoUrl || settings?.ogImageUrl || "/og-image.png";

  const metadata: Metadata = {
    title,
    description,
    applicationName: siteName,
    robots: settings?.robotsIndex === false ? "noindex, nofollow" : "index, follow",
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName,
      type: "website",
      ...(baseUrl ? { url: baseUrl } : {}),
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: [ogImage],
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    ...(baseUrl ? { metadataBase: new URL(baseUrl), alternates: { canonical: baseUrl } } : {}),
  };

  // Search-engine / social verification tokens (only included when set).
  const otherVerification: Record<string, string> = {};
  if (settings?.bingVerification) otherVerification["msvalidate.01"] = settings.bingVerification;
  if (settings?.facebookVerification) otherVerification["facebook-domain-verification"] = settings.facebookVerification;

  if (settings?.googleVerification || Object.keys(otherVerification).length > 0) {
    metadata.verification = {
      ...(settings?.googleVerification ? { google: settings.googleVerification } : {}),
      ...(Object.keys(otherVerification).length > 0 ? { other: otherVerification } : {}),
    };
  }

  return metadata;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const appearance = parseAppearance(settings?.appearance);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <StructuredData settings={settings} />
        <SiteBackground appearance={appearance} />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CookieConsent />
        <BackToTop />
        <TawkWidget />
      </body>
    </html>
  );
}
