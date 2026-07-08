import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import type { SiteSetting } from "@/db/schema";

// Loads the single site settings row, returning null if none exists yet or if
// the database is unavailable. Callers fall back to sensible defaults.
export async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
