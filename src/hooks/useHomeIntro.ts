"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Timeline constants (in ms) - Refined timing
const TIMELINE = {
  // Phase 1: Emoticon cycle with glitch transitions (shorter kaomoji display)
  firstKaomojiStart: 0,
  firstGlitchStart: 500,      // Show first kaomoji for 500ms
  secondKaomojiStart: 800,    // Glitch for 300ms
  secondGlitchStart: 1300,    // Show second kaomoji for 500ms
  thirdKaomojiStart: 1600,    // Glitch for 300ms
  thirdGlitchStart: 2100,     // Show third kaomoji for 500ms

  // Phase 2: Logo reveal (glitch to logo, then glitch in "labs")
  logoRevealStart: 2400,
  labsGlitchStart: 2700,      // "labs" starts glitching in 300ms after logo appears
  labsGlitchEnd: 3000,        // 300ms of glitch for "labs"

  // Phase 3: Logo moves to top (starts after showing full logo for 500ms)
  logoMoveStart: 3500,        // Give 500ms to appreciate full "(c.ai) labs"
  logoMoveEnd: 4300,          // 800ms for smooth movement

  // Phase 4: Text entrance (starts during logo movement - BEFORE cards)
  navFadeStart: 3600,         // Nav elements start fading in
  taglineStart: 3750,         // Starts 250ms into logo movement (after nav starts)
  subtitleStart: 4050,        // 300ms after tagline

  // Phase 5: Cards burst up (after text has appeared)
  cardsCenterStart: 4600,     // Center card - starts after subtitle begins
  cardsAdjacentStart: 4800,   // Adjacent cards 200ms later
  cardsOuterStart: 5000,      // Outer cards 200ms later

  // Complete
  animationComplete: 6200,
};

// The three kaomoji for the cycle
const KAOMOJI = [
  "(◉‿◉)",  // curious, observing
  "(⊙_⊙)",  // surprised, discovering
  "(◕‿◕)",  // satisfied, playful
];

// Glitch characters for scramble effect
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~¡™£¢∞§¶•ªº–≠";

export interface HomeIntroState {
  // Current display text (kaomoji, glitched text, or logo parts)
  displayText: string;
  showLabs: boolean;
  labsText: string; // The actual text to show for labs (glitched or "labs")
  isLabsGlitching: boolean; // Whether labs is currently glitching

  // Logo animation
  logoScale: number;
  logoOpacity: number;
  logoPositionProgress: number; // 0 = centered, 1 = top position

  // Nav fade in
  navOpacity: number;

  // Text entrance
  taglineOpacity: number;
  taglineTranslateY: number;
  subtitleOpacity: number;
  subtitleTranslateY: number;

  // Card animations (progress for each card, 0-1)
  cardProgress: number[];

  // Glitch effect state
  isGlitching: boolean;
  glitchOffset: number;

  // Overall state
  phase: "kaomoji" | "logo-reveal" | "logo-move" | "text" | "cards" | "complete";
  isComplete: boolean;
}

interface UseHomeIntroOptions {
  reducedMotion?: boolean;
  onComplete?: () => void;
  cardCount?: number;
}

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Gentle ease out with subtle overshoot for cards (much less bouncy)
function gentleOvershoot(t: number): number {
  // Slight overshoot then settle - much more subtle than spring
  const c1 = 1.2; // Very mild overshoot (was effectively ~1.7 before)
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Generate glitched text
function generateGlitchText(baseLength: number): string {
  let result = "";
  for (let i = 0; i < baseLength; i++) {
    result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }
  return result;
}

export function useHomeIntro(options: UseHomeIntroOptions = {}) {
  const { reducedMotion = false, onComplete, cardCount = 5 } = options;

  const [state, setState] = useState<HomeIntroState>(() => {
    // If reduced motion, start in completed state
    if (reducedMotion) {
      return {
        displayText: "(c.ai)",
        showLabs: true,
        labsText: "labs",
        isLabsGlitching: false,
        logoScale: 1,
        logoOpacity: 1,
        logoPositionProgress: 1,
        navOpacity: 1,
        taglineOpacity: 1,
        taglineTranslateY: 0,
        subtitleOpacity: 1,
        subtitleTranslateY: 0,
        cardProgress: Array(cardCount).fill(1),
        isGlitching: false,
        glitchOffset: 0,
        phase: "complete",
        isComplete: true,
      };
    }

    // Initial state - first kaomoji, nothing else visible
    return {
      displayText: KAOMOJI[0],
      showLabs: false,
      labsText: "",
      isLabsGlitching: false,
      logoScale: 2.5,
      logoOpacity: 1,
      logoPositionProgress: 0,
      navOpacity: 0,
      taglineOpacity: 0,
      taglineTranslateY: 30,
      subtitleOpacity: 0,
      subtitleTranslateY: 30,
      cardProgress: Array(cardCount).fill(0),
      isGlitching: false,
      glitchOffset: 0,
      phase: "kaomoji",
      isComplete: false,
    };
  });

  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(reducedMotion);
  const glitchIntervalRef = useRef<number | null>(null);

  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;

    // Determine current phase and calculate state
    let displayText = KAOMOJI[0];
    let showLabs = false;
    let labsText = "";
    let isLabsGlitching = false;
    let logoScale = 2.5;
    let logoOpacity = 1;
    let logoPositionProgress = 0;
    let navOpacity = 0;
    let taglineOpacity = 0;
    let taglineTranslateY = 30;
    let subtitleOpacity = 0;
    let subtitleTranslateY = 30;
    let cardProgress = Array(cardCount).fill(0);
    let isGlitching = false;
    let glitchOffset = 0;
    let phase: HomeIntroState["phase"] = "kaomoji";

    // Phase 1: Kaomoji cycle
    if (elapsed < TIMELINE.firstGlitchStart) {
      displayText = KAOMOJI[0];
    } else if (elapsed < TIMELINE.secondKaomojiStart) {
      // First glitch
      isGlitching = true;
      glitchOffset = (Math.random() - 0.5) * 6;
      displayText = generateGlitchText(KAOMOJI[0].length);
    } else if (elapsed < TIMELINE.secondGlitchStart) {
      displayText = KAOMOJI[1];
    } else if (elapsed < TIMELINE.thirdKaomojiStart) {
      // Second glitch
      isGlitching = true;
      glitchOffset = (Math.random() - 0.5) * 6;
      displayText = generateGlitchText(KAOMOJI[1].length);
    } else if (elapsed < TIMELINE.thirdGlitchStart) {
      displayText = KAOMOJI[2];
    } else if (elapsed < TIMELINE.logoRevealStart) {
      // Third glitch (transition to logo)
      isGlitching = true;
      glitchOffset = (Math.random() - 0.5) * 6;
      displayText = generateGlitchText(6);
    } else if (elapsed < TIMELINE.logoMoveStart) {
      // Logo reveal phase
      phase = "logo-reveal";
      displayText = "(c.ai)";

      if (elapsed >= TIMELINE.labsGlitchStart) {
        showLabs = true;
        if (elapsed < TIMELINE.labsGlitchEnd) {
          // Labs is glitching in
          isLabsGlitching = true;
          labsText = generateGlitchText(4); // "labs" is 4 characters
        } else {
          // Labs glitch complete
          labsText = "labs";
        }
      }
    } else if (elapsed < TIMELINE.animationComplete) {
      // Logo move and subsequent phases
      displayText = "(c.ai)";
      showLabs = true;
      labsText = "labs";

      // Logo movement
      if (elapsed < TIMELINE.logoMoveEnd) {
        phase = "logo-move";
        const moveElapsed = elapsed - TIMELINE.logoMoveStart;
        const moveDuration = TIMELINE.logoMoveEnd - TIMELINE.logoMoveStart;
        const moveProgress = Math.min(1, moveElapsed / moveDuration);
        const easedMove = easeOutCubic(moveProgress);

        logoScale = 2.5 - 1.5 * easedMove; // 2.5 -> 1
        logoPositionProgress = easedMove;
      } else {
        logoScale = 1;
        logoPositionProgress = 1;
      }

      // Nav fade in animation
      if (elapsed >= TIMELINE.navFadeStart) {
        const navElapsed = elapsed - TIMELINE.navFadeStart;
        const navProgress = Math.min(1, navElapsed / 400);
        navOpacity = easeOutCubic(navProgress);
      }

      // Tagline animation (slower for visibility)
      if (elapsed >= TIMELINE.taglineStart) {
        phase = "text";
        const taglineElapsed = elapsed - TIMELINE.taglineStart;
        const taglineProgress = Math.min(1, taglineElapsed / 600);
        const easedTagline = easeOutCubic(taglineProgress);
        taglineOpacity = easedTagline;
        taglineTranslateY = 30 * (1 - easedTagline); // More travel distance
      }

      // Subtitle animation (slower for visibility)
      if (elapsed >= TIMELINE.subtitleStart) {
        const subtitleElapsed = elapsed - TIMELINE.subtitleStart;
        const subtitleProgress = Math.min(1, subtitleElapsed / 600);
        const easedSubtitle = easeOutCubic(subtitleProgress);
        subtitleOpacity = easedSubtitle;
        subtitleTranslateY = 30 * (1 - easedSubtitle); // More travel distance
      }

      // Card animations with stagger
      if (elapsed >= TIMELINE.cardsCenterStart) {
        phase = "cards";
        const cardDuration = 600; // Card animation duration

        // Card order: center (2) first, then adjacent (1, 3), then outer (0, 4)
        const cardStarts = [
          TIMELINE.cardsOuterStart,    // Card 0 (far left)
          TIMELINE.cardsAdjacentStart, // Card 1 (left)
          TIMELINE.cardsCenterStart,   // Card 2 (center)
          TIMELINE.cardsAdjacentStart, // Card 3 (right)
          TIMELINE.cardsOuterStart,    // Card 4 (far right)
        ];

        cardProgress = cardStarts.map((startTime) => {
          if (elapsed < startTime) return 0;
          const cardElapsed = elapsed - startTime;
          const progress = Math.min(1, cardElapsed / cardDuration);
          return gentleOvershoot(progress);
        });
      }
    } else {
      // Complete
      phase = "complete";
      displayText = "(c.ai)";
      showLabs = true;
      labsText = "labs";
      logoScale = 1;
      logoPositionProgress = 1;
      navOpacity = 1;
      taglineOpacity = 1;
      taglineTranslateY = 0;
      subtitleOpacity = 1;
      subtitleTranslateY = 0;
      cardProgress = Array(cardCount).fill(1);
    }

    const isComplete = elapsed >= TIMELINE.animationComplete;

    setState({
      displayText,
      showLabs,
      labsText,
      isLabsGlitching,
      logoScale,
      logoOpacity,
      logoPositionProgress,
      navOpacity,
      taglineOpacity,
      taglineTranslateY,
      subtitleOpacity,
      subtitleTranslateY,
      cardProgress,
      isGlitching,
      glitchOffset,
      phase,
      isComplete,
    });

    if (isComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete?.();
    }

    if (!isComplete) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [cardCount, onComplete]);

  // Start animation on mount
  useEffect(() => {
    if (reducedMotion) return;

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current);
      }
    };
  }, [animate, reducedMotion]);

  // Skip intro function
  const skipIntro = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    hasCompletedRef.current = true;

    setState({
      displayText: "(c.ai)",
      showLabs: true,
      labsText: "labs",
      isLabsGlitching: false,
      logoScale: 1,
      logoOpacity: 1,
      logoPositionProgress: 1,
      navOpacity: 1,
      taglineOpacity: 1,
      taglineTranslateY: 0,
      subtitleOpacity: 1,
      subtitleTranslateY: 0,
      cardProgress: Array(cardCount).fill(1),
      isGlitching: false,
      glitchOffset: 0,
      phase: "complete",
      isComplete: true,
    });

    onComplete?.();
  }, [cardCount, onComplete]);

  return {
    ...state,
    skipIntro,
  };
}

export default useHomeIntro;
