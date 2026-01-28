"use client";

import { useTheme } from "../context/ThemeContext";

export default function ImageStudioFooter() {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: "light" as const, label: "Light" },
    { id: "dark" as const, label: "Dark" },
    { id: "system" as const, label: "System" },
  ];

  return (
    <footer
      className="flex items-center justify-between p-4 shrink-0"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Disclaimer */}
      <p
        className="text-xs tracking-tight"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-on-surface-variant)",
        }}
      >
        Disclaimer: AI outputs may sometimes be offensive or inaccurate
      </p>

      {/* Theme Toggle */}
      <div
        className="flex items-center gap-2 text-xs tracking-tight"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {options.map((option, index) => (
          <span key={option.id} className="flex items-center gap-2">
            <button
              onClick={() => setTheme(option.id)}
              className="transition-colors"
              style={{
                color:
                  theme === option.id
                    ? "var(--color-on-surface)"
                    : "var(--color-on-surface-variant)",
              }}
            >
              {option.label}
            </button>
            {index < options.length - 1 && (
              <span style={{ color: "var(--color-on-surface-variant)" }}>/</span>
            )}
          </span>
        ))}
      </div>
    </footer>
  );
}
