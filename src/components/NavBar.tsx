"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Experiments", href: "/experiments" },
  { label: "Stories", href: "/stories" },
  { label: "Community", href: "/community" },
];

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {isOpen ? (
        // X icon when menu is open
        <path
          d="M6 6L18 18M6 18L18 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        // Hamburger icon when menu is closed
        <>
          <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

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
  navOpacity?: number;
  onMobileMenuChange?: (isOpen: boolean) => void;
  showLogo?: boolean;
}

export function NavBar({ navOpacity = 1, onMobileMenuChange, showLogo = false }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const textColor = "var(--color-on-surface)";

  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    onMobileMenuChange?.(newState);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    onMobileMenuChange?.(false);
  };

  return (
    <>
      <nav
        className="fixed left-0 right-0 z-50 flex items-center px-4 lg:px-8 py-4 lg:py-5 transition-all duration-300"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Hamburger Menu Button - mobile only */}
        <button
          className="lg:hidden p-2 -ml-2 z-50"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          style={{ color: textColor, opacity: navOpacity }}
        >
          <HamburgerIcon isOpen={mobileMenuOpen} />
        </button>

        {/* Centered Logo - for subpages */}
        {showLogo && (
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 hover:opacity-70 transition-opacity"
            style={{ opacity: navOpacity }}
          >
            <img
              src="/logo.svg"
              alt="(c.ai)labs"
              className="h-[22px] md:h-[26px] dark:brightness-0 dark:invert"
              draggable={false}
            />
          </Link>
        )}

        {/* Nav Links - desktop only */}
        <div
          className="hidden lg:flex gap-4 items-center flex-1"
          style={{ opacity: navOpacity }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-mono text-base px-1 py-0.5 rounded-lg hover:opacity-70"
              style={{
                color: textColor,
                transition: "color 300ms ease",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Social Links - desktop only (shown in mobile menu when open) */}
        <div
          className="hidden lg:flex gap-4 items-center flex-1 justify-end pr-4"
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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="flex flex-col gap-8 p-6 pt-24">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={handleLinkClick}
              className="font-mono text-3xl hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-on-background)" }}
            >
              {link.label}
            </Link>
          ))}

          {/* Social links in mobile menu */}
          <div className="flex gap-6 mt-8 pt-8 border-t" style={{ borderColor: "var(--color-outline)" }}>
            <a
              href="https://x.com/character_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-on-background)" }}
            >
              <XIcon />
            </a>
            <a
              href="https://discord.gg/characterai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-on-background)" }}
            >
              <DiscordIcon />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;
