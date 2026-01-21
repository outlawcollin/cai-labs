import { useState, useEffect, useRef, useCallback } from "react";

// Revised Timeline: Logo stays centered until text fades in, then shrinks
// Layers fall from behind - background layers (L5) first, then foreground (L1) last
const TIMELINE = {
  // Phase 1: Logo on black
  logoShuffleStart: 100,
  logoShuffleComplete: 1800, // ~1.7s for shuffle
  logoHoldEnd: 2300, // 500ms hold after shuffle

  // Phase 2: Background reveals (logo stays large and centered)
  backgroundRevealStart: 2300,
  backgroundRevealEnd: 3100, // 800ms for bg reveal

  // Phase 3: Layers fall from behind (L5 background first, L1 foreground last)
  // Stagger: 150ms between each layer for smoother cascade
  L5Start: 3200, // L5 (furthest/background) falls first
  L4Start: 3350,
  L3Start: 3500,
  L2Start: 3650,
  L1Start: 3800, // L1 (closest/foreground) falls last

  // Phase 4: Text fades in (logo still centered)
  taglineStart: 4300,
  subtitleStart: 4500, // 200ms stagger

  // Phase 5: Logo shrinks to final position (after text is visible)
  logoTransitionStart: 4900,
  logoTransitionEnd: 5500, // 600ms for smooth shrink

  // Complete
  animationComplete: 5700,
};

// Animation duration per layer (gentle fall + settle)
const LAYER_DURATION = 600;

// Logo transition duration
const LOGO_TRANSITION_DURATION = 600;

export interface LayerAnimationState {
  opacity: number;
  scale: number;
  translateY: number;
  blur: number; // Motion blur during fall
  isAnimating: boolean;
}

export interface LogoAnimationState {
  phase: "shuffle" | "hold" | "waiting" | "transition" | "final";
  shuffleProgress: number; // 0-1 for shuffle animation
  scale: number; // Large (2.5) to final (1)
  opacity: number;
  positionProgress: number; // 0 = centered, 1 = final position
}

export interface IntroAnimationState {
  layers: Record<string, LayerAnimationState>;
  particleOpacity: number;
  blackOverlayOpacity: number;
  logo: LogoAnimationState;
  taglineOpacity: number;
  subtitleOpacity: number;
  isComplete: boolean;
}

interface UseIntroAnimationOptions {
  reducedMotion?: boolean;
  onComplete?: () => void;
}

// Initial layer states for "fall from behind" animation
// Layers start slightly larger than final size (gentle iOS-like fall)
// Much subtler than before - smooth and elegant
const INITIAL_LAYER_STATES: Record<string, { scale: number; translateY: number; blur: number }> = {
  background: { scale: 1.01, translateY: 0, blur: 0 }, // Background just fades in with slight scale
  L5: { scale: 1.06, translateY: -8, blur: 0 }, // Furthest - subtle
  L4: { scale: 1.08, translateY: -10, blur: 0 },
  L3: { scale: 1.10, translateY: -12, blur: 0 },
  L2: { scale: 1.12, translateY: -14, blur: 0 },
  L1: { scale: 1.15, translateY: -16, blur: 0 }, // Closest - slightly more noticeable
};

// Layer start times - L5 (background) falls first, then foreground layers follow
const LAYER_START_TIMES: Record<string, number> = {
  background: TIMELINE.backgroundRevealStart,
  L5: TIMELINE.L5Start, // Background layers first
  L4: TIMELINE.L4Start,
  L3: TIMELINE.L3Start,
  L2: TIMELINE.L2Start,
  L1: TIMELINE.L1Start, // Foreground last
};

// Easing functions
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Gentle spring easing like iOS app icons settling into place
// Smooth deceleration with very subtle overshoot
function springBounceEase(t: number): number {
  // Gentle spring with minimal overshoot (~1.02) for smooth settle
  if (t < 0.7) {
    // Smooth ease toward target with slight overshoot
    const p = t / 0.7;
    const eased = 1 - Math.pow(1 - p, 3);
    return eased * 1.02; // Slight overshoot to 1.02
  } else {
    // Gentle settle from 1.02 to 1.0
    const p = (t - 0.7) / 0.3;
    return 1.02 - 0.02 * easeOut(p);
  }
}

// Gentler easing for background layer
function gentleEaseOut(t: number): number {
  return 1 - Math.pow(1 - t, 2.5);
}

export function useIntroAnimation(options: UseIntroAnimationOptions = {}) {
  const { reducedMotion = false, onComplete } = options;

  const [state, setState] = useState<IntroAnimationState>(() => {
    // If reduced motion, start in completed state
    if (reducedMotion) {
      const completedLayers: Record<string, LayerAnimationState> = {};
      Object.keys(INITIAL_LAYER_STATES).forEach((layerId) => {
        completedLayers[layerId] = {
          opacity: 1,
          scale: 1,
          translateY: 0,
          blur: 0,
          isAnimating: false,
        };
      });
      return {
        layers: completedLayers,
        particleOpacity: 0.2,
        blackOverlayOpacity: 0,
        logo: {
          phase: "final",
          shuffleProgress: 1,
          scale: 1,
          opacity: 1,
          positionProgress: 1,
        },
        taglineOpacity: 1,
        subtitleOpacity: 1,
        isComplete: true,
      };
    }

    // Normal initial state - black screen with nothing visible
    // Layers start large (falling from behind camera)
    const initialLayers: Record<string, LayerAnimationState> = {};
    Object.entries(INITIAL_LAYER_STATES).forEach(([layerId, initial]) => {
      initialLayers[layerId] = {
        opacity: 0,
        scale: initial.scale,
        translateY: initial.translateY,
        blur: initial.blur,
        isAnimating: false,
      };
    });
    return {
      layers: initialLayers,
      particleOpacity: 0,
      blackOverlayOpacity: 1,
      logo: {
        phase: "shuffle",
        shuffleProgress: 0,
        scale: 2.5, // Large centered logo
        opacity: 0,
        positionProgress: 0,
      },
      taglineOpacity: 0,
      subtitleOpacity: 0,
      isComplete: false,
    };
  });

  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  const animate = useCallback(
    (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;

      // ===== LOGO ANIMATION =====
      let logo: LogoAnimationState;

      if (elapsed < TIMELINE.logoShuffleStart) {
        // Before shuffle starts
        logo = {
          phase: "shuffle",
          shuffleProgress: 0,
          scale: 2.5,
          opacity: 0,
          positionProgress: 0,
        };
      } else if (elapsed < TIMELINE.logoShuffleComplete) {
        // Shuffle in progress
        const shuffleElapsed = elapsed - TIMELINE.logoShuffleStart;
        const shuffleDuration = TIMELINE.logoShuffleComplete - TIMELINE.logoShuffleStart;
        const shuffleProgress = Math.min(1, shuffleElapsed / shuffleDuration);
        // Fade in the logo during first 30% of shuffle
        const fadeProgress = Math.min(1, shuffleProgress / 0.3);

        logo = {
          phase: "shuffle",
          shuffleProgress,
          scale: 2.5,
          opacity: easeOut(fadeProgress),
          positionProgress: 0,
        };
      } else if (elapsed < TIMELINE.logoHoldEnd) {
        // Hold phase - logo fully visible on black
        logo = {
          phase: "hold",
          shuffleProgress: 1,
          scale: 2.5,
          opacity: 1,
          positionProgress: 0,
        };
      } else if (elapsed < TIMELINE.logoTransitionStart) {
        // Waiting phase - logo stays large and centered while world builds
        logo = {
          phase: "waiting",
          shuffleProgress: 1,
          scale: 2.5,
          opacity: 1,
          positionProgress: 0,
        };
      } else if (elapsed < TIMELINE.logoTransitionEnd) {
        // Transition phase - logo shrinks and moves to final position smoothly
        const transitionElapsed = elapsed - TIMELINE.logoTransitionStart;
        const transitionProgress = Math.min(1, transitionElapsed / LOGO_TRANSITION_DURATION);
        // Use smooth ease-out for both scale and position to feel unified
        const easedProgress = easeOut(transitionProgress);

        logo = {
          phase: "transition",
          shuffleProgress: 1,
          scale: 2.5 - 1.5 * easedProgress, // 2.5 -> 1
          opacity: 1,
          positionProgress: easedProgress,
        };
      } else {
        // Final state
        logo = {
          phase: "final",
          shuffleProgress: 1,
          scale: 1,
          opacity: 1,
          positionProgress: 1,
        };
      }

      // ===== BLACK OVERLAY =====
      let blackOverlayOpacity = 1;
      if (elapsed >= TIMELINE.backgroundRevealStart) {
        const fadeElapsed = elapsed - TIMELINE.backgroundRevealStart;
        const fadeDuration = TIMELINE.backgroundRevealEnd - TIMELINE.backgroundRevealStart;
        const fadeProgress = Math.min(1, fadeElapsed / fadeDuration);
        blackOverlayOpacity = 1 - easeOut(fadeProgress);
      }

      // ===== PARTICLE OPACITY =====
      let particleOpacity = 0;
      if (elapsed >= TIMELINE.backgroundRevealStart) {
        const particleElapsed = elapsed - TIMELINE.backgroundRevealStart;
        const particleProgress = Math.min(1, particleElapsed / 1000);
        particleOpacity = easeOut(particleProgress) * 0.2;
      }

      // ===== LAYER ANIMATIONS (Fall from behind with bounce) =====
      const newLayers: Record<string, LayerAnimationState> = {};
      Object.entries(INITIAL_LAYER_STATES).forEach(([layerId, initial]) => {
        const startTime = LAYER_START_TIMES[layerId];

        if (elapsed < startTime) {
          // Before animation starts - layer invisible at starting position
          newLayers[layerId] = {
            opacity: 0,
            scale: initial.scale,
            translateY: initial.translateY,
            blur: initial.blur,
            isAnimating: false,
          };
        } else {
          const layerElapsed = elapsed - startTime;
          const progress = Math.min(1, layerElapsed / LAYER_DURATION);

          // Background uses gentle easing, character layers use spring bounce
          const isBackground = layerId === "background";
          const easedProgress = isBackground ? gentleEaseOut(progress) : springBounceEase(progress);

          // Opacity fades in quickly at the start
          const opacityProgress = Math.min(1, progress / 0.4); // Fade in during first 40%

          // Scale: starts large (e.g., 1.45) and animates down to 1
          // With spring bounce, it overshoots slightly past 1 (to ~0.97) then settles
          const targetScale = 1;
          const scaleRange = initial.scale - targetScale; // positive number (1.45 - 1 = 0.45)
          const currentScale = initial.scale - scaleRange * easedProgress;

          // TranslateY: starts negative (above) and settles to 0
          const currentTranslateY = initial.translateY * (1 - easedProgress);

          // Blur: clears as layer lands
          const blurProgress = Math.min(1, progress / 0.7); // Blur clears during first 70%
          const currentBlur = initial.blur * (1 - easeOut(blurProgress));

          newLayers[layerId] = {
            opacity: easeOut(opacityProgress),
            scale: currentScale,
            translateY: currentTranslateY,
            blur: currentBlur,
            isAnimating: progress < 1,
          };
        }
      });

      // ===== TEXT ANIMATIONS =====
      let taglineOpacity = 0;
      if (elapsed >= TIMELINE.taglineStart) {
        const taglineElapsed = elapsed - TIMELINE.taglineStart;
        taglineOpacity = Math.min(1, easeOut(taglineElapsed / 400)); // Faster fade
      }

      let subtitleOpacity = 0;
      if (elapsed >= TIMELINE.subtitleStart) {
        const subtitleElapsed = elapsed - TIMELINE.subtitleStart;
        subtitleOpacity = Math.min(1, easeOut(subtitleElapsed / 400)); // Faster fade
      }

      // ===== CHECK COMPLETION =====
      const isComplete = elapsed >= TIMELINE.animationComplete;

      setState({
        layers: newLayers,
        particleOpacity,
        blackOverlayOpacity,
        logo,
        taglineOpacity,
        subtitleOpacity,
        isComplete,
      });

      if (isComplete && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete?.();
      }

      if (!isComplete) {
        frameRef.current = requestAnimationFrame(animate);
      }
    },
    [onComplete]
  );

  // Start animation on mount
  useEffect(() => {
    if (reducedMotion) {
      // Immediately call onComplete for reduced motion
      onComplete?.();
      return;
    }

    // Small delay to ensure assets are ready
    const startDelay = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, 50);

    return () => {
      clearTimeout(startDelay);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [animate, reducedMotion, onComplete]);

  // Skip function for users who want to skip the intro
  const skipIntro = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    hasCompletedRef.current = true;

    const completedLayers: Record<string, LayerAnimationState> = {};
    Object.keys(INITIAL_LAYER_STATES).forEach((layerId) => {
      completedLayers[layerId] = {
        opacity: 1,
        scale: 1,
        translateY: 0,
        blur: 0,
        isAnimating: false,
      };
    });

    setState({
      layers: completedLayers,
      particleOpacity: 0.2,
      blackOverlayOpacity: 0,
      logo: {
        phase: "final",
        shuffleProgress: 1,
        scale: 1,
        opacity: 1,
        positionProgress: 1,
      },
      taglineOpacity: 1,
      subtitleOpacity: 1,
      isComplete: true,
    });

    onComplete?.();
  }, [onComplete]);

  // Reset function for development/testing
  const resetAnimation = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    startTimeRef.current = null;
    hasCompletedRef.current = false;

    const initialLayers: Record<string, LayerAnimationState> = {};
    Object.entries(INITIAL_LAYER_STATES).forEach(([layerId, initial]) => {
      initialLayers[layerId] = {
        opacity: 0,
        scale: initial.scale,
        translateY: initial.translateY,
        blur: initial.blur,
        isAnimating: false,
      };
    });

    setState({
      layers: initialLayers,
      particleOpacity: 0,
      blackOverlayOpacity: 1,
      logo: {
        phase: "shuffle",
        shuffleProgress: 0,
        scale: 2.5,
        opacity: 0,
        positionProgress: 0,
      },
      taglineOpacity: 0,
      subtitleOpacity: 0,
      isComplete: false,
    });

    setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, 50);
  }, [animate]);

  return {
    ...state,
    skipIntro,
    resetAnimation,
  };
}

export default useIntroAnimation;
