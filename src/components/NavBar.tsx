"use client";

import Link from "next/link";
import { LabsLogo } from "@/components/Logo";
import { RefObject } from "react";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Experiments", href: "/experiments" },
  { label: "Stories", href: "/stories" },
  { label: "Community", href: "/community" },
];

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.1761 2.0625H20.3044L13.4416 9.8825L21.5 19.9375H15.2084L10.2091 13.4525L4.48387 19.9375H1.35387L8.69387 11.5775L0.9375 2.0625H7.38387L11.9096 8.00125L17.1761 2.0625ZM16.0554 18.0625H17.8379L6.4375 3.8775H4.52287L16.0554 18.0625Z" fill="currentColor"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.6167 4.15583C17.2417 3.52583 15.7667 3.06667 14.2167 2.80833C14.0333 3.135 13.8167 3.58333 13.6667 3.935C12.0167 3.69417 10.3833 3.69417 8.76667 3.935C8.61667 3.58333 8.39167 3.135 8.20833 2.80833C6.65833 3.06667 5.175 3.53417 3.8 4.16417C0.983333 8.35583 0.225 12.4383 0.604167 16.4617C2.46667 17.8533 4.27083 18.7 6.04167 19.25C6.46667 18.6733 6.84167 18.0542 7.16667 17.4025C6.55 17.1692 5.95833 16.8775 5.4 16.5358C5.55 16.4283 5.69167 16.3125 5.83333 16.1967C9.20833 17.7633 12.8583 17.7633 16.1917 16.1967C16.3333 16.3125 16.475 16.4283 16.625 16.5358C16.0583 16.8775 15.4667 17.1692 14.8583 17.4025C15.1833 18.0542 15.5583 18.6733 15.9833 19.25C17.7542 18.7 19.5667 17.8533 21.4208 16.4617C21.8667 11.8092 20.6833 7.76833 18.6167 4.15583ZM7.35 14.0358C6.28333 14.0358 5.41667 13.0617 5.41667 11.8758C5.41667 10.69 6.26667 9.70833 7.35 9.70833C8.43333 9.70833 9.3 10.6817 9.28333 11.8758C9.29167 13.0617 8.43333 14.0358 7.35 14.0358ZM14.675 14.0358C13.6083 14.0358 12.7417 13.0617 12.7417 11.8758C12.7417 10.69 13.5917 9.70833 14.675 9.70833C15.7583 9.70833 16.625 10.6817 16.6083 11.8758C16.6083 13.0617 15.7583 14.0358 14.675 14.0358Z" fill="currentColor"/>
    </svg>
  );
}

interface NavBarProps {
  isScrolled?: boolean;
  logoRef?: RefObject<HTMLDivElement | null>;
  navOpacity?: number;
}

export function NavBar({ isScrolled = false, logoRef, navOpacity = 1 }: NavBarProps) {
  const textColor = "var(--color-on-surface)";
  return (
    <nav
      className="fixed left-0 right-0 z-50 flex items-center px-11 py-5 transition-all duration-300"
      style={{ background: "transparent" }}
    >
      {/* Nav Links */}
      <div
        className="flex gap-4 items-center flex-1"
        style={{ opacity: navOpacity }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-mono text-lg px-1 py-0.5 rounded-lg hover:opacity-70"
            style={{
              color: textColor,
              transition: "color 300ms ease",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Center Logo - positioned relative to viewport center, not nav */}
      <div
        ref={logoRef}
        className="fixed left-1/2 transition-all duration-500 ease-out"
        style={{
          top: "20px",
          opacity: isScrolled ? 1 : 0,
          transform: `translateX(-50%) translateY(${isScrolled ? 0 : 20}px)`,
          pointerEvents: isScrolled ? "auto" : "none",
        }}
      >
        <LabsLogo />
      </div>

      {/* Social Links */}
      <div
        className="flex gap-4 items-center flex-1 justify-end pr-4"
        style={{ opacity: navOpacity }}
      >
        <a
          href="https://x.com/character_ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70"
          style={{
            color: textColor,
            transition: "color 300ms ease",
          }}
        >
          <XIcon />
        </a>
        <a
          href="https://discord.gg/characterai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70"
          style={{
            color: textColor,
            transition: "color 300ms ease",
          }}
        >
          <DiscordIcon />
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
