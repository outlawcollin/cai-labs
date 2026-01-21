"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Character set for shuffling - tech symbols and alphanumerics
const SHUFFLE_CHARS = "◉◎●○⊙◐◑⊕⊖⊗§¶†‡№∞∆ΣΩλABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface ShuffleTextProps {
  text: string;
  delay?: number; // ms before animation starts
  duration?: number; // total animation duration in ms
  cycleSpeed?: number; // ms per character cycle
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  reducedMotion?: boolean;
  // New: External progress control (0-1) - overrides internal timing
  progress?: number;
  // New: Whether animation should start
  shouldStart?: boolean;
}

export function ShuffleText({
  text,
  delay = 0,
  duration = 1000,
  cycleSpeed = 60,
  className = "",
  style = {},
  onComplete,
  reducedMotion = false,
  progress: externalProgress,
  shouldStart = true,
}: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState(reducedMotion ? text : "");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(reducedMotion);
  const lockedIndicesRef = useRef<Set<number>>(new Set());
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastCycleRef = useRef<number>(0);
  const hasCalledCompleteRef = useRef(false);

  // Check if we're using external progress control
  const isExternallyControlled = externalProgress !== undefined;

  const getRandomChar = useCallback(() => {
    return SHUFFLE_CHARS[Math.floor(Math.random() * SHUFFLE_CHARS.length)];
  }, []);

  // Memoize the total non-space characters
  const totalChars = useMemo(() => {
    return text.replace(/[\s\n]/g, "").length;
  }, [text]);

  const generateShuffledText = useCallback(
    (lockedCount: number) => {
      let nonSpaceIndex = 0;
      return text
        .split("")
        .map((char, index) => {
          // Preserve spaces and newlines
          if (char === " " || char === "\n") return char;
          // Check if this character should be locked
          const shouldBeLocked = nonSpaceIndex < lockedCount;
          nonSpaceIndex++;
          return shouldBeLocked ? char : getRandomChar();
        })
        .join("");
    },
    [text, getRandomChar]
  );

  // External progress control
  useEffect(() => {
    if (!isExternallyControlled || reducedMotion) return;

    const progress = externalProgress ?? 0;
    const lockedCount = Math.floor(progress * totalChars);

    if (progress >= 1) {
      setDisplayText(text);
      setIsComplete(true);
      if (!hasCalledCompleteRef.current) {
        hasCalledCompleteRef.current = true;
        onComplete?.();
      }
    } else if (progress > 0) {
      setDisplayText(generateShuffledText(lockedCount));
      setIsComplete(false);
    } else {
      setDisplayText(generateShuffledText(0));
      setIsComplete(false);
    }
  }, [externalProgress, isExternallyControlled, reducedMotion, text, totalChars, generateShuffledText, onComplete]);

  // Continuous cycling for externally controlled mode
  useEffect(() => {
    if (!isExternallyControlled || reducedMotion || isComplete) return;

    let frameId: number;
    let lastTime = performance.now();

    const cycle = (currentTime: number) => {
      if (currentTime - lastTime >= cycleSpeed) {
        lastTime = currentTime;
        const progress = externalProgress ?? 0;
        const lockedCount = Math.floor(progress * totalChars);
        if (progress < 1) {
          setDisplayText(generateShuffledText(lockedCount));
        }
      }
      frameId = requestAnimationFrame(cycle);
    };

    frameId = requestAnimationFrame(cycle);
    return () => cancelAnimationFrame(frameId);
  }, [isExternallyControlled, reducedMotion, isComplete, cycleSpeed, externalProgress, totalChars, generateShuffledText]);

  // Internal timing control (original behavior)
  useEffect(() => {
    if (isExternallyControlled) return;
    if (reducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }
    if (!shouldStart) {
      setDisplayText(generateShuffledText(0));
      return;
    }

    // Initialize with shuffled text
    lockedIndicesRef.current = new Set();
    hasCalledCompleteRef.current = false;
    setDisplayText(generateShuffledText(0));

    const delayTimeout = setTimeout(() => {
      setIsAnimating(true);
      startTimeRef.current = performance.now();
      lastCycleRef.current = 0;
    }, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [delay, reducedMotion, generateShuffledText, text, isExternallyControlled, shouldStart]);

  // Internal animation loop
  useEffect(() => {
    if (isExternallyControlled) return;
    if (!isAnimating || reducedMotion) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;

      // Calculate how many characters should be locked based on elapsed time
      const lockInterval = duration / totalChars;
      const targetLocked = Math.min(totalChars, Math.floor(elapsed / lockInterval));

      // Cycle non-locked characters
      const timeSinceLastCycle = elapsed - lastCycleRef.current;
      if (timeSinceLastCycle >= cycleSpeed) {
        lastCycleRef.current = elapsed;
        setDisplayText(generateShuffledText(targetLocked));
      }

      // Check if animation is complete
      if (targetLocked >= totalChars) {
        setDisplayText(text);
        setIsAnimating(false);
        setIsComplete(true);
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true;
          onComplete?.();
        }
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isAnimating, text, duration, cycleSpeed, generateShuffledText, onComplete, reducedMotion, totalChars, isExternallyControlled]);

  return (
    <span
      className={className}
      style={{
        ...style,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {displayText}
    </span>
  );
}

export default ShuffleText;
