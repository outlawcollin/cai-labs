"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// New color variants based on Figma design
// Light variants: light background with dark text and outline button
// Dark variants: dark background with white text and filled black button
type ColorVariant =
  | "lime-light"
  | "lime-dark"
  | "lavender-light"
  | "lavender-dark"
  | "butter-light"
  | "butter-dark"
  | "rose-light"
  | "rose-dark"
  | "sky-light"
  | "sky-dark";

interface ExperimentCardProps {
  title: string;
  description: string;
  href: string;
  variant?: ColorVariant;
  tag?: string;
  buttonText?: string;
  imageSrc?: string;
  imageAlt?: string;
  onHoverStart?: () => void;
  isMobile?: boolean;
}

interface VariantStyle {
  background: string;
  backgroundHover: string;
  text: string;
  textHover: string;
  buttonStyle: "outline" | "filled";
  buttonBorder: string;
}

const variantStyles: Record<ColorVariant, VariantStyle> = {
  // Lime variants
  "lime-light": {
    background: "var(--color-wired-lime)",
    backgroundHover: "var(--color-midnight-forest)",
    text: "var(--color-brand-pure-black)",
    textHover: "var(--color-brand-pure-white)",
    buttonStyle: "outline",
    buttonBorder: "var(--color-midnight-forest)",
  },
  "lime-dark": {
    background: "var(--color-midnight-forest)",
    backgroundHover: "var(--color-wired-lime)",
    text: "var(--color-brand-pure-white)",
    textHover: "var(--color-brand-pure-black)",
    buttonStyle: "filled",
    buttonBorder: "var(--color-brand-pure-black)",
  },
  // Lavender variants
  "lavender-light": {
    background: "var(--color-lowkey-lavender)",
    backgroundHover: "var(--color-alt-violet)",
    text: "var(--color-brand-pure-black)",
    textHover: "var(--color-brand-pure-white)",
    buttonStyle: "outline",
    buttonBorder: "var(--color-alt-violet)",
  },
  "lavender-dark": {
    background: "var(--color-alt-violet)",
    backgroundHover: "var(--color-lowkey-lavender)",
    text: "var(--color-brand-pure-white)",
    textHover: "var(--color-brand-pure-black)",
    buttonStyle: "filled",
    buttonBorder: "var(--color-brand-pure-black)",
  },
  // Butter variants
  "butter-light": {
    background: "var(--color-slippery-butter)",
    backgroundHover: "var(--color-toasty-amber)",
    text: "var(--color-brand-pure-black)",
    textHover: "var(--color-brand-pure-white)",
    buttonStyle: "outline",
    buttonBorder: "var(--color-toasty-amber)",
  },
  "butter-dark": {
    background: "var(--color-toasty-amber)",
    backgroundHover: "var(--color-slippery-butter)",
    text: "var(--color-brand-pure-white)",
    textHover: "var(--color-brand-pure-black)",
    buttonStyle: "filled",
    buttonBorder: "var(--color-brand-pure-black)",
  },
  // Rose variants
  "rose-light": {
    background: "var(--color-irl-rose)",
    backgroundHover: "var(--color-hyperlink-magenta)",
    text: "var(--color-brand-pure-black)",
    textHover: "var(--color-brand-pure-white)",
    buttonStyle: "outline",
    buttonBorder: "var(--color-hyperlink-magenta)",
  },
  "rose-dark": {
    background: "var(--color-hyperlink-magenta)",
    backgroundHover: "var(--color-irl-rose)",
    text: "var(--color-brand-pure-white)",
    textHover: "var(--color-brand-pure-black)",
    buttonStyle: "filled",
    buttonBorder: "var(--color-brand-pure-black)",
  },
  // Sky variants
  "sky-light": {
    background: "var(--color-icy-sky)",
    backgroundHover: "var(--color-default-blue)",
    text: "var(--color-brand-pure-black)",
    textHover: "var(--color-brand-pure-white)",
    buttonStyle: "outline",
    buttonBorder: "var(--color-default-blue)",
  },
  "sky-dark": {
    background: "var(--color-default-blue)",
    backgroundHover: "var(--color-icy-sky)",
    text: "var(--color-brand-pure-white)",
    textHover: "var(--color-brand-pure-black)",
    buttonStyle: "filled",
    buttonBorder: "var(--color-brand-pure-black)",
  },
};

export function ExperimentCard({
  title,
  description,
  href,
  variant = "lime-light",
  tag,
  buttonText = "Try Now",
  imageSrc = "/placeholder.svg",
  imageAlt = "Experiment preview",
  onHoverStart,
  isMobile = false,
}: ExperimentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const styles = variantStyles[variant];

  // Determine button appearance based on variant and hover state
  const isFilledButton = styles.buttonStyle === "filled";
  const buttonBackground = isHovered
    ? isFilledButton
      ? "transparent"
      : "var(--color-brand-pure-black)"
    : isFilledButton
      ? "var(--color-brand-pure-black)"
      : "transparent";
  const buttonBorderColor = isHovered
    ? isFilledButton
      ? "var(--color-brand-pure-black)"
      : "transparent"
    : isFilledButton
      ? "transparent"
      : styles.buttonBorder;
  const buttonTextColor = isHovered
    ? isFilledButton
      ? "var(--color-brand-pure-black)"
      : "var(--color-brand-pure-white)"
    : isFilledButton
      ? "var(--color-brand-pure-white)"
      : "var(--color-brand-pure-black)";

  // Mobile layout: horizontal with image on right
  if (isMobile) {
    return (
      <Link
        href={href}
        draggable={false}
        className="flex p-1 rounded-3xl overflow-hidden h-[300px]"
        style={{
          backgroundColor: styles.background,
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Text content */}
        <div className="flex-1 flex flex-col gap-1 p-1">
          {/* Title with optional tag */}
          <div className="flex items-start gap-2">
            <h2
              className="flex-1 font-semibold text-[24px] leading-[26px] tracking-[-0.48px] lowercase"
              style={{ color: styles.text }}
            >
              {title}
            </h2>
            {tag && (
              <div
                className="px-1.5 py-1 rounded flex items-center"
                style={{ backgroundColor: styles.text }}
              >
                <span
                  className="font-mono text-[8px] uppercase leading-none"
                  style={{ color: styles.background }}
                >
                  {tag}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <p
            className="font-medium text-[12px] leading-[16px] line-clamp-5"
            style={{ color: styles.text }}
          >
            {description}
          </p>

          {/* Button - full width, pushes to bottom */}
          <div className="flex-1 flex items-end">
            <div
              className="flex items-center justify-center gap-1.5 h-10 w-full rounded-full border"
              style={{
                borderColor: isFilledButton ? "transparent" : styles.buttonBorder,
                backgroundColor: isFilledButton ? "var(--color-brand-pure-black)" : "transparent",
              }}
            >
              <span
                className="font-medium text-sm whitespace-nowrap"
                style={{ color: isFilledButton ? "var(--color-brand-pure-white)" : "var(--color-brand-pure-black)" }}
              >
                {buttonText}
              </span>
              <ArrowRightIcon
                style={{
                  color: isFilledButton ? "var(--color-brand-pure-white)" : "var(--color-brand-pure-black)",
                  width: 16,
                  height: 16,
                }}
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-[140px] rounded-2xl overflow-hidden bg-white flex-shrink-0">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        </div>
      </Link>
    );
  }

  // Desktop layout: vertical
  return (
    <Link
      href={href}
      draggable={false}
      className="flex flex-col gap-4 w-[420px] h-[640px] pt-2 pb-3 px-3 rounded-3xl overflow-hidden"
      style={{
        backgroundColor: isHovered ? styles.backgroundHover : styles.background,
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease-out",
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverStart?.();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Top Container */}
      <div className="flex flex-col gap-4 flex-1">
        {/* Title Container */}
        <div className="flex items-start gap-2">
          <h2
            className="flex-1 font-semibold text-[48px] leading-[50px] tracking-[-0.96px] lowercase transition-colors duration-200"
            style={{ color: isHovered ? styles.textHover : styles.text }}
          >
            {title}
          </h2>
          {tag && (
            <div
              className="px-1.5 py-1 rounded transition-colors duration-200 flex items-center"
              style={{
                backgroundColor: isHovered ? styles.textHover : styles.text,
              }}
            >
              <span
                className="font-mono text-[10px] uppercase leading-none transition-colors duration-200"
                style={{
                  color: isHovered ? styles.backgroundHover : styles.background,
                }}
              >
                {tag}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p
          className="font-medium text-[16px] leading-[22px] transition-colors duration-200"
          style={{ color: isHovered ? styles.textHover : styles.text }}
        >
          {description}
        </p>

        {/* Button Container - pushes to bottom */}
        <div className="flex-1 flex flex-col justify-end items-start">
          <div
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border transition-all duration-200"
            style={{
              borderColor: buttonBorderColor,
              backgroundColor: buttonBackground,
            }}
          >
            <span
              className="font-medium text-base whitespace-nowrap transition-colors duration-200"
              style={{ color: buttonTextColor }}
            >
              {buttonText}
            </span>
            <ArrowRightIcon
              className="transition-colors duration-200"
              style={{ color: buttonTextColor }}
            />
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative h-[280px] w-full rounded-xl overflow-hidden bg-white">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      </div>
    </Link>
  );
}

function ArrowRightIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties & { width?: number; height?: number };
}) {
  const size = style?.width ?? 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ExperimentCard;
