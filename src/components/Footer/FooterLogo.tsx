"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { playSound } from "@/lib/sounds/soundManager";

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Split logo into two parts with different fonts
// "(c.ai)" uses Character Sans, "labs" uses mono
const CAILABS_CHARS = ["(", "c", ".", "a", "i", ")"];  // Character Sans
const LABS_CHARS = ["l", "a", "b", "s"];               // Mono
const LOGO_CHARS = [...CAILABS_CHARS, ...LABS_CHARS];

// Slower, calmer animation timing
const CHAR_STAGGER = 120; // ms between each character starting
const CHAR_DURATION = 750; // ms for each character to resolve
const TOTAL_DURATION = CHAR_STAGGER * LOGO_CHARS.length + CHAR_DURATION;

// Very subtle chromatic aberration
const MAX_CHROMA = 2; // pixels

interface CharacterState {
  char: string;
  opacity: number;
}

export function FooterLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSVG, setShowSVG] = useState(false); // Show SVG after animation completes
  const [svgOpacity, setSvgOpacity] = useState(0); // For fade-in transition
  const [characters, setCharacters] = useState<CharacterState[]>(
    LOGO_CHARS.map((char) => ({
      char,
      opacity: 1,
    }))
  );
  const [chromaOffset, setChromaOffset] = useState(0);

  // Get random glitch character
  const getGlitchChar = useCallback(() => {
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }, []);

  // Start the animation
  const startAnimation = useCallback(() => {
    if (hasAnimatedRef.current || isAnimating) return;

    hasAnimatedRef.current = true;
    setIsAnimating(true);

    // Play glitch sound
    playSound("glitch");

    // Initialize all characters as glitched
    setCharacters(
      LOGO_CHARS.map(() => ({
        char: getGlitchChar(),
        opacity: 0.6,
      }))
    );

    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const overallProgress = Math.min(elapsed / TOTAL_DURATION, 1);

      // Chromatic aberration - subtle, peaks at middle
      const chromaProgress = Math.sin(overallProgress * Math.PI);
      setChromaOffset(chromaProgress * MAX_CHROMA);

      // Update each character
      setCharacters(
        LOGO_CHARS.map((finalChar, index) => {
          const charStartTime = index * CHAR_STAGGER;
          const charElapsed = elapsed - charStartTime;

          if (charElapsed < 0) {
            // Not started yet - show glitch char
            return {
              char: getGlitchChar(),
              opacity: 0.6 + Math.random() * 0.2,
            };
          }

          const charProgress = Math.min(charElapsed / CHAR_DURATION, 1);

          if (charProgress >= 1) {
            // Fully resolved
            return {
              char: finalChar,
              opacity: 1,
            };
          }

          // Transitioning - start fast, slow down (cubic easing for ease-out feel)
          // Shuffle less frequently as animation progresses
          const easeOutProgress = 1 - Math.pow(1 - charProgress, 3); // Cubic ease-out
          const showReal = Math.random() < easeOutProgress;

          // Reduce shuffle frequency - only shuffle every few frames based on progress
          // Early: shuffle often, Late: shuffle rarely
          const shouldShuffle = Math.random() < (1 - easeOutProgress) * 0.5;

          return {
            char: showReal ? finalChar : (shouldShuffle ? getGlitchChar() : finalChar),
            opacity: 0.7 + charProgress * 0.3,
          };
        })
      );

      if (elapsed < TOTAL_DURATION) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - switch to SVG with fade-in
        setCharacters(
          LOGO_CHARS.map((char) => ({
            char,
            opacity: 1,
          }))
        );
        setChromaOffset(0);
        setIsAnimating(false);
        setShowSVG(true);
        // Fade in SVG smoothly
        requestAnimationFrame(() => setSvgOpacity(1));
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating, getGlitchChar]);

  // Intersection Observer to trigger animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            startAnimation();
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [startAnimation]);

  // SVG aspect ratio: 234/51 ≈ 4.59
  // Render characters with proper fonts: Character Sans for "(c.ai)", mono for "labs"
  const renderCharacters = (offsetX: number = 0, color?: string) => (
    <span
      className="leading-[0.85] whitespace-nowrap flex"
      style={{
        fontSize: "calc((100vw - 88px) / 4.59)",
        color: color || "var(--color-primary)",
        transform: offsetX ? `translateX(${offsetX}px)` : undefined,
      }}
    >
      {/* "(c.ai)" part - Character Sans font */}
      <span style={{ fontFamily: '"Character Sans", sans-serif' }}>
        {characters.slice(0, CAILABS_CHARS.length).map((c, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: c.opacity,
            }}
          >
            {c.char}
          </span>
        ))}
      </span>
      {/* "labs" part - Mono font */}
      <span className="font-mono">
        {characters.slice(CAILABS_CHARS.length).map((c, i) => (
          <span
            key={i + CAILABS_CHARS.length}
            style={{
              display: "inline-block",
              opacity: c.opacity,
            }}
          >
            {c.char}
          </span>
        ))}
      </span>
    </span>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        // Fixed height matching SVG's rendered height (width / aspect_ratio)
        // This prevents layout jump when switching from text to SVG
        height: "calc((100vw - 88px) / 4.59)",
      }}
    >
      {showSVG ? (
        /* SVG logo after animation completes */
        <img
          src="/logo.svg"
          alt="(c.ai)labs"
          className="w-full dark:brightness-0 dark:invert"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            opacity: svgOpacity,
            transition: "opacity 200ms ease-out",
            userSelect: "none",
            WebkitUserDrag: "none",
            pointerEvents: "none",
          } as React.CSSProperties}
        />
      ) : (
        <>
          {/* Red chromatic layer */}
          {chromaOffset > 0.1 && (
            <div
              className="absolute inset-0 pointer-events-none select-none"
              style={{
                mixBlendMode: "multiply",
              }}
              aria-hidden="true"
            >
              {renderCharacters(-chromaOffset, "rgba(255, 0, 0, 0.25)")}
            </div>
          )}

          {/* Blue chromatic layer */}
          {chromaOffset > 0.1 && (
            <div
              className="absolute inset-0 pointer-events-none select-none"
              style={{
                mixBlendMode: "multiply",
              }}
              aria-hidden="true"
            >
              {renderCharacters(chromaOffset, "rgba(0, 100, 255, 0.25)")}
            </div>
          )}

          {/* Main text */}
          <div className="relative">
            {renderCharacters()}
          </div>
        </>
      )}
    </div>
  );
}

export default FooterLogo;
