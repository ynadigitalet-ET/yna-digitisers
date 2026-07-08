import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <article className="section-padding">
      <div className="container-custom max-w-3xl">
        <p className="badge mb-6">{post.readMinutes} min read</p>
        <h1 className="heading-2 mb-5">{post.title}</h1>
        <p className="text-sm text-muted mb-8">By {post.author}</p>
        {post.imageUrl ? (
          <div className="mb-10 overflow-hidden rounded-2xl border border-border shadow-md">
            <img alt={post.title} className="max-h-[480px] w-full object-cover" src={post.imageUrl} />
          </div>
        ) : null}
        <div className="prose-copy mt-6 whitespace-pre-line text-lg leading-8">{post.content}</div>
      </div>
    </article>
  );
}
