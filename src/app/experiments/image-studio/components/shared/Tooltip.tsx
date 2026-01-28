"use client";

import { useState } from "react";

interface TooltipProps {
  content: string;
  position?: "right" | "bottom";
}

export default function Tooltip({ content, position = "right" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles =
    position === "right"
      ? {
          left: "calc(100% + 8px)",
          top: "50%",
          transform: "translateY(-50%)",
        }
      : {
          top: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
        };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span
        style={{
          width: 16,
          height: 16,
          fontSize: 12,
          color: "var(--color-on-surface-variant)",
          border: "1px solid var(--color-outline)",
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
        }}
      >
        i
      </span>
      <div
        style={{
          position: "absolute",
          ...positionStyles,
          backgroundColor: "var(--color-surface-variant)",
          color: "#ffffff",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 14,
          whiteSpace: "nowrap",
          zIndex: 50,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
          transition: "opacity 150ms ease-in-out",
        }}
      >
        {content}
      </div>
    </div>
  );
}
