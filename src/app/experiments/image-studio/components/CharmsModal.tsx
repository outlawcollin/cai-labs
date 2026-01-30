"use client";

import { useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface CharmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  charmsBalance?: number;
}

export default function CharmsModal({
  isOpen,
  onClose,
  charmsBalance = 14,
}: CharmsModalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Delay adding click listener to avoid closing immediately from the opening click
    requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClickOutside);
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleKeyDown, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 flex flex-col"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: "32px",
        width: "320px",
        padding: "20px",
        boxShadow: "0px 4px 32px rgba(62, 39, 51, 0.04)",
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 w-full">
        <h2
          className="flex-1 text-2xl font-medium"
          style={{ color: "var(--color-on-surface)" }}
        >
          Charms
        </h2>

        {/* Gift button */}
        <button
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-colors"
          style={{ backgroundColor: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-on-surface)"; e.currentTarget.style.color = "var(--color-surface)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-variant)"; e.currentTarget.style.color = "var(--color-on-surface)"; }}
        >
          <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.625 6.75H3.375C3.06434 6.75 2.8125 7.00184 2.8125 7.3125V9C2.8125 9.31066 3.06434 9.5625 3.375 9.5625H14.625C14.9357 9.5625 15.1875 9.31066 15.1875 9V7.3125C15.1875 7.00184 14.9357 6.75 14.625 6.75Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 6.75V15.1875M14.0625 9.5625V14.0625C14.0625 14.6838 13.5588 15.1875 12.9375 15.1875H5.0625C4.44118 15.1875 3.9375 14.6838 3.9375 14.0625V9.5625M9 6.75C9 6.75 6.1875 6.75 5.0625 5.0625C4.26562 3.84375 5.0625 2.8125 6.1875 2.8125C7.3125 2.8125 9 4.5 9 6.75ZM9 6.75C9 4.5 10.6875 2.8125 11.8125 2.8125C12.9375 2.8125 13.7344 3.84375 12.9375 5.0625C11.8125 6.75 9 6.75 9 6.75Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Add button */}
        <button
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-colors"
          style={{ backgroundColor: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-on-surface)"; e.currentTarget.style.color = "var(--color-surface)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-variant)"; e.currentTarget.style.color = "var(--color-on-surface)"; }}
        >
          <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="6.75" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9 6V12M6 9H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Hero — charm image + balance */}
      <div className="flex flex-col items-center gap-3 mt-8 mb-8">
        <div className="w-[133px] h-[131px] relative">
          <Image
            src="/image-studio/background/Charms_Default_A02_1.png"
            alt="Charm"
            fill
            className="object-contain"
            sizes="133px"
          />
        </div>
        <div className="flex items-center gap-2">
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="23" height="23" rx="3.68" fill="var(--color-on-surface)" />
            <path d="M11.0492 17.0361C7.38948 17.0361 5.02002 14.6432 5.02002 10.9365C5.02002 7.27677 7.45986 4.79001 11.0492 4.79001C14.0756 4.79001 16.187 6.54951 16.4216 9.15357H13.8879C13.6298 7.60521 12.668 6.90141 11.0492 6.90141C8.91438 6.90141 7.671 8.44977 7.671 10.9365C7.671 13.4467 8.93784 14.9247 11.0492 14.9247C12.7384 14.9247 13.6533 14.2913 14.0052 12.6726H16.5389C16.2339 15.2766 14.1929 17.0361 11.0492 17.0361Z" fill="var(--color-surface)" />
          </svg>
          <span
            className="text-[40px] font-medium leading-none tracking-tight"
            style={{ color: "var(--color-on-surface)" }}
          >
            {charmsBalance}
          </span>
        </div>
      </div>

    </div>
  );
}
