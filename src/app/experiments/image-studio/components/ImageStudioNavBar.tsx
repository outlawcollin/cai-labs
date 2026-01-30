"use client";

import SubpageNavBar from "@/components/SubpageNavBar";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

interface ImageStudioNavBarProps {
  credits?: number;
  isMobile?: boolean;
}

export default function ImageStudioNavBar({ credits = 500, isMobile = false }: ImageStudioNavBarProps) {
  const { theme } = useTheme();
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

  return (
    <SubpageNavBar
      logoSrc="/image-studio/logo/Image Studio Logo.svg"
      logoAlt="Image Studio"
      backHref="/"
      isMobile={isMobile}
      variant={variant}
    />
  );
}
