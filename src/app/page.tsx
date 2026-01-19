"use client";

import { useEffect, useState, useRef } from "react";
import { ExperimentCard } from "@/components/ExperimentCard";
import { LabsLogo } from "@/components/Logo";

// Card data with hero positions (stacked) and grid positions
const experiments = [
  {
    title: "Streams",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/streams",
    variant: "secondary" as const,
    tag: "featured",
    // Hero: Center card, no rotation, on top
    hero: { rotate: 0, x: 0, y: 0, zIndex: 5 },
    // Grid: First row, first card
    grid: { row: 0, col: 0 },
  },
  {
    title: "Comics",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/comics",
    variant: "tertiary" as const,
    tag: "featured",
    // Hero: Left of center, tilted
    hero: { rotate: -5, x: -380, y: 145, zIndex: 4 },
    // Grid: First row, second card
    grid: { row: 0, col: 1 },
  },
  {
    title: "Image Studio",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/image-studio",
    variant: "warning" as const,
    tag: "featured",
    // Hero: Right of center, tilted
    hero: { rotate: 5, x: 380, y: 145, zIndex: 4 },
    // Grid: First row, third card
    grid: { row: 0, col: 2 },
  },
  {
    title: "Fandom News",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/fandom-news",
    variant: "error" as const,
    tag: "featured",
    // Hero: Far left, tilted
    hero: { rotate: 5, x: -620, y: 233, zIndex: 3 },
    // Grid: Second row, first card
    grid: { row: 1, col: 0 },
  },
  {
    title: "Books",
    description: "Description sentence of what the experiment is all about",
    href: "/experiments/books",
    variant: "primary" as const,
    tag: "featured",
    // Hero: Far right, tilted
    hero: { rotate: -5, x: 620, y: 233, zIndex: 3 },
    // Grid: Second row, second card
    grid: { row: 1, col: 1 },
  },
];

// Card dimensions and grid settings
const CARD_WIDTH = 420;
const CARD_HEIGHT = 580;
const GRID_GAP = 20;

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const triggerPoint = 50;
      const animationDistance = 300;

      const progress = Math.min(
        Math.max((scrollY - triggerPoint) / animationDistance, 0),
        1
      );
      setScrollProgress(progress);
      setIsScrolled(scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // easeOutExpo - fast initial movement, very smooth slow-down
  const easeOutExpo = (t: number) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  // Smoother easing for text
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const easedProgress = easeOutExpo(scrollProgress);
  const textEasedProgress = easeOutCubic(scrollProgress);

  // Calculate grid positions for each card
  const getGridPosition = (row: number, col: number) => {
    // Row 0: 3 cards, Row 1: 2 cards centered
    const cardsInRow = row === 0 ? 3 : 2;
    const rowWidth = cardsInRow * CARD_WIDTH + (cardsInRow - 1) * GRID_GAP;
    const startX = -rowWidth / 2 + CARD_WIDTH / 2;
    const x = startX + col * (CARD_WIDTH + GRID_GAP);
    const y = row * (CARD_HEIGHT + GRID_GAP);
    return { x, y };
  };

  // Interpolate between hero and grid positions
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
    >
      {/* Sticky Header - animates from center position to top */}
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
        <LabsLogo />
      </header>

      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Hero Text - centered with mascots */}
        <div
          className="absolute left-1/2 w-full text-center transition-all duration-300"
          style={{
            top: "224px",
            opacity: 1 - textEasedProgress,
            transform: `translateX(-50%) translateY(${-textEasedProgress * 100}px)`,
          }}
        >
          <h1
            className="font-black text-[72px] leading-tight mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            Be the first to play
          </h1>
          <p className="text-lg" style={{ color: "var(--color-primary)" }}>
            Early access to what we&apos;re building next.
          </p>
        </div>

        {/* Cards Container - positioned to cut off at bottom initially */}
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
              // Stagger: center card first, then outward
              const staggerDelay = index === 0 ? 0 : index * 0.05;
              return (
                <div
                  key={experiment.title}
                  className="absolute"
                  style={{
                    left: "50%",
                    ...style,
                    // Subtle bounce: cubic-bezier with slight overshoot
                    transition: `transform 0.65s cubic-bezier(0.34, 1.02, 0.4, 1) ${staggerDelay}s`,
                  }}
                >
                  <ExperimentCard
                    title={experiment.title}
                    description={experiment.description}
                    href={experiment.href}
                    variant={experiment.variant}
                    tag={experiment.tag}
                  />
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
