import { useState } from "react";
import { BookData } from "../data";

interface BookDetailRightPageProps {
  book: BookData;
  isMobile: boolean;
  compact?: boolean;
}

export default function BookDetailRightPage({
  book,
  isMobile,
  compact = false,
}: BookDetailRightPageProps) {
  const [charIndex, setCharIndex] = useState(0);
  const characters = book.playableCharacters;
  const currentChar = characters[charIndex];

  const prevChar = () =>
    setCharIndex((i) => (i - 1 + characters.length) % characters.length);
  const nextChar = () =>
    setCharIndex((i) => (i + 1) % characters.length);

  return (
    <div
      style={{
        flex: 1,
        background: "#f5f0e8",
        borderRadius: compact ? "0 8px 8px 0" : isMobile ? 12 : "0 12px 12px 0",
        padding: compact ? "24px 20px" : isMobile ? "32px 24px" : "48px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: compact ? "auto" : isMobile ? "auto" : 500,
        height: compact ? "100%" : "auto",
        color: "#3e2733",
        borderLeft: isMobile ? "none" : "1px solid rgba(62,39,51,0.1)",
        overflowY: compact ? "auto" : "visible",
      }}
    >
      <div className="flex flex-col" style={{ gap: 28 }}>
        {/* Header */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
            opacity: 0.6,
          }}
        >
          Role Play Setup
        </p>

        {/* Character picker */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
              opacity: 0.5,
            }}
          >
            Play as
          </p>
          <div
            className="flex items-center justify-between"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(62,39,51,0.15)",
              background: "rgba(255,255,255,0.5)",
            }}
          >
            <button
              onClick={prevChar}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid rgba(62,39,51,0.2)",
                background: "transparent",
                color: "#3e2733",
                fontSize: 16,
              }}
            >
              ‹
            </button>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {currentChar?.name}
            </span>
            <button
              onClick={nextChar}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid rgba(62,39,51,0.2)",
                background: "transparent",
                color: "#3e2733",
                fontSize: 16,
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Story Mode */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
              opacity: 0.5,
            }}
          >
            Story Mode
          </p>
          <div
            className="flex items-center justify-between"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(62,39,51,0.15)",
              background: "rgba(255,255,255,0.5)",
            }}
          >
            <span
              className="flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Follow the book
              {/* Info icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.4 }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid rgba(62,39,51,0.2)",
                color: "#3e2733",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Dive In button */}
      <button
        className="cursor-pointer"
        style={{
          width: "100%",
          height: 52,
          borderRadius: 40,
          border: "none",
          background: "var(--color-primary, #1a73e8)",
          color: "#ffffff",
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          fontWeight: 600,
          marginTop: 32,
          transition: "opacity 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Dive In
      </button>
    </div>
  );
}
