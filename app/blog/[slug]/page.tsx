import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarkdownContent from "@/components/MarkdownContent";
import { BLOG_POSTS, getPostBySlug, formatPostDate } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found — Campus Crush" };
  }

  return {
    title: `${post.title} — Campus Crush`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: "Campus Crush",
    },
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main id="main-content" style={{ background: "var(--parchment)", paddingTop: "8rem", paddingBottom: "5rem" }}>
        <article style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1.5rem", lineHeight: 1.65, fontSize: "0.95rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--ink)" }}>{post.title}</h1>
          <p style={{ marginBottom: "2rem", color: "rgba(43,27,18,0.55)", fontSize: "0.85rem" }}>
            {formatPostDate(post.date)}
          </p>
          <MarkdownContent content={post.content} />
        </article>
      </main>
      <Footer />
    </>
  );
}
