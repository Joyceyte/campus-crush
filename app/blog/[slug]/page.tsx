import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarkdownContent from "@/components/MarkdownContent";
import { BLOG_POSTS, getPostBySlug, formatPostDate, getHeadings } from "@/lib/blog";

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

  const headings = getHeadings(post.content);

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
      <main id="main-content" style={{ background: "var(--parchment)", paddingTop: "8rem", paddingBottom: "5rem", flex: "1 0 auto" }}>
        <article style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1.5rem", lineHeight: 1.65, fontSize: "0.95rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--ink)" }}>{post.title}</h1>
          <p style={{ marginBottom: "1rem", color: "rgba(43,27,18,0.55)", fontSize: "0.85rem" }}>
            {formatPostDate(post.date)}
          </p>
          {headings.length > 0 && (
            <nav
              aria-label="Jump to section"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem 0.9rem",
                marginBottom: post.slug === "what-is-the-pilot" ? "1rem" : "2rem",
                fontSize: "0.8rem",
              }}
            >
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  style={{ color: "var(--terracotta)", textDecoration: "underline" }}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          )}
          {post.slug === "what-is-the-pilot" && (
            <Link
              href="/?open=join-pilot"
              className="neon-btn"
              style={{ display: "inline-flex", marginBottom: "2rem" }}
            >
              Join the pilot →
            </Link>
          )}
          <MarkdownContent content={post.content} />
        </article>
      </main>
      <Footer />
    </>
  );
}
