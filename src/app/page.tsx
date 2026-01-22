"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ExperimentCard } from "@/components/ExperimentCard";
import { GlitchText } from "@/components/GlitchText";
import { useHomeIntro } from "@/hooks/useHomeIntro";
import { SpawnLogo, SpawnLogoHandle } from "@/components/SpawnLogo";
import { useSpawnQueue } from "@/hooks/useSpawnQueue";
import { StoriesSection } from "@/components/StoriesSection";
import { getFeaturedStories } from "@/data/stories";
import { CommunitySection } from "@/components/CommunitySection";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

// Dynamic import for physics components to avoid SSR issues
const MascotOverlay = dynamic(
  () => import("@/components/MascotLauncher/MascotOverlay").then((mod) => mod.MascotOverlay),
  { ssr: false }
);

// Card data with hero positions (stacked deck) and horizontal scroll positions
// Scroll order: pink, green, yellow, purple, blue (left to right when scrolled)
// Hero: yellow in front center, others fanned out behind
// Hero x positions are relative to center of viewport (will be offset dynamically)
const experiments = [
  {
    title: "podcasts where characters lead the conversation",
    description: "Create podcasts led by characters from any topic and jump into the conversation as it unfolds.",
    href: "/experiments/podcasts",
    variant: "rose-light" as const,
    buttonText: "Try Podcasts",
    imageSrc: "/experiments/podcasts.png",
    heroOffset: { rotate: -5, x: -580, y: 20, zIndex: 3 }, // Far left behind
  },
  {
    title: "turn stories into comics you can continue",
    description: "Create illustrated comic scenes using characters, then remix the comic into a live chat and keep the story going.",
    href: "/experiments/comics",
    variant: "lime-light" as const,
    buttonText: "Try Comics",
    imageSrc: "/experiments/comics.png",
    heroOffset: { rotate: -5, x: -380, y: -60, zIndex: 4 }, // Left side behind
  },
  {
    title: "watch characters act out your ideas",
    description: "Generate short form videos with characters, scenes, and motion using a prompt driven creation studio.",
    href: "/experiments/streams",
    variant: "butter-light" as const,
    buttonText: "Try Streams",
    imageSrc: "/experiments/streams.png",
    heroOffset: { rotate: 0, x: 0, y: -150, zIndex: 5 }, // Front center card
  },
  {
    title: "see characters and yourself in new worlds",
    description: "Generate styled images by choosing characters, personas, moods, and scenes in a fast, visual flow.",
    href: "/experiments/image-studio",
    variant: "lavender-light" as const,
    buttonText: "Try Image Studio",
    imageSrc: "/experiments/image-studio.png",
    heroOffset: { rotate: 5, x: 380, y: -60, zIndex: 4 }, // Right side behind
  },
  {
    title: "step inside books and play the story",
    description: "Play through public domain books as a character, follow the story, or rewrite the world entirely.",
    href: "/experiments/books",
    variant: "sky-light" as const,
    buttonText: "Try Books",
    imageSrc: "/experiments/books.png",
    heroOffset: { rotate: 5, x: 580, y: 20, zIndex: 3 }, // Far right behind
  },
];

const CARD_WIDTH = 420;
const CARD_HEIGHT = 640;
const CARD_GAP = 20;

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoScrollY, setLogoScrollY] = useState(0); // Track scroll for logo position interpolation
  const [bouncingCards, setBouncingCards] = useState<Set<number>>(new Set());
  const [windowWidth, setWindowWidth] = useState(1920); // Default for SSR
  const [windowHeight, setWindowHeight] = useState(900); // Default for SSR
  const [windowMeasured, setWindowMeasured] = useState(false); // Track if we've measured real dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [logoPosition, setLogoPosition] = useState<{ x: number; y: number } | null>(null);
  const spawnMascotRef = useRef<((x: number, y: number) => void) | null>(null);
  const flyAwayRef = useRef<(() => void) | null>(null);
  const knockOverRef = useRef<((cardIndex: number, cardRect: DOMRect) => void) | null>(null);
  const bounceTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const hoveredCardRef = useRef<number | null>(null);
  const hoverGraceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);
  const hasTriggeredFlyAway = useRef(false);
  const spawnLogoRef = useRef<SpawnLogoHandle>(null);
  const pendingClickRef = useRef<{ x: number; y: number } | null>(null);
  const respawnMascotsRef = useRef<(() => void) | null>(null);
  const portalActiveRef = useRef(false);
  const hasLeftHero = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Intro animation hook
  const intro = useHomeIntro({
    reducedMotion,
    cardCount: experiments.length,
  });

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

  // Handle respawn ready from MascotOverlay
  const handleRespawnReady = useCallback((respawnFn: () => void) => {
    respawnMascotsRef.current = respawnFn;
  }, []);

  // Handle portal state change from MascotOverlay
  const handlePortalStateChange = useCallback((isActive: boolean) => {
    portalActiveRef.current = isActive;
  }, []);

  // Handle spawn ready callback from SpawnLogo animation
  const handleSpawnAnimationReady = useCallback(() => {
    // The logo animation burst happened - delay before spawning mascot
    if (pendingClickRef.current && spawnMascotRef.current) {
      // Store click position and clear pending ref
      const clickPos = { ...pendingClickRef.current };
      pendingClickRef.current = null;

      // Delay mascot appearance to let logo animation play longer
      setTimeout(() => {
        if (spawnMascotRef.current) {
          spawnMascotRef.current(clickPos.x, clickPos.y);
        }
      }, 250);
    }
  }, []);

  // Spawn queue for handling rapid clicks
  const { queueSpawn } = useSpawnQueue({
    onSpawnReady: (clickX, clickY) => {
      // Store click position and trigger logo animation
      pendingClickRef.current = { x: clickX, y: clickY };
      spawnLogoRef.current?.triggerSpawn();
    },
    cooldownMs: 450,
    maxQueueSize: 5,
  });

  // Handle card hover to knock over mascots
  const handleCardHover = useCallback((cardIndex: number) => {
    // Track which card is hovered to prevent bounce animation
    hoveredCardRef.current = cardIndex;

    // Clear any existing grace timeout
    if (hoverGraceTimeoutRef.current) {
      clearTimeout(hoverGraceTimeoutRef.current);
    }

    const cardEl = cardRefs.current[cardIndex];
    if (cardEl && knockOverRef.current) {
      const rect = cardEl.getBoundingClientRect();
      knockOverRef.current(cardIndex, rect);
    }

    // Clear hovered card after grace period (600ms allows mascot to settle)
    hoverGraceTimeoutRef.current = setTimeout(() => {
      hoveredCardRef.current = null;
    }, 600);
  }, []);

  // Handle card hit from mascot collision
  const handleCardHit = useCallback((cardIndex: number) => {
    // Skip bounce animation if this card is currently hovered (prevents bobbing during hover)
    if (hoveredCardRef.current === cardIndex) {
      return;
    }

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
    // Skip intro on click if still playing
    if (!intro.isComplete) {
      intro.skipIntro();
      return;
    }

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

    // Queue spawn with animated logo transformation
    queueSpawn(e.clientX, e.clientY);
  }, [isScrolled, intro, queueSpawn]);

  // Skip intro on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !intro.isComplete) {
        intro.skipIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [intro.isComplete, intro.skipIntro]);

  useEffect(() => {
    let rafId: number | null = null;
    let ticking = false;

    const updateScroll = () => {
      const scrollY = window.scrollY;
      lastScrollY.current = scrollY;

      // Skip intro on any scroll
      if (scrollY > 10 && !intro.isComplete) {
        intro.skipIntro();
      }

      // Smooth progress calculation - animation happens over scroll distance
      const triggerPoint = 0;
      const animationDistance = 400;

      const progress = Math.min(
        Math.max((scrollY - triggerPoint) / animationDistance, 0),
        1
      );
      setScrollProgress(progress);
      setLogoScrollY(Math.min(scrollY, 50)); // Cap at 50 for logo transition

      const nowScrolled = scrollY > 50;
      setIsScrolled(nowScrolled);

      // Trigger fly away when entering scrolled state (regardless of direction)
      // This ensures mascots always fly away when scrolled down
      if (nowScrolled && !hasTriggeredFlyAway.current) {
        hasTriggeredFlyAway.current = true;
        hasLeftHero.current = true;
        if (flyAwayRef.current) {
          flyAwayRef.current();
        }
      }

      // Re-spawn mascots when scrolling back to hero position (with delay)
      if (scrollY < 10 && hasLeftHero.current && hasTriggeredFlyAway.current) {
        hasLeftHero.current = false;
        hasTriggeredFlyAway.current = false;
        // Add longer delay before respawning mascots (2 seconds feels more natural)
        setTimeout(() => {
          if (respawnMascotsRef.current && window.scrollY < 10) {
            respawnMascotsRef.current();
          }
        }, 2000);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [intro.isComplete, intro.skipIntro]);

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
  }, [isScrolled, intro.isComplete]); // Also update when intro completes (logoRef becomes available)

  // Track window dimensions for card centering and viewport-relative positioning
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
      setWindowMeasured(true); // Mark that we've measured real dimensions
    };

    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const easeOutExpo = (t: number) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const easedProgress = easeOutExpo(scrollProgress);
  // Hero text fades out faster - reaches full fade by 50% scroll progress
  const textFadeProgress = Math.min(scrollProgress * 2.5, 1);
  const textEasedProgress = easeOutCubic(textFadeProgress);

  // Section title fades in later - starts at 40% scroll, fully visible at 100%
  // Also hide immediately when back in hero state (not scrolled)
  const sectionTitleProgress = Math.max(0, (scrollProgress - 0.4) / 0.6);
  const sectionTitleEasedProgress = isScrolled ? easeOutCubic(sectionTitleProgress) : 0;

  // Viewport-relative positioning - scale positions based on screen height
  // Reference height is 900px, positions scale proportionally
  const heightScale = windowHeight / 900;

  // Logo position interpolation - smoothly move from hero position to nav position on scroll
  const heroLogoTop = 165 * heightScale; // Starting position in hero
  const navLogoTop = 20; // Final position in nav
  const logoScrollProgress = logoScrollY / 50; // 0→1 over first 50px of scroll
  const currentLogoTop = heroLogoTop + (navLogoTop - heroLogoTop) * logoScrollProgress;

  // Mobile breakpoint detection
  const isMobile = windowWidth < 768;

  // Calculate offset to center the cards in hero state
  // In hero state, we want the middle card (index 2, butter) to be centered
  // The middle card's left edge in row layout is at: 2 * (CARD_WIDTH + CARD_GAP) = 880px from container left
  // To center it, we need to offset by: (windowWidth / 2) - (CARD_WIDTH / 2) - 880 - 44 (padding)
  const middleCardRowX = 2 * (CARD_WIDTH + CARD_GAP); // Position of middle card in row
  const heroCenterOffset = (windowWidth / 2) - (CARD_WIDTH / 2) - middleCardRowX - 44;

  // Calculate card position based on scroll progress
  const getCardTransform = (
    heroOffset: { rotate: number; x: number; y: number; zIndex: number },
    index: number
  ) => {
    // Target horizontal position in row layout (relative to container with padding)
    const targetX = index * (CARD_WIDTH + CARD_GAP);
    const targetY = 0;

    // Hero position: offset from center (heroOffset.x is relative to center)
    // We add heroCenterOffset to convert the center-relative heroOffset to container-relative position
    const heroX = heroCenterOffset + middleCardRowX + heroOffset.x;
    // Scale Y position based on viewport height
    const heroY = heroOffset.y * heightScale;

    // Interpolate from hero position to horizontal row position
    const currentX = heroX + (targetX - heroX) * easedProgress;
    const currentY = heroY + (targetY - heroY) * easedProgress;
    const currentRotate = heroOffset.rotate * (1 - easedProgress);

    return {
      x: currentX,
      y: currentY,
      rotate: currentRotate,
      zIndex: isScrolled ? 1 : heroOffset.zIndex,
    };
  };

  return (
    <div
      className="min-h-[250vh] overflow-x-hidden"
      style={{ background: "var(--color-background)" }}
      onClick={handlePageClick}
    >
      {/* Nav Bar */}
      <NavBar
        navOpacity={intro.navOpacity}
        onMobileMenuChange={setMobileMenuOpen}
      />

      {/* Mascot Physics Overlay - hidden when mobile menu is open */}
      {!(mobileMenuOpen && isMobile) && (
        <MascotOverlay
          logoPosition={logoPosition}
          titleRef={titleRef}
          cardRefs={cardRefs}
          onSpawnerReady={handleSpawnerReady}
          onCardHit={handleCardHit}
          isHeroState={!isScrolled}
          onFlyAwayReady={handleFlyAwayReady}
          onKnockOverReady={handleKnockOverReady}
          onRespawnReady={handleRespawnReady}
          onPortalStateChange={handlePortalStateChange}
          onTriggerLogoAnimation={() => spawnLogoRef.current?.triggerSpawn()}
          introComplete={intro.isComplete}
        />
      )}

      {/* Intro Animation Logo - centered during animation, then moves to top */}
      {/* Hidden when mobile menu is open, only show after window dimensions measured to prevent jump */}
      {!intro.isComplete && !(mobileMenuOpen && isMobile) && windowMeasured && (
        <div
          className="fixed left-1/2 z-50"
          style={{
            // Interpolate from center (50vh) to top hero position
            top: `${(windowHeight / 2 - 20) * (1 - intro.logoPositionProgress) + heroLogoTop * intro.logoPositionProgress}px`,
            transform: "translateX(-50%)",
            opacity: intro.logoOpacity,
            pointerEvents: "none",
          }}
        >
          <div
            className="flex items-center gap-1"
            style={{
              // Scale down on mobile to prevent clipping (0.7x of normal scale)
              transform: `scale(${intro.logoScale * (isMobile ? 0.7 : 1)})`,
              transformOrigin: "center center",
            }}
          >
            <GlitchText
              text={intro.displayText}
              isGlitching={intro.isGlitching}
              glitchOffset={intro.glitchOffset}
              className="font-mono text-[26px]"
              style={{ color: "var(--color-primary)" }}
            />
            {intro.showLabs && (
              <GlitchText
                text={intro.labsText}
                isGlitching={intro.isLabsGlitching}
                glitchOffset={intro.isLabsGlitching ? (Math.random() - 0.5) * 6 : 0}
                className="font-mono text-[26px]"
                style={{ color: "var(--color-primary)" }}
              />
            )}
          </div>
        </div>
      )}

      {/* Animated Logo for after intro is complete - transforms to kaomoji when spawning */}
      {/* Hidden when mobile menu is open */}
      {intro.isComplete && !(mobileMenuOpen && isMobile) && (
        <div
          ref={logoRef}
          className="fixed left-1/2 z-50"
          style={{
            top: `${currentLogoTop}px`, // Smoothly interpolates from hero to nav position
            transform: "translateX(-50%)",
            pointerEvents: isScrolled ? "none" : "auto",
          }}
        >
          <SpawnLogo
            ref={spawnLogoRef}
            onSpawnReady={handleSpawnAnimationReady}
          />
        </div>
      )}

      {/* Hero Section - full screen on mobile with card peek, normal height on desktop */}
      <div
        className="relative"
        style={{
          height: isMobile ? "calc(100vh - 280px)" : `${500 * heightScale}px`,
        }}
      >
        {/* Hero Text - centered vertically on mobile */}
        <div
          className="absolute left-1/2 w-full max-w-lg md:max-w-3xl text-center transition-all duration-300 px-4 md:px-8"
          style={{
            top: isMobile ? "60%" : `${220 * heightScale}px`,
            opacity: intro.isComplete ? (isMobile ? 1 : (1 - textEasedProgress)) : 1,
            transform: isMobile
              ? "translateX(-50%) translateY(-50%)"
              : `translateX(-50%) translateY(${intro.isComplete ? -textEasedProgress * 100 : 0}px)`,
          }}
        >
          <h1
            ref={titleRef}
            className="font-semibold text-[48px] md:text-[72px] leading-[1] tracking-[-0.96px] md:tracking-[-1.44px] mb-4 md:mb-5"
            style={{
              color: "var(--color-primary)",
              opacity: intro.taglineOpacity,
              transform: `translateY(${intro.taglineTranslateY}px)`,
            }}
          >
            be the first to play with what&apos;s next
          </h1>
          <p
            className="font-normal text-[24px] md:text-[30px] leading-normal md:max-w-[700px] mx-auto"
            style={{
              color: "var(--color-primary)",
              opacity: intro.subtitleOpacity,
              transform: `translateY(${intro.subtitleTranslateY}px)`,
            }}
          >
            A space dedicated to experimenting with new creative formats before they reach everyone else.
          </p>
        </div>
      </div>

      {/* Cards Section - normal document flow */}
      <div ref={containerRef} style={{ overflow: "visible" }}>
          {/* Section Title - desktop only, appears when scrolled (delayed fade-in) */}
          <div
            className="hidden md:block px-8 text-center relative"
            style={{
              opacity: sectionTitleEasedProgress,
              transform: `translateY(${(1 - sectionTitleEasedProgress) * 30}px)`,
              pointerEvents: sectionTitleEasedProgress < 0.5 ? "none" : "auto",
              visibility: sectionTitleEasedProgress === 0 ? "hidden" : "visible",
              transition: isScrolled ? "opacity 0.3s ease-out, transform 0.3s ease-out" : "none",
              zIndex: 10,
            }}
          >
            <h2
              className="font-semibold text-[48px] leading-[1] tracking-[-0.96px] mb-3"
              style={{ color: "var(--color-on-background)" }}
            >
              fresh experiments
            </h2>
            <p
              className="font-normal text-[20px] leading-normal"
              style={{ color: "var(--color-on-background)" }}
            >
              Prototypes we are actively building, testing, and learning from.
            </p>
          </div>

          {/* Mobile: Vertical stack of cards - animate in after intro completes */}
          {/* Fixed height container prevents content shift during card fade-in */}
          {/* Height = 5 cards × 300px + 4 gaps × 8px = 1532px */}
          {/* Use conditional render (not CSS hide) so refs point to correct elements */}
          {isMobile && (
          <div
            className="flex flex-col gap-2 px-4"
            style={{ minHeight: `${experiments.length * 300 + (experiments.length - 1) * 8}px` }}
          >
            {experiments.map((experiment, index) => {
              const cardIntroProgress = intro.cardProgress[index] ?? 0;
              const isBouncing = bouncingCards.has(index);

              return (
                <div
                  key={experiment.title}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  style={{
                    opacity: cardIntroProgress,
                    // Use translate3d for GPU acceleration
                    transform: `translate3d(0, ${(1 - cardIntroProgress) * 50}px, 0)`,
                    transition: intro.isComplete ? "opacity 0.3s ease-out, transform 0.3s ease-out" : "none",
                    // GPU hints for smoother animation
                    willChange: intro.isComplete ? "auto" : "transform, opacity",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div
                    style={{
                      transform: isBouncing ? "scale(0.97)" : "scale(1)",
                      transition: "transform 0.1s ease-out",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <ExperimentCard
                      title={experiment.title}
                      description={experiment.description}
                      href={experiment.href}
                      variant={experiment.variant}
                      buttonText={experiment.buttonText}
                      imageSrc={experiment.imageSrc}
                      isMobile={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Desktop: Cards - stacked in hero, horizontal scrollable row when scrolled */}
          {/* Use conditional render (not CSS hide) so refs point to correct elements */}
          {!isMobile && (
          <div
            className={`${isScrolled ? "overflow-x-auto overflow-y-hidden scrollbar-hide select-none" : "overflow-visible"}`}
            style={{
              cursor: isScrolled ? "grab" : "default",
            }}
            onMouseDown={(e) => {
              if (!isScrolled) return;
              e.preventDefault();
              const el = e.currentTarget;
              el.style.cursor = "grabbing";

              const startX = e.clientX;
              const scrollLeft = el.scrollLeft;
              let isDragging = false;

              const handleMouseMove = (e: MouseEvent) => {
                e.preventDefault();
                isDragging = true;
                const x = e.clientX;
                const walk = (startX - x) * 1.2;
                el.scrollLeft = scrollLeft + walk;
              };

              const handleMouseUp = () => {
                el.style.cursor = "grab";
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);

                // Prevent click if we were dragging
                if (isDragging) {
                  const preventClick = (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                  };
                  el.addEventListener("click", preventClick, { capture: true, once: true });
                }
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          >
            <div
              className="relative"
              style={{
                width: `${44 + experiments.length * CARD_WIDTH + (experiments.length - 1) * CARD_GAP + 44}px`,
                height: `${CARD_HEIGHT + 180}px`, // Extra height for hover scale and hero transforms
                paddingTop: "120px", // More padding to prevent clipping during transitions
                paddingBottom: "40px",
              }}
            >
              {experiments.map((experiment, index) => {
                const cardTransform = getCardTransform(experiment.heroOffset, index);
                const isBouncing = bouncingCards.has(index);
                const cardIntroProgress = intro.cardProgress[index] ?? 1;

                // Card entrance animation: start from bottom center, rise up and fan out
                // When cardIntroProgress is 0: cards at bottom, stacked at center
                // When cardIntroProgress is 1: cards at their hero positions
                const introStartY = 800; // Start below viewport
                const introStartRotate = index === 2 ? 0 : (index < 2 ? 5 : -5); // Start tilted inward

                // Interpolate from intro start to hero position based on cardIntroProgress
                const effectiveY = intro.isComplete
                  ? cardTransform.y
                  : introStartY + (cardTransform.y - introStartY) * cardIntroProgress;
                const effectiveRotate = intro.isComplete
                  ? cardTransform.rotate
                  : introStartRotate + (cardTransform.rotate - introStartRotate) * cardIntroProgress;

                return (
                  <div
                    key={experiment.title}
                    ref={(el) => { cardRefs.current[index] = el; }}
                    className="absolute"
                    style={{
                      left: "44px", // Account for container padding
                      // Use translate3d for GPU acceleration
                      transform: `translate3d(${cardTransform.x}px, ${effectiveY}px, 0) rotate(${effectiveRotate}deg)`,
                      transition: intro.isComplete ? "transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)" : "none",
                      zIndex: cardTransform.zIndex,
                      opacity: cardIntroProgress > 0 ? 1 : 0,
                      // GPU hints for smoother animation
                      willChange: intro.isComplete ? "auto" : "transform",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div
                      style={{
                        transform: isBouncing ? "scale(0.97)" : "scale(1)",
                        transition: "transform 0.1s ease-out",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <ExperimentCard
                        title={experiment.title}
                        description={experiment.description}
                        href={experiment.href}
                        variant={experiment.variant}
                        buttonText={experiment.buttonText}
                        imageSrc={experiment.imageSrc}
                        onHoverStart={() => handleCardHover(index)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* All Experiments Button - appears when scrolled (after intro on mobile) */}
          <div
            className="flex justify-center mt-10"
            style={{
              opacity: isMobile ? (intro.isComplete ? 1 : 0) : easedProgress,
              transform: isMobile ? `translateY(${intro.isComplete ? 0 : 20}px)` : `translateY(${(1 - easedProgress) * 20}px)`,
              pointerEvents: isMobile ? (intro.isComplete ? "auto" : "none") : (easedProgress < 0.5 ? "none" : "auto"),
              transition: isMobile ? "opacity 0.3s ease-out, transform 0.3s ease-out" : undefined,
            }}
          >
            <a
              href="/experiments"
              className="group inline-flex items-center gap-2 h-11 px-5 rounded-full border transition-all duration-200 hover:bg-[var(--color-on-background)]"
              style={{
                borderColor: "var(--color-on-background)",
                color: "var(--color-on-background)",
              }}
            >
              <span className="font-medium text-base whitespace-nowrap group-hover:text-[var(--color-background)]">
                All Experiments
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:stroke-[var(--color-background)]"
                />
              </svg>
            </a>
          </div>
        </div>

      {/* Stories Section */}
      <StoriesSection stories={getFeaturedStories()} />

      {/* Community Section */}
      <CommunitySection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
