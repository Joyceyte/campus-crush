"use client";
import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// Instagram's own embed widget (the exact snippet their share menu's
// "Embed" option gives you) — no API key needed for a single public post.
// embed.js turns the blockquote below into an iframe once it loads.
export default function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    // If embed.js already loaded from elsewhere on the page (or a previous
    // client-side navigation), Script's onLoad won't fire again — ask it to
    // process this blockquote directly instead of waiting for a load event
    // that's never coming.
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [url]);

  return (
    <>
      {/* embed.js replaces the blockquote's contents with its own iframe
          wrapper, which doesn't inherit the blockquote's own margin:auto —
          center via this flex wrapper instead so it's centered regardless
          of what Instagram injects. */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ background: "#FFF", border: 0, margin: 0, maxWidth: 540, width: "99%" }}
        />
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
    </>
  );
}
