import { useRef, useEffect, useState, useCallback } from "react";
import { layers } from "./layers";

interface LayerTransforms {
  [layerId: string]: string;
}

// Floating animation configuration per layer
const floatingConfig: Record<string, { freqX: number; freqY: number; freqScale: number; ampX: number; ampY: number; ampScale: number; phase: number }> = {
  background: { freqX: 0.08, freqY: 0.06, freqScale: 0.04, ampX: 8, ampY: 6, ampScale: 0.005, phase: 0 },
  L5: { freqX: 0.1, freqY: 0.08, freqScale: 0.05, ampX: 10, ampY: 8, ampScale: 0.008, phase: 0.5 },
  L4: { freqX: 0.12, freqY: 0.1, freqScale: 0.06, ampX: 12, ampY: 10, ampScale: 0.01, phase: 1.0 },
  L3: { freqX: 0.14, freqY: 0.11, freqScale: 0.07, ampX: 14, ampY: 11, ampScale: 0.012, phase: 1.5 },
  L2: { freqX: 0.16, freqY: 0.13, freqScale: 0.08, ampX: 16, ampY: 13, ampScale: 0.014, phase: 2.0 },
  L1: { freqX: 0.18, freqY: 0.15, freqScale: 0.09, ampX: 18, ampY: 15, ampScale: 0.016, phase: 2.5 },
};

// Scroll parallax offsets per layer (how much Y offset per scroll progress 0-1)
const scrollOffsets: Record<string, number> = {
  background: 0,
  L5: -30,
  L4: -60,
  L3: -100,
  L2: -160,
  L1: -240,
};

export function useParallax(scrollProgress: number = 0) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const scrollProgressRef = useRef(scrollProgress);
  const [transforms, setTransforms] = useState<LayerTransforms>({});
  const [isEnabled, setIsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Keep scrollProgress ref in sync
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Check for reduced motion preference and touch device
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouchDevice = !window.matchMedia("(hover: hover)").matches;

    setReducedMotion(prefersReducedMotion);
    setIsEnabled(!prefersReducedMotion && !isTouchDevice);

    // Initialize transforms to zero
    const initialTransforms: LayerTransforms = {};
    layers.forEach((layer) => {
      initialTransforms[layer.id] = "translate3d(0px, 0px, 0) scale(1)";
    });
    setTransforms(initialTransforms);
  }, []);

  const updateTransforms = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate elapsed time for floating animation
    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    // Smooth interpolation (lerp) for cursor easing
    const lerp = 0.08;
    mousePositionRef.current.x +=
      (targetPositionRef.current.x - mousePositionRef.current.x) * lerp;
    mousePositionRef.current.y +=
      (targetPositionRef.current.y - mousePositionRef.current.y) * lerp;

    const { x: mouseX, y: mouseY } = mousePositionRef.current;

    // Calculate cursor offset from center (inverse direction)
    const cursorOffsetX = centerX - mouseX;
    const cursorOffsetY = centerY - mouseY;

    const newTransforms: LayerTransforms = {};
    layers.forEach((layer) => {
      // Cursor-driven parallax
      const cursorX = isEnabled ? cursorOffsetX * layer.speed : 0;
      const cursorY = isEnabled ? cursorOffsetY * layer.speed : 0;

      // Floating animation (runs even if cursor parallax is disabled, unless reduced motion)
      const config = floatingConfig[layer.id] || floatingConfig.L3;
      let floatX = 0;
      let floatY = 0;
      let floatScale = 1;

      if (!reducedMotion) {
        floatX = Math.sin(elapsed * config.freqX + config.phase) * config.ampX;
        floatY = Math.cos(elapsed * config.freqY + config.phase * 0.7) * config.ampY;
        floatScale = 1 + Math.sin(elapsed * config.freqScale + config.phase * 1.3) * config.ampScale;
      }

      // Scroll-based parallax offset (layers separate as user scrolls)
      const scrollOffset = reducedMotion ? 0 : (scrollOffsets[layer.id] || 0) * scrollProgressRef.current;

      // Combine cursor parallax + floating animation + scroll offset
      const totalX = cursorX + floatX;
      const totalY = cursorY + floatY + scrollOffset;

      newTransforms[layer.id] = `translate3d(${totalX}px, ${totalY}px, 0) scale(${floatScale})`;
    });

    setTransforms(newTransforms);
    animationFrameRef.current = requestAnimationFrame(updateTransforms);
  }, [isEnabled, reducedMotion]);

  useEffect(() => {
    // Skip everything if reduced motion is preferred
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isEnabled) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetPositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      if (!containerRef.current || !isEnabled) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Return to center when mouse leaves
      targetPositionRef.current = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
    };

    const container = containerRef.current;
    if (container) {
      // Only add mouse listeners if cursor parallax is enabled
      if (isEnabled) {
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
      }

      // Initialize mouse position to center
      const rect = container.getBoundingClientRect();
      mousePositionRef.current = { x: rect.width / 2, y: rect.height / 2 };
      targetPositionRef.current = { x: rect.width / 2, y: rect.height / 2 };

      // Start animation loop (runs for floating even without cursor parallax)
      animationFrameRef.current = requestAnimationFrame(updateTransforms);
    }

    return () => {
      if (container && isEnabled) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isEnabled, reducedMotion, updateTransforms]);

  return { containerRef, transforms, isEnabled, reducedMotion };
}
