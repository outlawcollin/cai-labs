"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useParallax } from "./useParallax";
import { useIntroAnimation } from "./useIntroAnimation";
import { useHitMap } from "./useHitMap";
import { ShuffleText } from "./ShuffleText";
import { layers, CONTAINER_WIDTH, CONTAINER_HEIGHT, ImageConfig } from "./layers";

// Determine transform origin based on image position in the frame
function getTransformOrigin(img: ImageConfig): string {
  const centerX = CONTAINER_WIDTH / 2;
  const centerY = CONTAINER_HEIGHT / 2;
  const imgCenterX = img.x + img.width / 2;
  const imgCenterY = img.y + img.height / 2;

  let originX = "center";
  let originY = "center";

  // Horizontal origin
  if (imgCenterX < centerX - 200) originX = "left";
  else if (imgCenterX > centerX + 200) originX = "right";

  // Vertical origin
  if (imgCenterY < centerY - 200) originY = "top";
  else if (imgCenterY > centerY + 200) originY = "bottom";

  return `${originX} ${originY}`;
}

// Hoverable image component with scale effect and pixel-perfect hit detection
function HoverableImage({
  img,
  priority,
  reducedMotion,
}: {
  img: ImageConfig;
  priority: boolean;
  reducedMotion: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [zBoosted, setZBoosted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use pixel-perfect hit detection
  const { hitTest } = useHitMap({
    imageSrc: img.src,
    imageWidth: img.width,
    imageHeight: img.height,
    enabled: !reducedMotion,
  });

  // Delay z-index reset until scale transition completes
  useEffect(() => {
    if (isHovered) {
      setZBoosted(true);
    } else {
      const timeout = setTimeout(() => setZBoosted(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isHovered]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle mouse move for pixel-perfect detection with hysteresis
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { isHit } = hitTest(x, y);

      if (isHit) {
        // Immediately show hover
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        setIsHovered(true);
      } else if (isHovered && !hoverTimeoutRef.current) {
        // Delay hiding hover to prevent flickering at edges
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(false);
          hoverTimeoutRef.current = null;
        }, 50); // Small delay for hysteresis
      }
    },
    [hitTest, isHovered]
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
  }, []);

  const transformOrigin = getTransformOrigin(img);
  const baseTransform = img.rotate ? `rotate(${img.rotate}deg)` : "";
  const hoverScale = !reducedMotion && isHovered ? "scale(1.08)" : "scale(1)";

  return (
    <div
      ref={containerRef}
      className="absolute cursor-pointer pointer-events-auto"
      style={{
        left: img.x,
        top: img.y,
        width: img.width,
        height: img.height,
        zIndex: zBoosted ? 100 : undefined,
        transform: `${baseTransform} ${hoverScale}`,
        transformOrigin,
        transition: reducedMotion ? "none" : "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        filter: isHovered ? "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" : "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={img.src}
        alt=""
        width={img.width}
        height={img.height}
        className="object-cover pointer-events-none select-none"
        style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties}
        draggable={false}
        priority={priority}
        quality={90}
      />
    </div>
  );
}

interface ParallaxHeroProps {
  scrollProgress?: number;
  onIntroComplete?: () => void;
}

export function ParallaxHero({ scrollProgress = 0, onIntroComplete }: ParallaxHeroProps) {
  const { containerRef, transforms, reducedMotion } = useParallax(scrollProgress);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Intro animation orchestration
  const {
    layers: layerAnimations,
    particleOpacity,
    blackOverlayOpacity,
    logo,
    taglineOpacity,
    taglineTranslateY,
    subtitleOpacity,
    subtitleTranslateY,
    isComplete: introComplete,
    skipIntro,
    resetAnimation,
  } = useIntroAnimation({ reducedMotion, onComplete: onIntroComplete });

  // Only show video on desktop with hover capability and no reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    setShowVideo(!prefersReducedMotion && hasHover);
  }, []);

  // Dev keyboard shortcut to replay animation (Shift+R) or skip (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "R") {
        resetAnimation();
      } else if (e.key === "Escape" && !introComplete) {
        skipIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetAnimation, skipIntro, introComplete]);

  // Skip intro on click during intro
  const handleSkipClick = useCallback(() => {
    if (!introComplete) {
      skipIntro();
    }
  }, [introComplete, skipIntro]);

  // Helper to get combined transform for a layer
  const getLayerTransform = (layerId: string) => {
    const parallaxTransform = transforms[layerId] || "translate3d(0, 0, 0) scale(1)";
    const animation = layerAnimations[layerId];

    if (!animation || introComplete) {
      return parallaxTransform;
    }

    // During intro, combine intro animation with parallax
    return `translate3d(0, ${animation.translateY}px, 0) scale(${animation.scale}) ${parallaxTransform}`;
  };

  // Helper to get layer opacity during intro
  const getLayerOpacity = (layerId: string) => {
    if (introComplete) return 1;
    return layerAnimations[layerId]?.opacity ?? 0;
  };

  // Helper to get layer blur during intro (motion blur effect)
  const getLayerBlur = (layerId: string) => {
    if (introComplete) return 0;
    return layerAnimations[layerId]?.blur ?? 0;
  };

  // Calculate logo position interpolation
  // When positionProgress = 0: centered, large
  // When positionProgress = 1: final position (top of text block)
  const getLogoStyle = (): React.CSSProperties => {
    const { scale, opacity, positionProgress, phase } = logo;

    if (phase === "final" || introComplete) {
      // Final state - just regular opacity
      return { opacity: 1 };
    }

    // During intro phases
    return {
      opacity,
      transform: `scale(${scale})`,
      // Position interpolation handled by container positioning
    };
  };

  // Logo wrapper style - only the logo moves during transition, not the text
  const getLogoWrapperStyle = (): React.CSSProperties => {
    const { positionProgress, phase } = logo;

    if (phase === "final" || introComplete) {
      return {};
    }

    // During intro, logo starts centered in viewport
    // As it transitions, it moves up to its final position above the text
    // We achieve this by translating the logo down initially, then animating to 0
    const logoOffset = (1 - positionProgress) * 120; // Logo moves up as positionProgress increases

    return {
      transform: `translateY(${logoOffset}px)`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "#0a1a0a" }}
      onClick={handleSkipClick}
    >
      {/* Background Layer */}
      {layers
        .filter((layer) => layer.id === "background")
        .map((layer) => (
          <div
            key={layer.id}
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: layer.zIndex,
              transform: getLayerTransform(layer.id),
              opacity: getLayerOpacity(layer.id),
              willChange: layer.speed > 0 ? "transform" : undefined,
            }}
          >
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: CONTAINER_WIDTH,
                height: CONTAINER_HEIGHT,
                transform: "translate(-50%, -50%)",
              }}
            >
              {layer.images.map((img, imgIndex) => (
                <div
                  key={`${layer.id}-${imgIndex}`}
                  className="absolute"
                  style={{
                    left: img.x,
                    top: img.y,
                    width: img.width,
                    height: img.height,
                  }}
                >
                  <Image
                    src={img.src}
                    alt=""
                    width={img.width}
                    height={img.height}
                    className="object-cover select-none"
                    style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties}
                    draggable={false}
                    priority
                    quality={90}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Particle Video Overlay - Above background, below character layers */}
      {showVideo && !videoError && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            zIndex: 0.5,
            mixBlendMode: "screen",
            opacity: introComplete ? 0.2 : particleOpacity,
          }}
        >
          <source src="/videos/particles.mp4" type="video/mp4" />
        </video>
      )}

      {/* Character Parallax Layers (L5-L2) - Below text */}
      {layers
        .filter((layer) => layer.id !== "background" && layer.id !== "L1")
        .map((layer) => {
          const blur = getLayerBlur(layer.id);
          return (
          <div
            key={layer.id}
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: layer.zIndex,
              transform: getLayerTransform(layer.id),
              opacity: getLayerOpacity(layer.id),
              filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
              willChange: "transform, filter",
            }}
          >
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: CONTAINER_WIDTH,
                height: CONTAINER_HEIGHT,
                transform: "translate(-50%, -50%)",
              }}
            >
              {layer.images.map((img, imgIndex) => (
                <HoverableImage
                  key={`${layer.id}-${imgIndex}`}
                  img={img}
                  priority={layer.id === "L5" || layer.id === "L4"}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </div>
        );
        })}

      {/* Black Overlay - Covers everything during logo intro */}
      {blackOverlayOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 100,
            backgroundColor: "#0a1a0a",
            opacity: blackOverlayOpacity,
          }}
        />
      )}

      {/* Text Content - Always on top */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 101 }}
      >
        <div className="text-center px-4">
          {/* Logo - Moves independently during intro transition */}
          <div className="mb-4" style={getLogoWrapperStyle()}>
            <div style={getLogoStyle()}>
              <ShuffleText
                text="(c.ai)labs"
                progress={logo.shuffleProgress}
                cycleSpeed={80} // Slightly slower for dramatic effect
                className="font-mono text-[20px]"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>

          {/* Title - Fades in with subtle upward motion */}
          <h1
            className="font-semibold text-[72px] leading-[1.1] mb-6"
            style={{
              color: "#ffffff",
              fontFamily: "var(--font-sans)",
              opacity: taglineOpacity,
              transform: `translateY(${taglineTranslateY}px)`,
              visibility: taglineOpacity > 0 ? "visible" : "hidden",
              transition: "none", // Animation controlled by hook
            }}
          >
            early experiments.
            <br />
            strong opinions welcome.
          </h1>

          {/* Subtitle - Fades in with subtle upward motion */}
          <p
            className="font-medium text-[30px] leading-[1.4] max-w-3xl mx-auto"
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontFamily: "var(--font-sans)",
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleTranslateY}px)`,
              visibility: subtitleOpacity > 0 ? "visible" : "hidden",
              transition: "none",
            }}
          >
            A space dedicated to experimenting with new
            <br />
            creative formats before they reach everyone else.
          </p>
        </div>
      </div>

      {/* L1 Layer - Above text for overlap effect */}
      {layers
        .filter((layer) => layer.id === "L1")
        .map((layer) => {
          const blur = getLayerBlur(layer.id);
          return (
            <div
              key={layer.id}
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: 102,
                transform: getLayerTransform(layer.id),
                opacity: getLayerOpacity(layer.id),
                filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
                willChange: "transform, filter",
              }}
            >
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  width: CONTAINER_WIDTH,
                  height: CONTAINER_HEIGHT,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {layer.images.map((img, imgIndex) => (
                  <HoverableImage
                    key={`${layer.id}-${imgIndex}`}
                    img={img}
                    priority={false}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </div>
          );
        })}

      {/* Skip hint - shown during intro */}
      {!introComplete && blackOverlayOpacity < 0.5 && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            zIndex: 103,
            opacity: 0.4,
            transition: "opacity 0.3s",
          }}
        >
          <span className="text-xs text-white/50">
            Press ESC or click to skip
          </span>
        </div>
      )}
    </div>
  );
}

export default ParallaxHero;
