import { useState, useRef, useEffect, useCallback } from "react";

interface UseScrollSnapOptions {
  sectionCount: number;
  threshold?: number; // Percentage of viewport height (0-1) to trigger snap
  dampingFactor?: number; // Resistance multiplier (0-1)
  transitionDuration?: number; // ms for snap animation
  rubberBandDuration?: number; // ms for rubber-band return
  enabled?: boolean; // Allow disabling during intro animation
}

interface ScrollSnapState {
  currentSection: number;
  previousSection: number;
  scrollProgress: number; // 0-1 progress through current section transition
  isAnimating: boolean;
  displacement: number; // Current visual displacement in pixels
  transitionProgress: number; // 0-1 progress of section transition animation
}

// Normalize wheel delta across different input devices
function normalizeWheelDelta(event: WheelEvent): number {
  let delta = event.deltaY;

  if (event.deltaMode === 1) {
    delta *= 40;
  } else if (event.deltaMode === 2) {
    delta *= 800;
  }

  return Math.max(-150, Math.min(150, delta));
}

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function useScrollSnap(options: UseScrollSnapOptions) {
  const {
    sectionCount,
    threshold = 0.18,
    dampingFactor = 0.25,
    transitionDuration = 700,
    rubberBandDuration = 250,
    enabled = true,
  } = options;

  const [state, setState] = useState<ScrollSnapState>({
    currentSection: 0,
    previousSection: 0,
    scrollProgress: 0,
    isAnimating: false,
    displacement: 0,
    transitionProgress: 0,
  });

  // Refs for tracking scroll state without causing re-renders
  const accumulatedDeltaRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const currentSectionRef = useRef(0);
  const displacementRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportHeightRef = useRef(0);

  // Touch tracking refs
  const touchStartYRef = useRef(0);
  const touchAccumulatedRef = useRef(0);

  // Update viewport height on resize
  useEffect(() => {
    const updateViewportHeight = () => {
      viewportHeightRef.current = window.innerHeight;
    };
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  // Animate to a target section with full viewport transition
  const animateToSection = useCallback(
    (targetSection: number, fromDisplacement: number = 0) => {
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      const startTime = performance.now();
      const startDisplacement = fromDisplacement;
      const previousSection = currentSectionRef.current;
      const isSnappingToNew = targetSection !== previousSection;
      const direction = targetSection > previousSection ? 1 : -1;
      const viewportHeight = viewportHeightRef.current;

      // For section transitions, we animate from current displacement to full viewport offset
      // then the section swap happens, and we're at 0
      const targetDisplacement = isSnappingToNew ? direction * viewportHeight : 0;

      // Set animating state immediately
      setState(prev => ({
        ...prev,
        isAnimating: true,
        previousSection: previousSection,
      }));

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const duration = isSnappingToNew ? transitionDuration : rubberBandDuration;
        const progress = Math.min(1, elapsed / duration);

        // Use smooth ease-out for all transitions
        const easedProgress = isSnappingToNew ? easeOutQuart(progress) : easeOutCubic(progress);

        let currentDisplacement: number;
        let transitionProgress = 0;

        if (isSnappingToNew) {
          // Animate from start displacement toward full viewport, but express as transition progress
          // The displacement represents how far we've traveled toward the next section
          currentDisplacement = startDisplacement + (targetDisplacement - startDisplacement) * easedProgress;
          transitionProgress = easedProgress;
        } else {
          // Rubber-band: animate displacement back to 0
          currentDisplacement = startDisplacement * (1 - easedProgress);
        }

        displacementRef.current = currentDisplacement;

        // Calculate scroll progress for parallax effect
        const scrollProgress = isSnappingToNew && direction > 0
          ? Math.min(1, easedProgress)
          : 0;

        setState({
          currentSection: isSnappingToNew ? targetSection : currentSectionRef.current,
          previousSection: previousSection,
          scrollProgress,
          isAnimating: true,
          displacement: currentDisplacement,
          transitionProgress: isSnappingToNew ? transitionProgress : 0,
        });

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          isAnimatingRef.current = false;
          currentSectionRef.current = targetSection;
          accumulatedDeltaRef.current = 0;
          displacementRef.current = 0;

          setState({
            currentSection: targetSection,
            previousSection: targetSection,
            scrollProgress: 0,
            isAnimating: false,
            displacement: 0,
            transitionProgress: 0,
          });
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [transitionDuration, rubberBandDuration]
  );

  // Handle wheel events
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!enabled || isAnimatingRef.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      const delta = normalizeWheelDelta(event);
      const viewportHeight = viewportHeightRef.current;
      const thresholdPx = viewportHeight * threshold;

      // Accumulate delta
      accumulatedDeltaRef.current += delta;

      // Apply damping for visual displacement
      const dampedDisplacement = accumulatedDeltaRef.current * dampingFactor;
      displacementRef.current = dampedDisplacement;

      // Check if threshold is crossed
      const direction = accumulatedDeltaRef.current > 0 ? 1 : -1;
      const targetSection = currentSectionRef.current + direction;

      // Check bounds
      const canScroll =
        (direction > 0 && targetSection < sectionCount) ||
        (direction < 0 && targetSection >= 0);

      if (Math.abs(accumulatedDeltaRef.current) > thresholdPx && canScroll) {
        // Threshold crossed - commit to snap
        animateToSection(targetSection, dampedDisplacement);
      } else if (!canScroll && Math.abs(accumulatedDeltaRef.current) > thresholdPx * 0.5) {
        // At bounds - rubber-band back
        animateToSection(currentSectionRef.current, dampedDisplacement);
      } else {
        // Under threshold - show resistance but don't snap
        const progressRatio = Math.min(1, Math.abs(accumulatedDeltaRef.current) / thresholdPx);
        const scrollProgress = direction > 0 ? progressRatio * 0.3 : 0;

        setState(prev => ({
          ...prev,
          displacement: dampedDisplacement,
          scrollProgress: canScroll ? scrollProgress : 0,
        }));
      }
    },
    [enabled, threshold, dampingFactor, sectionCount, animateToSection]
  );

  // Handle wheel end (for rubber-band when user stops scrolling under threshold)
  useEffect(() => {
    if (!enabled) return;

    let wheelEndTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleWheelEnd = () => {
      if (wheelEndTimeout) clearTimeout(wheelEndTimeout);

      wheelEndTimeout = setTimeout(() => {
        if (!isAnimatingRef.current && Math.abs(accumulatedDeltaRef.current) > 5) {
          animateToSection(currentSectionRef.current, displacementRef.current);
        }
      }, 150);
    };

    const wrappedWheelHandler = (e: WheelEvent) => {
      handleWheel(e);
      handleWheelEnd();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", wrappedWheelHandler, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", wrappedWheelHandler);
      }
      if (wheelEndTimeout) clearTimeout(wheelEndTimeout);
    };
  }, [enabled, handleWheel, animateToSection]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled || isAnimatingRef.current) return;
      touchStartYRef.current = event.touches[0].clientY;
      touchAccumulatedRef.current = 0;
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled || isAnimatingRef.current) return;

      const currentY = event.touches[0].clientY;
      const deltaY = touchStartYRef.current - currentY;
      touchAccumulatedRef.current = deltaY;

      const viewportHeight = viewportHeightRef.current;
      const thresholdPx = viewportHeight * threshold;

      const dampedDisplacement = deltaY * dampingFactor;
      displacementRef.current = dampedDisplacement;

      const direction = deltaY > 0 ? 1 : -1;
      const targetSection = currentSectionRef.current + direction;
      const canScroll =
        (direction > 0 && targetSection < sectionCount) ||
        (direction < 0 && targetSection >= 0);

      const progressRatio = Math.min(1, Math.abs(deltaY) / thresholdPx);
      const scrollProgress = direction > 0 && canScroll ? progressRatio * 0.3 : 0;

      setState(prev => ({
        ...prev,
        displacement: dampedDisplacement,
        scrollProgress,
      }));

      event.preventDefault();
    },
    [enabled, threshold, dampingFactor, sectionCount]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || isAnimatingRef.current) return;

    const viewportHeight = viewportHeightRef.current;
    const thresholdPx = viewportHeight * threshold;
    const accumulatedDelta = touchAccumulatedRef.current;

    const direction = accumulatedDelta > 0 ? 1 : -1;
    const targetSection = currentSectionRef.current + direction;
    const canScroll =
      (direction > 0 && targetSection < sectionCount) ||
      (direction < 0 && targetSection >= 0);

    if (Math.abs(accumulatedDelta) > thresholdPx && canScroll) {
      animateToSection(targetSection, displacementRef.current);
    } else {
      animateToSection(currentSectionRef.current, displacementRef.current);
    }

    touchAccumulatedRef.current = 0;
  }, [enabled, threshold, sectionCount, animateToSection]);

  // Set up touch event listeners
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      container.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Navigate to specific section
  const goToSection = useCallback(
    (section: number) => {
      if (section >= 0 && section < sectionCount && section !== currentSectionRef.current) {
        animateToSection(section, 0);
      }
    },
    [sectionCount, animateToSection]
  );

  return {
    containerRef,
    currentSection: state.currentSection,
    previousSection: state.previousSection,
    scrollProgress: state.scrollProgress,
    isAnimating: state.isAnimating,
    displacement: state.displacement,
    transitionProgress: state.transitionProgress,
    goToSection,
  };
}

export default useScrollSnap;
