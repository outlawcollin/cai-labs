"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ColorVariant = "primary" | "secondary" | "tertiary" | "warning" | "error";

interface ExperimentCardProps {
  title: string;
  description: string;
  href: string;
  variant?: ColorVariant;
  tag?: string;
  buttonText?: string;
  imageSrc?: string;
  imageAlt?: string;
}

const variantStyles: Record<
  ColorVariant,
  {
    container: string;
    containerHover: string;
    title: string;
    titleHover: string;
    tag: string;
    tagHover: string;
    tagText: string;
    tagTextHover: string;
    buttonBorder: string;
  }
> = {
  primary: {
    container: "var(--color-primary-container)",
    containerHover: "var(--color-primary)",
    title: "var(--color-on-primary-container)",
    titleHover: "var(--color-on-primary)",
    tag: "var(--color-primary)",
    tagHover: "var(--color-on-primary)",
    tagText: "var(--color-on-primary)",
    tagTextHover: "var(--color-on-primary-container)",
    buttonBorder: "var(--color-primary)",
  },
  secondary: {
    container: "var(--color-secondary-container)",
    containerHover: "var(--color-secondary)",
    title: "var(--color-on-secondary-container)",
    titleHover: "var(--color-on-secondary)",
    tag: "var(--color-secondary)",
    tagHover: "var(--color-on-secondary)",
    tagText: "var(--color-on-secondary)",
    tagTextHover: "var(--color-on-secondary-container)",
    buttonBorder: "var(--color-secondary)",
  },
  tertiary: {
    container: "var(--color-tertiary-container)",
    containerHover: "var(--color-tertiary)",
    title: "var(--color-on-tertiary-container)",
    titleHover: "var(--color-on-tertiary)",
    tag: "var(--color-tertiary)",
    tagHover: "var(--color-on-tertiary)",
    tagText: "var(--color-on-tertiary)",
    tagTextHover: "var(--color-on-tertiary-container)",
    buttonBorder: "var(--color-tertiary)",
  },
  warning: {
    container: "var(--color-warning-container)",
    containerHover: "var(--color-warning)",
    title: "var(--color-on-warning-container)",
    titleHover: "var(--color-on-warning)",
    tag: "var(--color-warning)",
    tagHover: "var(--color-on-warning)",
    tagText: "var(--color-on-warning)",
    tagTextHover: "var(--color-on-warning-container)",
    buttonBorder: "var(--color-warning)",
  },
  error: {
    container: "var(--color-error-container)",
    containerHover: "var(--color-error)",
    title: "var(--color-on-error-container)",
    titleHover: "var(--color-on-error)",
    tag: "var(--color-error)",
    tagHover: "var(--color-on-error)",
    tagText: "var(--color-on-error)",
    tagTextHover: "var(--color-on-error-container)",
    buttonBorder: "var(--color-error)",
  },
};

export function ExperimentCard({
  title,
  description,
  href,
  variant = "primary",
  tag,
  buttonText = "Try Now",
  imageSrc = "/placeholder.svg",
  imageAlt = "Experiment preview",
}: ExperimentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const styles = variantStyles[variant];

  return (
    <Link
      href={href}
      className="flex flex-col gap-4 w-[420px] h-[580px] p-3 rounded-3xl overflow-hidden"
      style={{
        backgroundColor: isHovered ? styles.containerHover : styles.container,
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease-out",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Container */}
      <div className="flex flex-col gap-4 flex-1">
        {/* Title Container */}
        <div className="flex items-start gap-2">
          <h2
            className="flex-1 font-bold text-[62px] leading-[60px] tracking-tight transition-colors duration-200"
            style={{ color: isHovered ? styles.titleHover : styles.title }}
          >
            {title}
          </h2>
          {tag && (
            <div
              className="px-1.5 py-1 rounded transition-colors duration-200 flex items-center"
              style={{ backgroundColor: isHovered ? styles.tagHover : styles.tag }}
            >
              <span
                className="font-mono text-[10px] uppercase leading-none transition-colors duration-200"
                style={{ color: isHovered ? styles.tagTextHover : styles.tagText }}
              >
                {tag}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p
          className="font-medium text-sm transition-colors duration-200"
          style={{ color: isHovered ? styles.titleHover : "var(--color-on-surface)" }}
        >
          {description}
        </p>

        {/* Button Container - pushes to bottom */}
        <div className="flex-1 flex flex-col justify-end items-start">
          <div
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border transition-colors duration-200"
            style={{
              borderColor: isHovered ? "transparent" : styles.buttonBorder,
              backgroundColor: isHovered ? "var(--color-inverse-surface)" : "transparent",
            }}
          >
            <span
              className="font-medium text-base whitespace-nowrap transition-colors duration-200"
              style={{ color: isHovered ? "var(--color-inverse-on-surface)" : "var(--color-on-surface)" }}
            >
              {buttonText}
            </span>
            <ArrowRightIcon
              className="transition-colors duration-200"
              style={{ color: isHovered ? "var(--color-inverse-on-surface)" : "var(--color-on-surface)" }}
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
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="20"
      height="20"
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
