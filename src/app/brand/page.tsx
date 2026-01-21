"use client";

import { useState, useEffect, useCallback } from "react";
import { ParallaxHero } from "@/components/ParallaxHero";
import { useScrollSnap } from "@/components/ParallaxHero/useScrollSnap";

export default function BrandPage() {
  const [introComplete, setIntroComplete] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Update viewport height
  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Use the weighted scroll snap hook
  const {
    containerRef,
    currentSection,
    previousSection,
    scrollProgress,
    isAnimating,
    displacement,
    transitionProgress,
  } = useScrollSnap({
    sectionCount: 3,
    threshold: 0.18,
    dampingFactor: 0.25,
    transitionDuration: 700,
    rubberBandDuration: 250,
    enabled: introComplete,
  });

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  // Calculate section transforms based on displacement and transition progress
  const getSectionStyle = (sectionIndex: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "100vh",
      willChange: "transform",
    };

    // During animated transition between sections
    if (isAnimating && transitionProgress > 0) {
      const direction = currentSection > previousSection ? 1 : -1;

      if (sectionIndex === currentSection) {
        // Target section sliding in
        // Starts at +/- 100vh and moves to 0
        const offset = (1 - transitionProgress) * viewportHeight * direction;
        baseStyle.transform = `translateY(${offset}px)`;
        baseStyle.visibility = "visible";
      } else if (sectionIndex === previousSection) {
        // Previous section sliding out
        // Starts at 0 and moves to -/+ 100vh
        const offset = -transitionProgress * viewportHeight * direction;
        baseStyle.transform = `translateY(${offset}px)`;
        baseStyle.visibility = "visible";
      } else {
        // Other sections hidden
        baseStyle.visibility = "hidden";
        baseStyle.transform = sectionIndex < currentSection
          ? "translateY(-100vh)"
          : "translateY(100vh)";
      }
    } else if (isAnimating) {
      // Rubber-band animation (transitionProgress = 0)
      if (sectionIndex === currentSection) {
        baseStyle.transform = `translateY(${-displacement}px)`;
        baseStyle.visibility = "visible";
      } else {
        baseStyle.visibility = "hidden";
        baseStyle.transform = sectionIndex < currentSection
          ? "translateY(-100vh)"
          : "translateY(100vh)";
      }
    } else {
      // Not animating - handle resistance/preview state
      if (sectionIndex === currentSection) {
        // Current section moves with displacement (resistance effect)
        baseStyle.transform = `translateY(${-displacement}px)`;
        baseStyle.visibility = "visible";
      } else if (sectionIndex === currentSection + 1 && displacement > 0) {
        // Next section peeks in from below during downward scroll
        const offset = viewportHeight - displacement;
        baseStyle.transform = `translateY(${offset}px)`;
        baseStyle.visibility = "visible";
      } else if (sectionIndex === currentSection - 1 && displacement < 0) {
        // Previous section peeks in from above during upward scroll
        const offset = -viewportHeight - displacement;
        baseStyle.transform = `translateY(${offset}px)`;
        baseStyle.visibility = "visible";
      } else {
        // Other sections hidden off-screen
        baseStyle.visibility = "hidden";
        baseStyle.transform = sectionIndex < currentSection
          ? "translateY(-100vh)"
          : "translateY(100vh)";
      }
    }

    return baseStyle;
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden relative"
      style={{ background: "#0a1a0a" }}
    >
      {/* Section 1: Hero with Parallax */}
      <section
        className="w-full"
        style={getSectionStyle(0)}
      >
        <ParallaxHero
          scrollProgress={
            // During animation from section 0 to 1, use transitionProgress
            isAnimating && previousSection === 0 && currentSection === 1
              ? transitionProgress
              // During animation from section 1 to 0, invert transitionProgress
              : isAnimating && previousSection === 1 && currentSection === 0
              ? 1 - transitionProgress
              // Not animating: use scrollProgress if on section 0, otherwise base on section
              : currentSection === 0
              ? scrollProgress
              : currentSection > 0
              ? 1
              : 0
          }
          onIntroComplete={handleIntroComplete}
        />
      </section>

      {/* Section 2: Placeholder */}
      <section
        className="w-full flex items-center justify-center"
        style={{
          ...getSectionStyle(1),
          background: "linear-gradient(180deg, #0a1a0a 0%, #0f1f0f 100%)",
        }}
      >
        <div className="text-center">
          <h2
            className="text-4xl font-semibold mb-4"
            style={{ color: "#ffffff" }}
          >
            Section 2
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Content coming soon
          </p>
        </div>
      </section>

      {/* Section 3: Placeholder */}
      <section
        className="w-full flex items-center justify-center"
        style={{
          ...getSectionStyle(2),
          background: "linear-gradient(180deg, #0f1f0f 0%, #141f14 100%)",
        }}
      >
        <div className="text-center">
          <h2
            className="text-4xl font-semibold mb-4"
            style={{ color: "#ffffff" }}
          >
            Section 3
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Content coming soon
          </p>
        </div>
      </section>
    </div>
  );
}
