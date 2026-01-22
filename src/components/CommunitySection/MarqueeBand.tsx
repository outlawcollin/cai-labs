"use client";

import { useMemo, useId, useState, useEffect } from "react";
import { CommunityCard } from "./CommunityCard";
import { BandConfig, CommunityCreation } from "@/data/communityCreations";

interface MarqueeBandProps {
  config: BandConfig;
  creations: CommunityCreation[];
}

const BASE_DURATION = 45; // Slower animation (was 35)
const CARD_GAP = 60;
const MOBILE_CARD_GAP = 30; // Smaller gap on mobile
const BASE_SIZES = {
  landscape: 280,
  portrait: 180,
};
const MOBILE_SCALE = 0.6; // 60% size on mobile

export function MarqueeBand({ config, creations }: MarqueeBandProps) {
  const animationId = useId().replace(/:/g, "");
  const duration = BASE_DURATION / config.speedMultiplier;

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const effectiveScale = isMobile ? config.cardScale * MOBILE_SCALE : config.cardScale;
  const effectiveGap = isMobile ? MOBILE_CARD_GAP : CARD_GAP;

  const setWidth = useMemo(() => {
    let width = 0;
    creations.forEach((c) => {
      const baseWidth = BASE_SIZES[c.orientation];
      width += Math.round(baseWidth * effectiveScale) + effectiveGap;
    });
    return width;
  }, [creations, effectiveScale, effectiveGap]);

  const duplicatedCreations = useMemo(
    () => [...creations, ...creations, ...creations],
    [creations]
  );

  // Use translate3d for GPU acceleration (prevents flash)
  const keyframeCSS = `
    @keyframes marquee-${animationId} {
      0% { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-${setWidth}px, 0, 0); }
    }
  `;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: config.zIndex,
        perspective: "1000px",
      }}
    >
      <style>{keyframeCSS}</style>

      <div
        className="h-full flex flex-nowrap items-start"
        style={{
          animation: `marquee-${animationId} ${duration}s linear infinite`,
          willChange: "transform",
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
        }}
      >
        {duplicatedCreations.map((creation, index) => (
          <div
            key={`${creation.id}-${index}`}
            className="flex-shrink-0 pointer-events-auto"
            style={{
              // Use transform for Y positioning (doesn't block hover on back layers)
              // Convert yOffset (0-70) to vh, shift range to allow top overflow (-10 to 50vh)
              // Scale down Y offset on mobile for smaller container
              transform: `translateY(${((creation.yOffset * 0.85) - 10) * (isMobile ? 0.8 : 1)}vh)`,
              marginRight: `${effectiveGap}px`,
            }}
          >
            <CommunityCard creation={creation} scale={effectiveScale} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarqueeBand;
