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
        background: "var(--navy-dark)",
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
            background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Read Before Your First Date
        </h2>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.7)",
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
                border: "1px solid rgba(255,31,113,0.35)",
                background: "linear-gradient(180deg, rgba(20,30,52,0.6), rgba(10,16,30,0.6))",
                textDecoration: "none",
              }}
            >
              <p style={{ marginBottom: "0.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                {formatPostDate(post.date)}
              </p>
              <h3 className="font-jersey" style={{ fontSize: "1.3rem", letterSpacing: "0.03em", marginBottom: "0.6rem", color: "#fff" }}>
                {post.title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                {post.excerpt}
              </p>
              <span style={{ color: "#ff1f71", fontSize: "0.85rem", fontWeight: 600 }}>Read more →</span>
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
