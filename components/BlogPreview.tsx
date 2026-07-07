import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/blog";

export default function BlogPreview() {
  const posts = getAllPosts();

  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      id="blog-preview"
      aria-labelledby="blog-preview-heading"
      style={{
        position: "relative",
        paddingTop: "5rem",
        paddingBottom: "5rem",
        background: "var(--parchment)",
      }}
    >
      <div className="section-pad relative" style={{ textAlign: "center" }}>
        <span className="section-label">FROM THE BLOG</span>
        <h2
          id="blog-preview-heading"
          className="font-jersey"
          style={{
            marginTop: "1rem",
            fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
            lineHeight: 1.05,
            letterSpacing: "0.02em",
            color: "var(--terracotta)",
          }}
        >
          Read Before Your First Date
        </h2>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.95rem",
            color: "rgba(43,27,18,0.7)",
            maxWidth: "40ch",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Guides and updates from the Campus Crush team.
        </p>

        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            maxWidth: "42rem",
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "left",
          }}
        >
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: "block",
                padding: "1.75rem",
                borderRadius: "1rem",
                border: "1px solid rgba(193,81,47,0.3)",
                background: "var(--parchment-deep)",
                textDecoration: "none",
              }}
            >
              <p style={{ marginBottom: "0.5rem", color: "rgba(43,27,18,0.5)", fontSize: "0.8rem" }}>
                {formatPostDate(post.date)}
              </p>
              <h3 className="font-jersey" style={{ fontSize: "1.3rem", letterSpacing: "0.03em", marginBottom: "0.6rem", color: "var(--ink)" }}>
                {post.title}
              </h3>
              <p style={{ color: "rgba(43,27,18,0.72)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                {post.excerpt}
              </p>
              <span style={{ color: "var(--terracotta)", fontSize: "0.85rem", fontWeight: 600 }}>Read more →</span>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="glass-btn"
          style={{ display: "inline-flex", marginTop: "2rem", fontSize: "0.8rem", padding: "0.7rem 1.5rem" }}
        >
          View all posts
        </Link>
      </div>
    </section>
  );
}
