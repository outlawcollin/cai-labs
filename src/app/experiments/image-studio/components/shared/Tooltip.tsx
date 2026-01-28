"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  position?: "right" | "bottom";
}

export default function Tooltip({ content, position = "right" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (position === "right") {
        setTooltipPos({
          top: rect.top + rect.height / 2,
          left: rect.right + 8,
        });
      } else {
        setTooltipPos({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
      }
    }
  }, [isVisible, position]);

  const tooltipStyles: React.CSSProperties =
    position === "right"
      ? {
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          transform: "translateY(-50%)",
        }
      : {
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          transform: "translateX(-50%)",
        };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span
        ref={triggerRef}
        style={{
          width: 16,
          height: 16,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
        }}
      >
        {/* info circle, tooltip.svg */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M7.16683 7.33331H8.00016L8.00016 10.8333M14.1668 7.99998C14.1668 11.4057 11.4059 14.1666 8.00016 14.1666C4.59441 14.1666 1.8335 11.4057 1.8335 7.99998C1.8335 4.59422 4.59441 1.83331 8.00016 1.83331C11.4059 1.83331 14.1668 4.59422 14.1668 7.99998Z"
            stroke="var(--color-outline)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="7.5415"
            y="4.875"
            width="0.916667"
            height="0.916667"
            rx="0.458333"
            fill="var(--color-outline)"
            stroke="var(--color-outline)"
            strokeWidth="0.25"
          />
        </svg>
      </span>
      {mounted && createPortal(
        <div
          style={{
            ...tooltipStyles,
            backgroundColor: "var(--color-surface-variant)",
            color: "var(--color-on-surface)",
            borderRadius: 12,
            padding: "8px 12px",
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 9999,
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? "auto" : "none",
            transition: "opacity 150ms ease-in-out",
            boxShadow: "0px 5px 15px 0px rgba(0,0,0,0.4), 0px 15px 35px 0px rgba(45,48,51,0.3)",
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}
