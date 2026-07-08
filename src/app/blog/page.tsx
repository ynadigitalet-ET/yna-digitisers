import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Icon } from "@/components/icon";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";

export const metadata: Metadata = {
  title: "Blog | YNA Digitisers",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: (typeof blogPosts.$inferSelect)[] = [];

  try {
    posts = await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt));
  } catch {
    posts = [];
  }

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h1 className="heading-2 mb-4">Blog</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted">Insights, tips, and updates from our web design experts.</p>
        </div>

        {posts.length === 0 ? (
          <div className="card mx-auto max-w-2xl text-center py-12 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
              <Icon name="file-text" className="w-7 h-7" />
            </div>
            <p className="text-muted text-base font-medium">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article className="card flex h-full flex-col overflow-hidden" key={post.id}>
                {post.imageUrl ? (
                  <div className="-mx-6 -mt-6 mb-5 overflow-hidden border-b border-border bg-muted/20">
                    <img alt={post.title} className="h-48 w-full object-cover transition duration-300 hover:scale-105" src={post.imageUrl} />
                  </div>
                ) : null}
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">{post.readMinutes} min read</p>
                <h2 className="heading-3 mt-3">{post.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted">{post.excerpt}</p>
                <Link className="btn-ghost mt-6 inline-flex items-center gap-1.5 font-bold" href={`/blog/${post.slug}`}>
                  <span>Read More</span>
                  <Icon name="arrow-right" className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
