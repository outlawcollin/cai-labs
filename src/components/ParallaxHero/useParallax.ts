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
// More pronounced effect for better visual depth during transitions
const scrollOffsets: Record<string, number> = {
  background: 0,
  L5: -50,
  L4: -100,
  L3: -170,
  L2: -280,
  L1: -400,
};

// Tilt sensitivity multiplier for mobile (how much parallax per degree of tilt)
const TILT_SENSITIVITY = 3;
// Maximum tilt angle to consider (degrees)
const MAX_TILT_ANGLE = 25;

export function useParallax(scrollProgress: number = 0) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const tiltRef = useRef({ x: 0, y: 0 }); // Device tilt values
  const targetTiltRef = useRef({ x: 0, y: 0 }); // Target tilt for smoothing
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const scrollProgressRef = useRef(scrollProgress);
  const [transforms, setTransforms] = useState<LayerTransforms>({});
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTiltEnabled, setIsTiltEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Keep scrollProgress ref in sync
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Check for reduced motion preference, device type, and gyroscope support
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const isTouchDevice = !hasHover;

    setReducedMotion(prefersReducedMotion);
    setIsDesktop(!isTouchDevice);

    // Initialize transforms to zero
    const initialTransforms: LayerTransforms = {};
    layers.forEach((layer) => {
      initialTransforms[layer.id] = "translate3d(0px, 0px, 0) scale(1)";
    });
    setTransforms(initialTransforms);

    // Check for device orientation support on mobile
    if (isTouchDevice && !prefersReducedMotion) {
      // Check if DeviceOrientationEvent is available
      if (typeof DeviceOrientationEvent !== "undefined") {
        // iOS 13+ requires permission
        if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function") {
          // We'll request permission on first interaction
          setIsTiltEnabled(false);
        } else {
          // Android and older iOS - just enable it
          setIsTiltEnabled(true);
        }
      }
    }
  }, []);

  // Request device orientation permission on iOS (called on first tap)
  const requestTiltPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== "undefined") {
      const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>
      };
      if (typeof DeviceOrientationEventTyped.requestPermission === "function") {
        try {
          const permission = await DeviceOrientationEventTyped.requestPermission();
          if (permission === "granted") {
            setIsTiltEnabled(true);
          }
        } catch {
          console.log("Device orientation permission denied");
        }
      }
    }
  }, []);

  const updateTransforms = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate elapsed time for floating animation
    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    // Smooth interpolation (lerp)
    const lerp = 0.08;

    let parallaxX = 0;
    let parallaxY = 0;

    if (isDesktop) {
      // Desktop: Mouse-based parallax
      mousePositionRef.current.x +=
        (targetPositionRef.current.x - mousePositionRef.current.x) * lerp;
      mousePositionRef.current.y +=
        (targetPositionRef.current.y - mousePositionRef.current.y) * lerp;

      const { x: mouseX, y: mouseY } = mousePositionRef.current;

      // Calculate cursor offset from center (inverse direction)
      parallaxX = centerX - mouseX;
      parallaxY = centerY - mouseY;
    } else if (isTiltEnabled) {
      // Mobile: Tilt-based parallax
      tiltRef.current.x += (targetTiltRef.current.x - tiltRef.current.x) * lerp;
      tiltRef.current.y += (targetTiltRef.current.y - tiltRef.current.y) * lerp;

      // Convert tilt to parallax offset (similar magnitude to mouse)
      // Tilt X (gamma) affects horizontal, Tilt Y (beta) affects vertical
      parallaxX = tiltRef.current.x * TILT_SENSITIVITY * 10;
      parallaxY = tiltRef.current.y * TILT_SENSITIVITY * 10;
    }

    const newTransforms: LayerTransforms = {};
    layers.forEach((layer) => {
      // Parallax from mouse or tilt
      const layerParallaxX = parallaxX * layer.speed;
      const layerParallaxY = parallaxY * layer.speed;

      // Floating animation (runs even if parallax is disabled, unless reduced motion)
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

      // Combine parallax + floating animation + scroll offset
      const totalX = layerParallaxX + floatX;
      const totalY = layerParallaxY + floatY + scrollOffset;

      newTransforms[layer.id] = `translate3d(${totalX}px, ${totalY}px, 0) scale(${floatScale})`;
    });

    setTransforms(newTransforms);
    animationFrameRef.current = requestAnimationFrame(updateTransforms);
  }, [isDesktop, isTiltEnabled, reducedMotion]);

  // Handle device orientation for mobile tilt
  useEffect(() => {
    if (reducedMotion || isDesktop || !isTiltEnabled) return;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      // gamma: left-to-right tilt in degrees (-90 to 90)
      // beta: front-to-back tilt in degrees (-180 to 180)
      const gamma = event.gamma || 0;
      const beta = event.beta || 0;

      // Clamp values to max tilt angle
      const clampedGamma = Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, gamma));
      const clampedBeta = Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, beta - 45)); // Subtract 45 to center around typical phone holding angle

      // Normalize to -1 to 1 range
      targetTiltRef.current = {
        x: clampedGamma / MAX_TILT_ANGLE,
        y: clampedBeta / MAX_TILT_ANGLE,
      };
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [reducedMotion, isDesktop, isTiltEnabled]);

  // Handle mouse events for desktop
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isDesktop) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetPositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      if (!containerRef.current || !isDesktop) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Return to center when mouse leaves
      targetPositionRef.current = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
    };

    // Handle tap to request permission on iOS
    const handleTouchStart = () => {
      if (!isDesktop && !isTiltEnabled) {
        requestTiltPermission();
      }
    };

    const container = containerRef.current;
    if (container) {
      if (isDesktop) {
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
      } else {
        container.addEventListener("touchstart", handleTouchStart, { once: true });
      }

      // Initialize position to center
      const rect = container.getBoundingClientRect();
      mousePositionRef.current = { x: rect.width / 2, y: rect.height / 2 };
      targetPositionRef.current = { x: rect.width / 2, y: rect.height / 2 };

      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(updateTransforms);
    }

    return () => {
      if (container) {
        if (isDesktop) {
          container.removeEventListener("mousemove", handleMouseMove);
          container.removeEventListener("mouseleave", handleMouseLeave);
        }
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDesktop, isTiltEnabled, reducedMotion, updateTransforms, requestTiltPermission]);

  return { containerRef, transforms, isDesktop, isTiltEnabled, reducedMotion };
}
