"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { MascotBody } from "@/lib/physics/bodies";
import { getMascot, isExpressiveMascot, MascotAssets } from "@/lib/mascots/registry";
import { getEyeAssetKey, EyeState } from "@/lib/mascots/states";
import { useMascotState } from "@/hooks/useMascotState";

const MASCOT_SIZE = 70;

interface ConsumingState {
  targetPosition: { x: number; y: number };
  startTime: number;
  onComplete: () => void;
}

interface ExpressiveMascotProps {
  mascotData: MascotBody;
  mousePosition: { x: number; y: number };
  isBeingDragged: boolean;
  isBeingConsumed?: boolean;
  consumeTarget?: { x: number; y: number };
  onConsumeComplete?: () => void;
  onCollision?: (intensity: number) => void;
  onDragStart?: (e: { clientX: number; clientY: number }) => void;
  onDragEnd?: () => void;
  onDragMove?: (x: number, y: number) => void;
}

export function ExpressiveMascot({
  mascotData,
  mousePosition,
  isBeingDragged,
  isBeingConsumed = false,
  consumeTarget,
  onConsumeComplete,
  onCollision,
  onDragStart,
  onDragEnd,
  onDragMove,
}: ExpressiveMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef({ x: 0, y: 0, angle: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const [hoverTilt, setHoverTilt] = useState(0);
  const [grabScale, setGrabScale] = useState(1);
  const [wiggleAngle, setWiggleAngle] = useState(0);
  const wiggleAnimationRef = useRef<number | null>(null);
  const grabAnimationRef = useRef<number | null>(null);

  // Consume animation state
  const [consumeProgress, setConsumeProgress] = useState(0);
  const [consumeStartPos, setConsumeStartPos] = useState<{ x: number; y: number } | null>(null);
  const consumeAnimationRef = useRef<number | null>(null);
  const consumeStartedRef = useRef(false); // Guard against re-initialization

  // Get mascot assets from registry
  const mascotAssets = getMascot(mascotData.mascotId || 'mascot-21');
  const isExpressive = mascotData.mascotId ? isExpressiveMascot(mascotData.mascotId) : false;

  // Use mascot state management
  const {
    eyeState,
    eyeOffset,
    squashStretch,
    updateState,
    handleCollision,
    handleGrab,
    handleRelease,
  } = useMascotState({
    mascotConfig: mascotAssets?.config || { eyeOffsetMax: 0, blinkDuration: 100 },
    isExpressive,
  });

  // Handle mouse move for tilt effect on standing mascots
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (mascotData.state !== "standing" || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;

    const offset = mouseX - centerX;
    const maxTilt = 15;
    const tilt = (offset / (rect.width / 2)) * maxTilt;
    setHoverTilt(Math.max(-maxTilt, Math.min(maxTilt, tilt)));
  }, [mascotData.state]);

  const handleMouseLeave = useCallback(() => {
    setHoverTilt(0);
  }, []);

  // Handle drag via mouse events on the element
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDragStart) {
      onDragStart({ clientX: e.clientX, clientY: e.clientY });
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (onDragMove) {
        onDragMove(moveEvent.clientX, moveEvent.clientY);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (onDragEnd) {
        onDragEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onDragStart, onDragEnd, onDragMove]);

  // Handle touch events for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    if (onDragStart) {
      onDragStart({ clientX: touch.clientX, clientY: touch.clientY });
    }

    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      const touch = moveEvent.touches[0];
      if (onDragMove) {
        onDragMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      if (onDragEnd) {
        onDragEnd();
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  }, [onDragStart, onDragEnd, onDragMove]);

  // Handle drag state changes - bouncy expand and wiggle
  useEffect(() => {
    if (isBeingDragged) {
      handleGrab();

      // Bouncy expand animation on grab
      let startTime = performance.now();
      const animateGrabScale = (time: number) => {
        const elapsed = time - startTime;
        const duration = 300; // ms

        if (elapsed < duration) {
          // Bouncy overshoot effect: starts at 1, overshoots to ~1.25, settles at 1.15
          const progress = elapsed / duration;
          const overshoot = 1.70158; // Bounce factor
          const eased = 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);
          const targetScale = 1.15;
          const scale = 1 + (targetScale - 1) * eased;
          setGrabScale(Math.max(1, scale));
          grabAnimationRef.current = requestAnimationFrame(animateGrabScale);
        } else {
          setGrabScale(1.15);
          grabAnimationRef.current = null;
        }
      };
      grabAnimationRef.current = requestAnimationFrame(animateGrabScale);

      // Start wiggle animation
      const wiggleStartTime = performance.now();
      const animateWiggle = (time: number) => {
        const elapsed = time - wiggleStartTime;
        // Gentle wiggle: oscillates between -8 and 8 degrees
        const wiggle = Math.sin(elapsed * 0.012) * 8;
        setWiggleAngle(wiggle);
        wiggleAnimationRef.current = requestAnimationFrame(animateWiggle);
      };
      wiggleAnimationRef.current = requestAnimationFrame(animateWiggle);

    } else {
      // Stop animations and reset
      if (grabAnimationRef.current) {
        cancelAnimationFrame(grabAnimationRef.current);
        grabAnimationRef.current = null;
      }
      if (wiggleAnimationRef.current) {
        cancelAnimationFrame(wiggleAnimationRef.current);
        wiggleAnimationRef.current = null;
      }

      // Animate scale back down
      setGrabScale(1);
      setWiggleAngle(0);

      if (velocityRef.current) {
        handleRelease(velocityRef.current);
      }
    }

    // Cleanup on unmount
    return () => {
      if (grabAnimationRef.current) {
        cancelAnimationFrame(grabAnimationRef.current);
      }
      if (wiggleAnimationRef.current) {
        cancelAnimationFrame(wiggleAnimationRef.current);
      }
    };
  }, [isBeingDragged, handleGrab, handleRelease]);

  // Handle being consumed by portal - suck-in animation
  // CRITICAL: mascotData.body is NOT in dependencies to prevent re-runs every physics frame
  useEffect(() => {
    if (isBeingConsumed && consumeTarget && onConsumeComplete) {
      // Only initialize ONCE per consume - prevents spin-reset-spin glitch
      if (consumeStartedRef.current) {
        return; // Animation already running, don't restart
      }
      consumeStartedRef.current = true;

      // Capture starting position ONCE at the moment consume begins
      const startPos = mascotData.body?.position || { x: 0, y: 0 };
      setConsumeStartPos({ x: startPos.x, y: startPos.y });
      setConsumeProgress(0);

      const startTime = performance.now();
      const duration = 200; // ms

      const animateConsume = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in curve for acceleration effect
        const eased = progress * progress;
        setConsumeProgress(eased);

        if (progress < 1) {
          consumeAnimationRef.current = requestAnimationFrame(animateConsume);
        } else {
          // Animation complete
          consumeStartedRef.current = false; // Reset for next consume
          onConsumeComplete();
        }
      };

      consumeAnimationRef.current = requestAnimationFrame(animateConsume);

      return () => {
        if (consumeAnimationRef.current) {
          cancelAnimationFrame(consumeAnimationRef.current);
        }
      };
    } else {
      // Reset guard when not consuming (allows future consumes to work)
      consumeStartedRef.current = false;
    }
  }, [isBeingConsumed, consumeTarget, onConsumeComplete]); // Removed mascotData.body!

  // Animation frame loop
  useEffect(() => {
    let animationId: number;

    const updatePosition = () => {
      if (!containerRef.current || !mascotData.body) {
        animationId = requestAnimationFrame(updatePosition);
        return;
      }

      // Skip position updates during consume animation - the consume animation handles positioning
      if (isBeingConsumed) {
        animationId = requestAnimationFrame(updatePosition);
        return;
      }

      const { x, y } = mascotData.body.position;
      const angle = mascotData.body.angle;
      const velocity = mascotData.body.velocity;

      // Store velocity for state calculations
      velocityRef.current = velocity;

      // Calculate position delta for collision detection
      const dx = x - lastPositionRef.current.x;
      const dy = y - lastPositionRef.current.y;
      const positionDelta = Math.sqrt(dx * dx + dy * dy);
      lastPositionRef.current = { x, y };

      // Update mascot state (eye tracking, squash/stretch)
      updateState(
        { x, y },
        mousePosition,
        velocity,
        isBeingDragged
      );

      // Only update DOM if position changed significantly
      const last = lastUpdateRef.current;
      if (
        Math.abs(x - last.x) > 0.1 ||
        Math.abs(y - last.y) > 0.1 ||
        Math.abs(angle - last.angle) > 0.01
      ) {
        // Apply transform with squash/stretch
        containerRef.current.style.transform = `
          translate(${x - MASCOT_SIZE / 2}px, ${y - MASCOT_SIZE / 2}px)
          rotate(${angle}rad)
        `;
        lastUpdateRef.current = { x, y, angle };
      }

      animationId = requestAnimationFrame(updatePosition);
    };

    animationId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mascotData.body, mousePosition, isBeingDragged, isBeingConsumed, updateState]);

  // Collision callback
  useEffect(() => {
    if (onCollision) {
      const speed = Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.y ** 2);
      if (speed > 5) {
        handleCollision(speed);
      }
    }
  }, [onCollision, handleCollision]);

  if (!mascotAssets) {
    return null;
  }

  const isStanding = mascotData.state === "standing";
  const isBirthing = mascotData.state === "birthing";
  const isRemoving = mascotData.isRemoving;
  const birthProgress = mascotData.birthProgress ?? 0;

  // Get the correct eye asset based on current state
  const availableEyeStates = Object.keys(mascotAssets.eyes);
  // Use wide eyes during birth
  const effectiveEyeState = isBirthing ? "wide" : eyeState;
  const eyeAssetKey = getEyeAssetKey(effectiveEyeState, availableEyeStates) as keyof typeof mascotAssets.eyes;
  const currentEyeSrc = mascotAssets.eyes[eyeAssetKey] || mascotAssets.eyes.neutral;

  // Calculate the transform based on state
  const getInnerTransform = () => {
    if (isRemoving) {
      return "scale(0)";
    }
    if (isBirthing) {
      // Birth animation: scale up from 0 with bouncy "pop" effect
      // progress: 0 -> 1 over 180ms

      // Elastic overshoot easing for bouncy pop
      const overshoot = 2.5; // Higher overshoot for more bounce
      const eased = 1 + (overshoot + 1) * Math.pow(birthProgress - 1, 3) + overshoot * Math.pow(birthProgress - 1, 2);

      // Start from scale 0, overshoot to ~1.2, settle at 1.0
      const scale = Math.max(0, eased);

      return `scale(${scale})`;
    }
    if (isBeingConsumed) {
      // Shrink and spin as being sucked into portal
      const scale = 1 - consumeProgress * 0.9; // Shrink to 10%
      const rotation = consumeProgress * 360 * 2; // Spin 2 full rotations
      return `rotate(${rotation}deg) scale(${scale})`;
    }
    if (isBeingDragged) {
      // When dragging: apply grab scale and wiggle
      return `rotate(${wiggleAngle}deg) scale(${grabScale})`;
    }
    if (isStanding) {
      return `rotate(${hoverTilt}deg) scale(${squashStretch.x}, ${squashStretch.y})`;
    }
    return `scale(${squashStretch.x}, ${squashStretch.y})`;
  };

  const getInnerTransition = () => {
    if (isRemoving) {
      return "transform 0.3s cubic-bezier(0.5, -0.5, 0.7, 0.2)";
    }
    if (isBeingDragged) {
      // No transition while dragging for immediate response, but smooth scale changes
      return "transform 0.1s ease-out";
    }
    if (isStanding) {
      return "transform 0.15s ease-out";
    }
    return undefined;
  };

  // For legacy mascots, just render single image
  if (mascotAssets.fallbackImage) {
    return (
      <div
        ref={containerRef}
        className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{
          width: MASCOT_SIZE,
          height: MASCOT_SIZE,
          willChange: "transform",
          transition: isStanding ? "transform 0.3s ease-out" : undefined,
          zIndex: isBeingConsumed ? 70 : isBeingDragged ? 70 : undefined, // Boost z-index during drag and consume
          touchAction: "none", // Prevent scroll while dragging on touch devices
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            transform: getInnerTransform(),
            transition: getInnerTransition(),
            transformOrigin: isStanding ? "center bottom" : "center center",
          }}
        >
          <Image
            src={mascotAssets.fallbackImage}
            alt="Mascot"
            width={MASCOT_SIZE}
            height={MASCOT_SIZE}
            className="w-full h-full object-contain select-none"
            draggable={false}
          />
        </div>
      </div>
    );
  }

  // Calculate consume animation position
  const getConsumeStyle = () => {
    if (isBeingConsumed && consumeStartPos && consumeTarget) {
      const currentX = consumeStartPos.x + (consumeTarget.x - consumeStartPos.x) * consumeProgress;
      const currentY = consumeStartPos.y + (consumeTarget.y - consumeStartPos.y) * consumeProgress;
      return {
        transform: `translate(${currentX - MASCOT_SIZE / 2}px, ${currentY - MASCOT_SIZE / 2}px)`,
        pointerEvents: "none" as const,
      };
    }
    return {};
  };

  // Render expressive mascot with layered assets
  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{
        width: MASCOT_SIZE,
        height: MASCOT_SIZE,
        willChange: "transform",
        transition: isStanding ? "transform 0.3s ease-out" : undefined,
        zIndex: isBeingConsumed ? 70 : isBeingDragged ? 70 : undefined, // Boost z-index during drag and consume to appear above portal
        touchAction: "none", // Prevent scroll while dragging on touch devices
        ...getConsumeStyle(),
      }}
      onMouseDown={isBeingConsumed ? undefined : handleMouseDown}
      onTouchStart={isBeingConsumed ? undefined : handleTouchStart}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: getInnerTransform(),
          transition: getInnerTransition(),
          transformOrigin: isStanding ? "center bottom" : "center center",
        }}
      >
        {/* Body layer - static */}
        <Image
          src={mascotAssets.base}
          alt=""
          width={MASCOT_SIZE}
          height={MASCOT_SIZE}
          className="absolute inset-0 w-full h-full object-contain select-none"
          style={{ pointerEvents: "none" }}
          draggable={false}
          priority
        />

        {/* Eyes layer - moves slightly, swaps src for states */}
        <Image
          src={currentEyeSrc}
          alt=""
          width={MASCOT_SIZE}
          height={MASCOT_SIZE}
          className="absolute inset-0 w-full h-full object-contain select-none"
          style={{
            pointerEvents: "none",
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y + (mascotAssets.config.eyeYOffset || 0)}px)`,
            transition: "transform 0.1s ease-out",
          }}
          draggable={false}
          priority
        />
      </div>
    </div>
  );
}

export default ExpressiveMascot;
