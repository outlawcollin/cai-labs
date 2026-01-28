"use client";

import Image from "next/image";

interface ImageCardProps {
  imageUrl?: string;
  isLoading?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isMobile?: boolean;
}

export function ImageCard({
  imageUrl,
  isLoading = false,
  onClick,
  isSelected = false,
  isMobile = false,
}: ImageCardProps) {
  const showLoading = isLoading || !imageUrl;

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl overflow-hidden
        ${isMobile ? "w-full aspect-[219/389]" : "w-[219px] h-[389px]"}
        transition-all duration-200 ease-out
        ${onClick ? "cursor-pointer" : ""}
        ${isSelected ? "ring-2 ring-[#195eff] ring-offset-2" : ""}
        ${!showLoading ? "hover:scale-[1.02] hover:shadow-lg" : ""}
      `}
      style={{
        backgroundColor: "var(--color-surface-variant)",
      }}
    >
      {showLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Subtle inner glow effect */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `
                radial-gradient(
                  ellipse at center,
                  rgba(255, 255, 255, 0.08) 0%,
                  transparent 70%
                )
              `,
            }}
          />
          {/* Loading indicator dots */}
          <div className="flex gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: "var(--color-text-secondary)",
                animationDelay: "0ms",
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: "var(--color-text-secondary)",
                animationDelay: "150ms",
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: "var(--color-text-secondary)",
                animationDelay: "300ms",
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <Image
            src={imageUrl}
            alt="Generated image"
            fill
            className="object-cover"
            sizes={isMobile ? "100vw" : "219px"}
          />
          {/* Selection overlay */}
          {isSelected && (
            <div className="absolute inset-0 bg-[#195eff]/10 pointer-events-none" />
          )}
        </>
      )}
    </div>
  );
}
