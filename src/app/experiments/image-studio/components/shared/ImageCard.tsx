"use client";

import Image from "next/image";

interface ImageCardProps {
  imageUrl?: string;
  isLoading?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isMobile?: boolean;
  fillContainer?: boolean;
}

export function ImageCard({
  imageUrl,
  isLoading = false,
  onClick,
  isSelected = false,
  isMobile = false,
  fillContainer = false,
}: ImageCardProps) {
  const showLoading = isLoading || !imageUrl;

  // Determine sizing classes
  const getSizeClasses = () => {
    if (fillContainer) {
      return "flex-1 min-w-0 aspect-[9/16]";
    }
    if (isMobile) {
      // Fixed width for horizontal scrolling on mobile
      return "w-[160px] shrink-0 aspect-[9/16]";
    }
    return "w-[219px] h-[389px]";
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl overflow-hidden
        ${getSizeClasses()}
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
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* Animated blue glow effect */}
          <div
            className="absolute w-[200%] h-[200%] animate-loading-glow"
            style={{
              background: `
                radial-gradient(
                  ellipse at center,
                  rgba(25, 94, 255, 0.5) 0%,
                  rgba(25, 94, 255, 0.3) 25%,
                  rgba(25, 94, 255, 0.1) 50%,
                  transparent 70%
                )
              `,
            }}
          />
          {/* Secondary white pulse */}
          <div
            className="absolute w-full h-full animate-loading-pulse"
            style={{
              background: `
                radial-gradient(
                  ellipse at center,
                  rgba(255, 255, 255, 0.15) 0%,
                  transparent 60%
                )
              `,
            }}
          />
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
