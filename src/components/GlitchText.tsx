"use client";

import { useMemo } from "react";

interface GlitchTextProps {
  text: string;
  isGlitching?: boolean;
  glitchOffset?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GlitchText({
  text,
  isGlitching = false,
  glitchOffset = 0,
  className = "",
  style = {},
}: GlitchTextProps) {
  // Generate RGB split layers for glitch effect
  const glitchLayers = useMemo(() => {
    if (!isGlitching) return null;

    return (
      <>
        {/* Red channel offset */}
        <span
          className="absolute inset-0 opacity-70"
          style={{
            color: "#ff0000",
            transform: `translateX(${glitchOffset * 0.5}px)`,
            mixBlendMode: "screen",
          }}
          aria-hidden="true"
        >
          {text}
        </span>
        {/* Cyan channel offset */}
        <span
          className="absolute inset-0 opacity-70"
          style={{
            color: "#00ffff",
            transform: `translateX(${-glitchOffset * 0.5}px)`,
            mixBlendMode: "screen",
          }}
          aria-hidden="true"
        >
          {text}
        </span>
      </>
    );
  }, [isGlitching, glitchOffset, text]);

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        ...style,
        transform: isGlitching ? `translateX(${glitchOffset}px)` : undefined,
      }}
    >
      {/* Main text */}
      <span className="relative z-10">{text}</span>
      {/* Glitch layers */}
      {glitchLayers}
    </span>
  );
}

export default GlitchText;
