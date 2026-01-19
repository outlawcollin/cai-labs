"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ExperimentCard } from "@/components/ExperimentCard";
import { LabsLogo } from "@/components/Logo";

// Dynamic import for physics components to avoid SSR issues
const MascotOverlay = dynamic(
  () => import("@/components/MascotLauncher/MascotOverlay").then((mod) => mod.MascotOverlay),
  { ssr: false }
);

// Card data with hero positions (stacked) and grid positions
const experiments = [
  {
    title: "Streams",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/streams",
    variant: "secondary" as const,
    tag: "featured",
    hero: { rotate: 0, x: 0, y: 0, zIndex: 5 },
    grid: { row: 0, col: 0 },
  },
  {
    title: "Comics",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/comics",
    variant: "tertiary" as const,
    tag: "featured",
    hero: { rotate: -5, x: -380, y: 145, zIndex: 4 },
    grid: { row: 0, col: 1 },
  },
  {
    title: "Image Studio",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/image-studio",
    variant: "warning" as const,
    tag: "featured",
    hero: { rotate: 5, x: 380, y: 145, zIndex: 4 },
    grid: { row: 0, col: 2 },
  },
  {
    title: "Fandom News",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/fandom-news",
    variant: "error" as const,
    tag: "featured",
    hero: { rotate: 5, x: -620, y: 233, zIndex: 3 },
    grid: { row: 1, col: 0 },
  },
  {
    title: "Books",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/books",
    variant: "primary" as const,
    tag: "featured",
    hero: { rotate: -5, x: 620, y: 233, zIndex: 3 },
    grid: { row: 1, col: 1 },
  },
];

const CARD_WIDTH = 420;
const CARD_HEIGHT = 580;
const GRID_GAP = 20;

// Scroll snap thresholds
const SNAP_THRESHOLD = 150; // Pixels of scroll before snapping
const SNAPPED_SCROLL_POSITION = 400; // Where to snap to when scrolled

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bouncingCards, setBouncingCards] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [logoPosition, setLogoPosition] = useState<{ x: number; y: number } | null>(null);
  const spawnMascotRef = useRef<((x: number, y: number) => void) | null>(null);
  const flyAwayRef = useRef<(() => void) | null>(null);
  const knockOverRef = useRef<((cardIndex: number, cardRect: DOMRect) => void) | null>(null);
  const bounceTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const lastScrollY = useRef(0);
  const isSnapping = useRef(false);
  const hasTriggeredFlyAway = useRef(false);

  // Handle spawner ready from MascotOverlay
  const handleSpawnerReady = useCallback((spawnFn: (x: number, y: number) => void) => {
    spawnMascotRef.current = spawnFn;
  }, []);

  // Handle fly away ready from MascotOverlay
  const handleFlyAwayReady = useCallback((flyAwayFn: () => void) => {
    flyAwayRef.current = flyAwayFn;
  }, []);

  // Handle knock over ready from MascotOverlay
  const handleKnockOverReady = useCallback((knockOverFn: (cardIndex: number, cardRect: DOMRect) => void) => {
    knockOverRef.current = knockOverFn;
  }, []);

  // Handle card hover to knock over mascots
  const handleCardHover = useCallback((cardIndex: number) => {
    const cardEl = cardRefs.current[cardIndex];
    if (cardEl && knockOverRef.current) {
      const rect = cardEl.getBoundingClientRect();
      knockOverRef.current(cardIndex, rect);
    }
  }, []);

  // Handle card hit from mascot collision
  const handleCardHit = useCallback((cardIndex: number) => {
    // Clear existing timeout for this card
    const existingTimeout = bounceTimeoutsRef.current.get(cardIndex);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Add card to bouncing set
    setBouncingCards(prev => new Set(prev).add(cardIndex));

    // Remove after animation completes
    const timeout = setTimeout(() => {
      setBouncingCards(prev => {
        const next = new Set(prev);
        next.delete(cardIndex);
        return next;
      });
      bounceTimeoutsRef.current.delete(cardIndex);
    }, 150);

    bounceTimeoutsRef.current.set(cardIndex, timeout);
  }, []);

  // Handle click on page background to spawn mascots (only in hero state)
  const handlePageClick = useCallback((e: React.MouseEvent) => {
    // Only spawn when in hero (pre-scrolled) state
    if (isScrolled) return;

    // Don't spawn if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.closest("a") ||
      target.closest("button")
    ) {
      return;
    }

    // Spawn mascot at click position
    if (spawnMascotRef.current) {
      spawnMascotRef.current(e.clientX, e.clientY);
    }
  }, [isScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      // Skip if we're in the middle of a programmatic snap
      if (isSnapping.current) return;

      const scrollY = window.scrollY;
      const previousScrollY = lastScrollY.current;
      const scrollingDown = scrollY > previousScrollY;
      lastScrollY.current = scrollY;

      const triggerPoint = 50;
      const animationDistance = 300;

      const progress = Math.min(
        Math.max((scrollY - triggerPoint) / animationDistance, 0),
        1
      );
      setScrollProgress(progress);

      const wasScrolled = isScrolled;
      const nowScrolled = scrollY > 30;
      setIsScrolled(nowScrolled);

      // Trigger fly away when transitioning from hero to scrolled state
      if (!wasScrolled && nowScrolled && scrollingDown && !hasTriggeredFlyAway.current) {
        hasTriggeredFlyAway.current = true;
        if (flyAwayRef.current) {
          flyAwayRef.current();
        }
      }

      // Reset fly away trigger when back at top
      if (scrollY < 10) {
        hasTriggeredFlyAway.current = false;
      }

      // Scroll snapping logic
      if (scrollY > 0 && scrollY < SNAPPED_SCROLL_POSITION) {
        // Determine snap direction based on threshold
        const shouldSnapDown = scrollY > SNAP_THRESHOLD;

        isSnapping.current = true;
        window.scrollTo({
          top: shouldSnapDown ? SNAPPED_SCROLL_POSITION : 0,
          behavior: "smooth",
        });

        // Reset snapping flag after animation
        setTimeout(() => {
          isSnapping.current = false;
          lastScrollY.current = window.scrollY;
        }, 500);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  // Get logo position for mascot spawning
  useEffect(() => {
    const updateLogoPosition = () => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        setLogoPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updateLogoPosition();
    window.addEventListener("resize", updateLogoPosition);
    return () => window.removeEventListener("resize", updateLogoPosition);
  }, [isScrolled]);

  const easeOutExpo = (t: number) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const easedProgress = easeOutExpo(scrollProgress);
  const textEasedProgress = easeOutCubic(scrollProgress);

  const getGridPosition = (row: number, col: number) => {
    const cardsInRow = row === 0 ? 3 : 2;
    const rowWidth = cardsInRow * CARD_WIDTH + (cardsInRow - 1) * GRID_GAP;
    const startX = -rowWidth / 2 + CARD_WIDTH / 2;
    const x = startX + col * (CARD_WIDTH + GRID_GAP);
    const y = row * (CARD_HEIGHT + GRID_GAP);
    return { x, y };
  };

  const getCardStyle = (
    hero: { rotate: number; x: number; y: number; zIndex: number },
    grid: { row: number; col: number }
  ) => {
    const gridPos = getGridPosition(grid.row, grid.col);

    const currentX = hero.x + (gridPos.x - hero.x) * easedProgress;
    const currentY = hero.y + (gridPos.y - hero.y) * easedProgress;
    const currentRotate = hero.rotate * (1 - easedProgress);

    return {
      transform: `translate(-50%, 0) translateX(${currentX}px) translateY(${currentY}px) rotate(${currentRotate}deg)`,
      zIndex: hero.zIndex,
    };
  };

  return (
    <div
      className="min-h-[250vh]"
      style={{ background: "var(--color-background)" }}
      onClick={handlePageClick}
    >
      {/* Mascot Physics Overlay */}
      <MascotOverlay
        logoPosition={logoPosition}
        titleRef={titleRef}
        cardRefs={cardRefs}
        onSpawnerReady={handleSpawnerReady}
        onCardHit={handleCardHit}
        isHeroState={!isScrolled}
        onFlyAwayReady={handleFlyAwayReady}
        onKnockOverReady={handleKnockOverReady}
      />

      {/* Sticky Header */}
      <header
        className="fixed left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out"
        style={{
          top: isScrolled ? "0px" : "180px",
          paddingTop: isScrolled ? "32px" : "0px",
          paddingBottom: isScrolled ? "64px" : "0px",
          background: isScrolled
            ? "linear-gradient(to bottom, var(--color-background) 0%, var(--color-background) 40%, transparent 100%)"
            : "transparent",
        }}
      >
        <div ref={logoRef}>
          <LabsLogo />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Hero Text */}
        <div
          className="absolute left-1/2 w-full text-center transition-all duration-300"
          style={{
            top: "224px",
            opacity: 1 - textEasedProgress,
            transform: `translateX(-50%) translateY(${-textEasedProgress * 100}px)`,
          }}
        >
          <h1
            ref={titleRef}
            className="font-black text-[72px] leading-tight mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            Be the first to play
          </h1>
          <p className="text-lg" style={{ color: "var(--color-primary)" }}>
            Early access to what we&apos;re building next.
          </p>
        </div>

        {/* Cards Container */}
        <div
          ref={containerRef}
          className="absolute left-1/2 w-full"
          style={{
            top: `calc(100vh - 450px + ${-easedProgress * 100}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="relative flex justify-center">
            {experiments.map((experiment, index) => {
              const style = getCardStyle(experiment.hero, experiment.grid);
              const staggerDelay = index === 0 ? 0 : index * 0.05;
              const isBouncing = bouncingCards.has(index);
              return (
                <div
                  key={experiment.title}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="absolute"
                  style={{
                    left: "50%",
                    ...style,
                    transition: `transform 0.65s cubic-bezier(0.34, 1.02, 0.4, 1) ${staggerDelay}s`,
                  }}
                >
                  <div
                    style={{
                      transform: isBouncing ? "scale(0.97)" : "scale(1)",
                      transition: "transform 0.1s ease-out",
                    }}
                  >
                    <ExperimentCard
                      title={experiment.title}
                      description={experiment.description}
                      href={experiment.href}
                      variant={experiment.variant}
                      tag={experiment.tag}
                      onHoverStart={() => handleCardHover(index)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacer for scrolling */}
      <div style={{ height: "100vh" }} />
    </div>
  );
}
