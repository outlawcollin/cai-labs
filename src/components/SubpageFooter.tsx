"use client";

import { ReactNode } from "react";

interface SubpageFooterProps {
  variant?: "light" | "dark";
  rightContent?: ReactNode;
}

export default function SubpageFooter({
  variant = "light",
  rightContent,
}: SubpageFooterProps) {
  const isDark = variant === "dark";
  const textColor = isDark ? "rgba(255,255,255,0.6)" : "var(--color-on-surface-variant)";

  return (
    <footer
      className="flex flex-col md:flex-row items-center gap-3 md:gap-0 justify-between p-4 shrink-0"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Disclaimer */}
      <p
        className="text-xs tracking-tight text-center md:text-left"
        style={{
          fontFamily: "var(--font-mono)",
          color: textColor,
        }}
      >
        Disclaimer: AI outputs may sometimes be offensive or inaccurate
      </p>

      {/* Right content */}
      {rightContent && (
        <div
          className="flex items-center gap-3 text-xs tracking-tight"
          style={{
            fontFamily: "var(--font-mono)",
            color: textColor,
          }}
        >
          {rightContent}
        </div>
      )}
    </footer>
  );
}
