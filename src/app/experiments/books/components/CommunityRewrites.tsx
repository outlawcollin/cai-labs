import { CommunityRewrite } from "../data";

interface CommunityRewritesProps {
  rewrites: CommunityRewrite[];
  isMobile: boolean;
}

export default function CommunityRewrites({
  rewrites,
  isMobile,
}: CommunityRewritesProps) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        paddingTop: isMobile ? 40 : 64,
        paddingBottom: isMobile ? 24 : 40,
        width: "100%",
      }}
    >
      {/* Header */}
      <h3
        style={{
          fontFamily: "var(--font-serif, serif)",
          fontSize: isMobile ? 24 : 32,
          fontWeight: 400,
          color: "var(--color-on-surface)",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        community rewrites
      </h3>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          color: "var(--color-on-surface)",
          opacity: 0.6,
          margin: "8px 0 24px 0",
        }}
      >
        what if...
      </p>

      {/* Cards row */}
      <div
        className="flex"
        style={{
          gap: isMobile ? 12 : 16,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          width: "100%",
          paddingLeft: isMobile ? 20 : 40,
          paddingRight: isMobile ? 20 : 40,
          paddingBottom: 8,
        }}
      >
        {/* Create your own card */}
        <div
          className="flex flex-col items-center justify-center cursor-pointer"
          style={{
            flexShrink: 0,
            width: isMobile ? 160 : 200,
            height: isMobile ? 200 : 240,
            borderRadius: 16,
            background: "var(--color-surface)",
            border: "1px dashed var(--color-outline-variant)",
            gap: 12,
            transition: "border-color 200ms ease",
          }}
        >
          {/* Pencil icon */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--color-on-surface)", opacity: 0.4 }}
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--color-on-surface)",
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            Create your own
            <br />
            rewrite
          </span>
        </div>

        {/* Rewrite cards */}
        {rewrites.map((rewrite) => (
          <div
            key={rewrite.id}
            className="flex flex-col cursor-pointer"
            style={{
              flexShrink: 0,
              width: isMobile ? 160 : 200,
              height: isMobile ? 200 : 240,
              borderRadius: 16,
              background: "var(--color-surface)",
              padding: isMobile ? 16 : 20,
              justifyContent: "flex-end",
              transition: "transform 200ms ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: isMobile ? 12 : 13,
                lineHeight: 1.5,
                color: "var(--color-on-surface)",
                margin: 0,
                opacity: 0.8,
              }}
            >
              {rewrite.premise}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollbar hide */}
      <style>{`
        .flex::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
