import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllPosts, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Campus Crush",
  description: "Guides and updates from the Campus Crush team.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main id="main-content" style={{ background: "var(--parchment)", paddingTop: "8rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--ink)" }}>Campus Crush Blog</h1>
          <p style={{ marginBottom: "2.5rem", color: "rgba(43,27,18,0.55)", fontSize: "0.95rem" }}>
            Guides and updates from the team.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{
                  display: "block",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(43,27,18,0.14)",
                  background: "var(--parchment-deep)",
                  textDecoration: "none",
                }}
              >
                <p style={{ marginBottom: "0.5rem", color: "rgba(43,27,18,0.5)", fontSize: "0.8rem" }}>
                  {formatPostDate(post.date)}
                </p>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--ink)" }}>{post.title}</h2>
                <p style={{ color: "rgba(43,27,18,0.7)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
