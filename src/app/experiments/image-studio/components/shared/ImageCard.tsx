"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageCardProps {
  imageUrl?: string;
  isLoading?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isMobile?: boolean;
  fillContainer?: boolean;
  onDownload?: () => void;
  onPost?: () => void;
}

export function ImageCard({
  imageUrl,
  isLoading = false,
  onClick,
  isSelected = false,
  isMobile = false,
  fillContainer = false,
  onDownload,
  onPost,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const showLoading = isLoading || !imageUrl;
  const showHoverOverlay = !showLoading && isHovered && imageUrl;

  // Determine sizing classes
  const getSizeClasses = () => {
    if (fillContainer) {
      return "w-full aspect-[9/16]";
    }
    if (isMobile) {
      return "w-full aspect-[9/16]";
    }
    return "w-[219px] aspect-[9/16]";
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative rounded-2xl overflow-hidden
        ${getSizeClasses()}
        transition-all duration-200 ease-out
        ${onClick ? "cursor-pointer" : ""}
        ${isSelected ? "ring-2 ring-[#195eff] ring-offset-2" : ""}
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
            src={imageUrl!}
            alt="Generated image"
            fill
            className="object-cover"
            sizes={isMobile ? "100vw" : "219px"}
          />

          {/* Selection overlay */}
          {isSelected && (
            <div className="absolute inset-0 bg-[#195eff]/10 pointer-events-none" />
          )}

          {/* Hover overlay with action buttons */}
          {showHoverOverlay && (
            <div className="absolute inset-0 flex items-start justify-end gap-2 p-3">
              {/* Download button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.();
                }}
                className="flex items-center justify-center shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-inverse-surface, #f3f3f3)",
                  color: "var(--color-inverse-on-surface, #1e1e1e)",
                }}
                aria-label="Download image"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M15.1875 11.0625V13.6875C15.1875 14.5159 14.5159 15.1875 13.6875 15.1875H4.3125C3.48407 15.1875 2.8125 14.5159 2.8125 13.6875V11.0625M8.99999 11.25V2.8125M8.99999 11.25L6.375 8.625M8.99999 11.25L11.625 8.625"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Post button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPost?.();
                }}
                className="flex items-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  height: 38,
                  borderRadius: 40,
                  backgroundColor: "var(--color-inverse-surface, #f3f3f3)",
                  color: "var(--color-inverse-on-surface, #1e1e1e)",
                  padding: "0 18px",
                }}
                aria-label="Post image"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5.625 12.4375C6.13335 12.4375 6.54545 12.8572 6.54545 13.375C6.54545 13.8928 6.13335 14.3125 5.625 14.3125C5.11665 14.3125 4.70455 13.8928 4.70455 13.375C4.70455 12.8572 5.11665 12.4375 5.625 12.4375Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.75 3.375C15.75 2.26217 15.0017 1.5 13.9091 1.5H4.09091C2.99831 1.5 2.25 2.26217 2.25 3.375V14.625C2.25 15.7378 2.99832 16.5 4.09091 16.5H13.9091C15.0017 16.5 15.75 15.7378 15.75 14.625V3.375ZM4.09091 15.25C3.72671 15.25 3.47727 14.9959 3.47727 14.625V3.375C3.47727 3.00406 3.72671 2.75 4.09091 2.75H13.9091C14.2733 2.75 14.5227 3.00406 14.5227 3.375V14.625C14.5227 14.9959 14.2733 15.25 13.9091 15.25H4.09091Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.77273 13.375C7.77273 13.0298 8.04746 12.75 8.38636 12.75H12.6818C13.0207 12.75 13.2955 13.0298 13.2955 13.375C13.2955 13.7202 13.0207 14 12.6818 14H8.38636C8.04746 14 7.77273 13.7202 7.77273 13.375Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium">Post</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
