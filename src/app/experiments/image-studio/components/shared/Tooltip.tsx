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
          width: 18,
          height: 18,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
        }}
      >
        {/* question-2.svg */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ transition: "fill 150ms ease-in-out" }}
        >
          <path
            d="M9 0.9375C13.4528 0.9375 17.0625 4.54721 17.0625 9C17.0625 13.4528 13.4528 17.0625 9 17.0625C4.54721 17.0625 0.9375 13.4528 0.9375 9C0.9375 4.54721 4.54721 0.9375 9 0.9375ZM9 12C8.58578 12 8.25 12.3358 8.25 12.75C8.25 13.1642 8.58578 13.5 9 13.5H9.0066L9.08348 13.4963C9.46163 13.4579 9.7566 13.1383 9.7566 12.75C9.7566 12.3617 9.46163 12.0421 9.08348 12.0037L9.0066 12H9ZM9 4.5C7.55025 4.5 6.375 5.67525 6.375 7.125C6.375 7.53922 6.71079 7.875 7.125 7.875C7.53922 7.875 7.875 7.53922 7.875 7.125C7.875 6.50369 8.3787 6 9 6C9.6213 6 10.125 6.50369 10.125 7.125C10.125 7.4619 9.97755 7.76467 9.74123 7.97167L9.63502 8.05373C9.35767 8.24378 9.02663 8.4981 8.76053 8.81835C8.4915 9.1422 8.25 9.58155 8.25 10.125C8.25 10.5392 8.58578 10.875 9 10.875C9.41422 10.875 9.75 10.5392 9.75 10.125C9.75 10.0472 9.78195 9.93623 9.9141 9.77708C10.0492 9.61448 10.2474 9.45262 10.4824 9.29152L10.6091 9.1992C11.2261 8.72003 11.625 7.96912 11.625 7.125C11.625 5.67525 10.4497 4.5 9 4.5Z"
            fill={isVisible ? "var(--color-on-surface-variant)" : "var(--color-outline)"}
            style={{ transition: "fill 150ms ease-in-out" }}
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
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}
