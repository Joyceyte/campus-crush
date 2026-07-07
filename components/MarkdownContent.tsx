import type { ReactNode } from "react";

// Matches, in priority order: [text](url) links, <email@address> autolinks,
// and **bold** spans. Link text is recursed into so bold can nest inside it.
function inlinePattern() {
  return /\[(.+?)\]\((.+?)\)|<([^\s<>]+@[^\s<>]+)>|\*\*(.+?)\*\*/g;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let count = 0;
  let match: RegExpExecArray | null;
  // Fresh regex per call — renderInline recurses (bold nested in links, etc.)
  // and a shared `g`-flag regex's mutable lastIndex gets corrupted across
  // recursive calls, which previously caused an unbounded loop.
  const INLINE_PATTERN = inlinePattern();

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-${count++}`;

    if (match[1] !== undefined) {
      const linkText = match[1];
      const url = match[2];
      const isExternal = /^https?:\/\//.test(url);
      nodes.push(
        <a
          key={key}
          href={url}
          style={{ color: "var(--ink)", textDecoration: "underline" }}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {renderInline(linkText, key)}
        </a>
      );
    } else if (match[3] !== undefined) {
      const email = match[3];
      nodes.push(
        <a key={key} href={`mailto:${email}`} style={{ color: "var(--ink)", textDecoration: "underline" }}>
          {email}
        </a>
      );
    } else if (match[4] !== undefined) {
      nodes.push(<strong key={key}>{renderInline(match[4], key)}</strong>);
    }

    lastIndex = INLINE_PATTERN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function isListBlock(block: string) {
  return block
    .split("\n")
    .every((line) => line.trim() === "" || line.trim().startsWith("- "));
}

export default function MarkdownContent({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              style={{ fontSize: "1.15rem", marginTop: "2.25rem", marginBottom: "0.75rem", color: "var(--ink)" }}
            >
              {renderInline(block.replace(/^##\s*/, ""), `h-${i}`)}
            </h2>
          );
        }

        if (isListBlock(block)) {
          const items = block
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.replace(/^-\s*/, ""));
          return (
            <ul
              key={i}
              style={{
                marginBottom: "1rem",
                paddingLeft: "1.25rem",
                color: "rgba(43,27,18,0.75)",
                listStyleType: "disc",
              }}
            >
              {items.map((item, j) => (
                <li key={j} style={{ marginBottom: "0.4rem" }}>
                  {renderInline(item, `li-${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} style={{ marginBottom: "1rem", color: "rgba(43,27,18,0.75)" }}>
            {renderInline(block, `p-${i}`)}
          </p>
        );
      })}
    </>
  );
}
