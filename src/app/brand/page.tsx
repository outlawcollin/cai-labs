"use client";

import { useState, useEffect, useCallback } from "react";
import { ParallaxHero } from "@/components/ParallaxHero";
import { useScrollSnap } from "@/components/ParallaxHero/useScrollSnap";

export default function BrandPage() {
  const [introComplete, setIntroComplete] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
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

  // Show scroll indicator after intro completes
  useEffect(() => {
    if (introComplete) {
      const timeout = setTimeout(() => {
        setShowScrollIndicator(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [introComplete]);

  // Hide scroll indicator when scrolling starts
  useEffect(() => {
    if (currentSection > 0 || isAnimating || Math.abs(displacement) > 20) {
      setShowScrollIndicator(false);
    }
  }, [currentSection, isAnimating, displacement]);

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
          scrollProgress={currentSection === 0 ? scrollProgress : currentSection > 0 ? 1 : 0}
          onIntroComplete={handleIntroComplete}
        />

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 transition-opacity duration-500"
          style={{ opacity: showScrollIndicator && currentSection === 0 ? 1 : 0 }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            Scroll to explore
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div
              className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce"
              style={{ animationDuration: "1.5s" }}
            />
          </div>
        </div>
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
