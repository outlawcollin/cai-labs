"use client";

import { FooterLogo } from "./FooterLogo";
import Image from "next/image";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`pt-8 md:pt-11 px-4 md:px-8 ${className}`}
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* CTA Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between pb-6 gap-5">
        {/* CTA Text */}
        <div className="flex-1">
          <p
            className="font-medium text-lg md:text-2xl leading-7 md:leading-8 max-w-md md:max-w-lg"
            style={{ color: "var(--color-on-background)" }}
          >
            Try the experiments. Break things. Tell us what works. You are helping decide what Character.ai becomes next.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          {/* X (Twitter) Button */}
          <a
            href="https://x.com/character_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center size-11 md:size-[52px] rounded-full border transition-colors duration-200 hover:bg-[var(--color-on-background)]"
            style={{ borderColor: "var(--color-outline)" }}
            aria-label="Follow us on X"
          >
            <Image
              src="/icons/x.svg"
              alt=""
              width={22}
              height={22}
              className="transition-all duration-200 dark:invert group-hover:invert dark:group-hover:invert-0 w-5 h-5 md:w-[22px] md:h-[22px]"
            />
          </a>

          {/* Discord Button */}
          <a
            href="https://discord.gg/characterai"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center size-11 md:size-[52px] rounded-full border transition-colors duration-200 hover:bg-[var(--color-on-background)]"
            style={{ borderColor: "var(--color-outline)" }}
            aria-label="Join our Discord"
          >
            <Image
              src="/icons/discord.svg"
              alt=""
              width={22}
              height={22}
              className="transition-all duration-200 dark:invert group-hover:invert dark:group-hover:invert-0 w-5 h-5 md:w-[22px] md:h-[22px]"
            />
          </a>

          {/* Feedback Button */}
          <a
            href="/feedback"
            className="group flex items-center justify-center h-11 md:h-[52px] px-5 md:px-[22px] rounded-full border transition-colors duration-200 hover:bg-[var(--color-on-background)]"
            style={{ borderColor: "var(--color-outline)" }}
          >
            <span
              className="font-medium text-base md:text-lg whitespace-nowrap transition-colors duration-200 text-[var(--color-on-background)] group-hover:!text-[var(--color-background)]"
            >
              Give us feedback
            </span>
          </a>
        </div>
      </div>

      {/* Logo Section */}
      <div>
        <FooterLogo />
      </div>

      {/* Bottom Links */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-5 gap-2 md:gap-0">
        <a
          href="https://character.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sm md:text-base transition-opacity hover:opacity-70"
          style={{ color: "var(--color-on-background)" }}
        >
          Built by Character.ai
        </a>

        <a
          href="/privacy"
          className="font-medium text-sm md:text-base transition-opacity hover:opacity-70"
          style={{ color: "var(--color-on-background)" }}
        >
          Privacy & Terms
        </a>

        <span
          className="font-medium text-sm md:text-base"
          style={{ color: "var(--color-on-background)" }}
        >
          2026
        </span>
      </div>
    </footer>
  );
}

export default Footer;
