import { BookData } from "../data";

interface BookDetailLeftPageProps {
  book: BookData;
  isMobile: boolean;
  compact?: boolean;
}

export default function BookDetailLeftPage({
  book,
  isMobile,
  compact = false,
}: BookDetailLeftPageProps) {
  return (
    <div
      style={{
        flex: 1,
        background: "#f5f0e8",
        borderRadius: compact ? "8px 0 0 8px" : isMobile ? 12 : "12px 0 0 12px",
        padding: compact ? "24px 20px" : isMobile ? "32px 24px" : "48px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: compact ? "auto" : isMobile ? "auto" : 500,
        height: compact ? "100%" : "auto",
        color: "#3e2733",
        overflowY: compact ? "auto" : "visible",
      }}
    >
      <div className="flex flex-col" style={{ gap: isMobile ? 16 : 24 }}>
        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--font-serif, serif)",
            fontSize: compact ? 24 : isMobile ? 28 : 36,
            fontWeight: 400,
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {book.title}
        </h2>

        {/* Author */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            margin: 0,
            opacity: 0.7,
          }}
        >
          by
          <br />
          <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {book.author}
          </span>
        </p>

        {/* Synopsis */}
        <p
          style={{
            fontFamily: "var(--font-serif, serif)",
            fontSize: isMobile ? 13 : 14,
            lineHeight: 1.6,
            margin: 0,
            opacity: 0.85,
            fontStyle: "italic",
          }}
        >
          {book.synopsis}
        </p>

        {/* Chapters */}
        <div style={{ marginTop: 8 }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 12px 0",
              opacity: 0.6,
            }}
          >
            Chapters
          </p>
          <div className="flex flex-col" style={{ gap: 6 }}>
            {book.chapters.map((ch) => (
              <div
                key={ch.id}
                className="flex items-baseline"
                style={{ gap: 12 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    opacity: 0.5,
                    flexShrink: 0,
                    width: 48,
                  }}
                >
                  {ch.act}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-serif, serif)",
                    fontSize: 14,
                  }}
                >
                  {ch.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publication info */}
      <div
        style={{
          marginTop: 24,
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          opacity: 0.5,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>{book.year}</p>
        <p style={{ margin: 0 }}>Origin · {book.origin}</p>
      </div>
    </div>
  );
}
