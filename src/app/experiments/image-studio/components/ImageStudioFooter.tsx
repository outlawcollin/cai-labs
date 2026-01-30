"use client";

import SubpageFooter from "@/components/SubpageFooter";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

export default function ImageStudioFooter() {
  const { theme, setTheme } = useTheme();
  const [variant, setVariant] = useState<"light" | "dark">("light");

  useEffect(() => {
    const checkDark = () => {
      if (theme === "dark") {
        setVariant("dark");
      } else if (theme === "light") {
        setVariant("light");
      } else {
        setVariant(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      }
    };

    checkDark();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => checkDark();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  const options = [
    { id: "light" as const, label: "Light" },
    { id: "dark" as const, label: "Dark" },
    { id: "system" as const, label: "System" },
  ];

  return (
    <SubpageFooter
      variant={variant}
      rightContent={
        <div className="flex items-center gap-2">
          {options.map((option, index) => (
            <span key={option.id} className="flex items-center gap-2">
              <button
                onClick={() => setTheme(option.id)}
                className="transition-colors cursor-pointer"
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
      }
    />
  );
}
