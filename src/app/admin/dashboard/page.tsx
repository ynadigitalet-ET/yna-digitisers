import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, contactMessages, newsletterSubscribers, projectRequests, telebirrConfirmations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { AdminView } from "./admin-view";

export const metadata: Metadata = {
  title: "Admin Dashboard | YNA Digitisers",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  let setupError = "";
  let contacts: (typeof contactMessages.$inferSelect)[] = [];
  let requests: (typeof projectRequests.$inferSelect)[] = [];
  let payments: (typeof telebirrConfirmations.$inferSelect)[] = [];
  let subscribers: (typeof newsletterSubscribers.$inferSelect)[] = [];
  let posts: (typeof blogPosts.$inferSelect)[] = [];

  try {
    [contacts, requests, payments, subscribers, posts] = await Promise.all([
      db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(100),
      db.select().from(projectRequests).orderBy(desc(projectRequests.createdAt)).limit(100),
      db.select().from(telebirrConfirmations).orderBy(desc(telebirrConfirmations.createdAt)).limit(100),
      db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)).limit(100),
      db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(100),
    ]);
  } catch {
    setupError = "Database tables are not ready yet. Run npx drizzle-kit push after adding the schema.";
  }

  const settings = await getSiteSettings();

  return (
    <section className="section-padding !pt-10">
      <div className="container-custom">
        {setupError ? <div className="card border-yellow-500/30 bg-yellow-500/10 text-sm text-yellow-700 mb-6">{setupError}</div> : null}
        <AdminView
          initialContacts={contacts}
          initialRequests={requests}
          initialPayments={payments}
          initialSubscribers={subscribers}
          initialPosts={posts}
          settings={settings}
          sessionEmail={session.email}
        />
      </div>
    </section>
  );
}
