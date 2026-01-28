"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

interface ImageStudioNavBarProps {
  credits?: number;
  isMobile?: boolean;
}

export default function ImageStudioNavBar({ credits = 500, isMobile = false }: ImageStudioNavBarProps) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      if (theme === "dark") {
        setIsDark(true);
      } else if (theme === "light") {
        setIsDark(false);
      } else {
        // System preference
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
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
    <nav
      className="flex items-center justify-between p-4 shrink-0 relative"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Left: Back Arrow */}
      <Link
        href="/"
        className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        style={{
          border: "1px solid var(--color-outline-variant)",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: "var(--color-on-surface)" }}
        >
          <path
            d="M19 11.0001C19.5523 11.0001 20 11.4478 20 12.0001C19.9999 12.5523 19.5522 13.0001 19 13.0001H6.73926C7.25368 13.5736 7.94214 14.2188 8.65527 14.838C9.38771 15.4739 10.1236 16.0638 10.6777 16.4962C10.9541 16.7119 11.5114 17.1387 11.6719 17.2599C12.0475 17.6 12.1124 18.176 11.8057 18.5929C11.4782 19.0374 10.8519 19.1329 10.4072 18.8058C10.2396 18.6792 9.7332 18.2965 9.44727 18.0734C8.8764 17.6279 8.11218 17.0141 7.34473 16.3478C6.58229 15.6858 5.79396 14.9519 5.18848 14.2667C4.88684 13.9253 4.60882 13.5727 4.40137 13.2286C4.21045 12.9119 4.00003 12.4762 4 12.0001L4.00977 11.8234C4.05271 11.4171 4.23442 11.0496 4.40137 10.7726C4.60883 10.4284 4.88676 10.075 5.18848 9.73347C5.79394 9.04824 6.58231 8.31439 7.34473 7.65242C8.11215 6.9861 8.87641 6.37233 9.44727 5.92683C9.73318 5.7037 10.2396 5.32102 10.4072 5.19441C10.8519 4.86727 11.4773 4.96279 11.8047 5.4073C12.1117 5.82424 12.0476 6.40007 11.6719 6.74031C11.6719 6.74031 11.4249 6.93072 11.3447 6.99128C11.1843 7.11249 10.9541 7.28829 10.6777 7.50398C10.1236 7.93641 9.3877 8.52625 8.65527 9.16218C7.94211 9.7814 7.25368 10.4266 6.73926 11.0001H19Z"
            fill="currentColor"
          />
        </svg>
      </Link>

      {/* Center: Logo */}
      {!isMobile && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/image-studio/logo/Image Studio Logo.svg"
            alt="Image Studio"
            width={200}
            height={24}
            className="h-[24px] w-auto"
            style={{ filter: isDark ? "invert(1)" : "none" }}
          />
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Credits button with charm */}
        <button
          className="w-[48px] h-[48px] rounded-full flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          style={{
            border: "1px solid var(--color-outline-variant)",
          }}
        >
          <Image
            src="/image-studio/background/Charms_Default_A02_1.png"
            alt="Credits"
            width={48}
            height={48}
            className="w-[28px] h-[28px] object-contain"
          />
        </button>

        {/* Notification button */}
        <button
          className="w-[48px] h-[48px] rounded-full flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          style={{
            border: "1px solid var(--color-outline-variant)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--color-on-surface)" }}
          >
            <path
              d="M15.75 20C15.0345 21.3387 13.624 22.25 12 22.25C10.376 22.25 8.96548 21.3387 8.25 20H15.75ZM12 1.75C16.2802 1.75 19.75 5.21979 19.75 9.5V12.2559C19.75 12.8526 19.9872 13.4247 20.4092 13.8467L21.0127 14.4502C21.4849 14.9225 21.75 15.5635 21.75 16.2314C21.7498 17.6223 20.6223 18.7498 19.2314 18.75H4.76855C3.37767 18.7498 2.25017 17.6223 2.25 16.2314C2.25 15.5635 2.51512 14.9225 2.9873 14.4502L3.59082 13.8467L3.74023 13.6816C4.06829 13.2813 4.24999 12.778 4.25 12.2559V9.5C4.25 5.21979 7.71979 1.75 12 1.75Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Avatar */}
        <div
          className="w-[48px] h-[48px] rounded-full overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface-variant)",
            border: "1.5px solid color-mix(in srgb, var(--color-on-brand) 8%, transparent)",
          }}
        >
          <Image
            src="/image-studio/background/cnote_close_up_of_helmet_japanese_aesthetic_illustration_anim_f780e383-1895-433f-ad1c-ead20651ab76_1.png"
            alt="Avatar"
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
}
