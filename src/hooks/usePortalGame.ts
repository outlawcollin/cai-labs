"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Matter from "matter-js";
import {
  PortalState,
  PORTAL_SIZE,
  PORTAL_GRAVITY_RADIUS,
  PORTAL_GRAVITY_STRENGTH,
  PORTAL_IDLE_TIMEOUT,
} from "@/components/Portal";
import { triggerSuccessConfetti } from "@/lib/confetti";
import { MascotBody } from "@/lib/physics/bodies";
import { playSound } from "@/lib/sounds/soundManager";

const { Bodies, Body, Composite, Events } = Matter;

interface UsePortalGameProps {
  engine: Matter.Engine | null;
  mascots: MascotBody[];
  onMascotConsumed: (mascotId: string) => void;
  isDragging?: boolean;
}

interface ConsumingMascot {
  mascotId: string;
  startPosition: { x: number; y: number };
  startTime: number;
}

const initialPortalState: PortalState = {
  active: false,
  position: null,
  targetCount: 0,
  currentCount: 0,
  remaining: 0,
  isConsuming: false,
  isCompleting: false,
  isClosing: false,
  isFading: false,
  spawnTime: 0,
  lastConsumeTime: 0,
};

export function usePortalGame({
  engine,
  mascots,
  onMascotConsumed,
  isDragging = false,
}: UsePortalGameProps) {
  const [portalState, setPortalState] = useState<PortalState>(initialPortalState);
  const portalStateRef = useRef<PortalState>(initialPortalState);
  portalStateRef.current = portalState;
  const portalSensorRef = useRef<Matter.Body | null>(null);
  const consumingMascotsRef = useRef<Set<string>>(new Set());
  const [consumingMascots, setConsumingMascots] = useState<ConsumingMascot[]>([]);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const consumeMascotRef = useRef<(mascotId: string, mascotPosition: { x: number; y: number }) => void>(() => {});

  // Use ref for mascots to avoid recreating callbacks when mascots array changes
  const mascotsRef = useRef<MascotBody[]>(mascots);
  mascotsRef.current = mascots;

  // Create portal sensor body
  const createPortalSensor = useCallback(
    (x: number, y: number) => {
      if (!engine) return;

      // Remove existing sensor if any
      if (portalSensorRef.current) {
        Composite.remove(engine.world, portalSensorRef.current);
      }

      const sensor = Bodies.circle(x, y, PORTAL_SIZE / 2 - 10, {
        isSensor: true,
        isStatic: true,
        label: "portal-sensor",
      });

      Composite.add(engine.world, sensor);
      portalSensorRef.current = sensor;
    },
    [engine]
  );

  // Remove portal sensor
  const removePortalSensor = useCallback(() => {
    if (!engine || !portalSensorRef.current) return;

    Composite.remove(engine.world, portalSensorRef.current);
    portalSensorRef.current = null;
  }, [engine]);

  // Spawn portal when mascot is grabbed
  const onMascotGrabbed = useCallback(
    (grabPosition: { x: number; y: number }) => {
      // Only spawn portal if one doesn't already exist
      if (portalState.active) return;

      // Determine which side of screen the grab happened
      const screenCenterX = window.innerWidth / 2;
      const grabbedOnLeft = grabPosition.x < screenCenterX;

      // Spawn portal on opposite side
      const portalX = grabbedOnLeft
        ? window.innerWidth - 120 // Right side, 120px from edge
        : 120; // Left side, 120px from edge

      // Random Y position (avoiding top 15% and bottom 25% for cards)
      const minY = window.innerHeight * 0.15;
      const maxY = window.innerHeight * 0.65;
      const portalY = minY + Math.random() * (maxY - minY);

      // Set target count (2-5)
      const targetCount = Math.floor(Math.random() * 4) + 2;

      // Play portal open sound
      playSound("portal-open");

      // Initialize portal state
      setPortalState({
        active: true,
        position: { x: portalX, y: portalY },
        targetCount,
        currentCount: 0,
        remaining: targetCount,
        isConsuming: false,
        isCompleting: false,
        isClosing: false,
        isFading: false,
        spawnTime: Date.now(),
        lastConsumeTime: Date.now(),
      });

      // Create portal physics sensor
      createPortalSensor(portalX, portalY);

      // Reset idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    },
    [portalState.active, createPortalSensor]
  );

  // Apply gravity toward portal for nearby mascots
  const applyPortalGravity = useCallback(() => {
    if (!portalState.active || !portalState.position) return;

    const maxForce = 0.003; // Stronger max force
    const consumeThreshold = 60; // Larger threshold for more reliable consumption
    const velocityOverrideThreshold = 120; // Distance at which we override velocity for smooth pull

    mascotsRef.current.forEach((mascot) => {
      // Skip if being dragged or being consumed
      if (
        mascot.state === "dragging" ||
        consumingMascotsRef.current.has(mascot.id)
      )
        return;

      const body = mascot.body;
      const dx = portalState.position!.x - body.position.x;
      const dy = portalState.position!.y - body.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Auto-consume when very close to portal center (distance-based, not collision)
      if (distance < consumeThreshold) {
        consumeMascotRef.current(mascot.id, body.position);
        return;
      }

      // Only apply gravity within radius
      if (distance > PORTAL_GRAVITY_RADIUS) return;

      // When close, override velocity directly toward portal for smooth pull (prevents glitching)
      if (distance < velocityOverrideThreshold) {
        const dirX = dx / distance;
        const dirY = dy / distance;
        const pullSpeed = 6 * (1 - distance / velocityOverrideThreshold); // Faster when closer
        Body.setVelocity(body, { x: dirX * pullSpeed, y: dirY * pullSpeed });
        return; // Skip force-based gravity when overriding velocity
      }

      // Force increases as mascot gets closer (stronger pull)
      const intensity = 1 - distance / PORTAL_GRAVITY_RADIUS;
      const forceMagnitude = Math.min(
        PORTAL_GRAVITY_STRENGTH * intensity * intensity * 1.5, // Increased strength
        maxForce
      );

      // Normalize direction and apply force
      const forceX = (dx / distance) * forceMagnitude;
      const forceY = (dy / distance) * forceMagnitude;

      Body.applyForce(body, body.position, { x: forceX, y: forceY });
    });
  }, [portalState.active, portalState.position]); // Removed mascots - using ref

  // Handle mascot entering portal
  const consumeMascot = useCallback(
    (mascotId: string, mascotPosition: { x: number; y: number }) => {
      // Prevent double-consumption
      if (consumingMascotsRef.current.has(mascotId)) return;
      consumingMascotsRef.current.add(mascotId);

      // Play portal consume sound
      playSound("portal-consume");

      // Find the mascot and completely freeze it at current position
      const mascot = mascotsRef.current.find((m) => m.id === mascotId);
      if (mascot) {
        // Stop all motion first
        Body.setVelocity(mascot.body, { x: 0, y: 0 });
        Body.setAngularVelocity(mascot.body, 0);
        // Then make static
        Body.setStatic(mascot.body, true);
        // Mark state to prevent any further physics interactions
        mascot.state = "dragging"; // Use dragging state to skip gravity application
      }

      // Trigger consuming animation on portal
      setPortalState((prev) => ({
        ...prev,
        isConsuming: true,
        lastConsumeTime: Date.now(),
      }));

      // Add to consuming mascots for animation
      setConsumingMascots((prev) => [
        ...prev,
        {
          mascotId,
          startPosition: { ...mascotPosition },
          startTime: Date.now(),
        },
      ]);

      // Reset idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    },
    [] // Removed mascots - using ref
  );

  // Keep ref updated for use in applyPortalGravity
  consumeMascotRef.current = consumeMascot;

  // Destroy portal and reset state (defined first to avoid circular dependency)
  const destroyPortal = useCallback(() => {
    removePortalSensor();
    consumingMascotsRef.current.clear();
    setConsumingMascots([]);
    setPortalState(initialPortalState);

    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, [removePortalSensor]);

  // Trigger success celebration
  const triggerSuccess = useCallback(() => {
    const currentState = portalStateRef.current;
    if (!currentState.position) return;

    // Play success sound
    playSound("success");

    // Confetti from portal position
    triggerSuccessConfetti(currentState.position.x, currentState.position.y);

    // Flash the portal
    setPortalState((prev) => ({ ...prev, isCompleting: true }));

    // Portal expands and fades
    setTimeout(() => {
      setPortalState((prev) => ({ ...prev, isClosing: true }));
    }, 500);

    // Remove portal after animation
    setTimeout(() => {
      destroyPortal();
    }, 1000);
  }, [destroyPortal]);

  // Complete mascot consumption (called after animation)
  const completeMascotConsumption = useCallback(
    (mascotId: string) => {
      consumingMascotsRef.current.delete(mascotId);

      // Remove from consuming mascots
      setConsumingMascots((prev) => prev.filter((m) => m.mascotId !== mascotId));

      // Remove mascot from world
      onMascotConsumed(mascotId);

      // Update counter and check for success
      setPortalState((prev) => {
        const newRemaining = prev.remaining - 1;

        // Check for completion (when remaining reaches 0)
        if (newRemaining === 0) {
          // Trigger success immediately
          triggerSuccess();
        }

        return {
          ...prev,
          currentCount: prev.currentCount + 1,
          remaining: newRemaining,
          isConsuming: false,
        };
      });
    },
    [onMascotConsumed, triggerSuccess]
  );

  // Collision detection for portal
  useEffect(() => {
    if (!engine || !portalState.active) return;

    const handleCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        // Check if one is portal and other is mascot
        const portal = [bodyA, bodyB].find(
          (b) => b.label === "portal-sensor"
        );
        const mascotBody = [bodyA, bodyB].find((b) =>
          b.label?.startsWith("mascot-")
        );

        if (portal && mascotBody) {
          const mascotId = mascotBody.label.replace("mascot-", "");
          const mascot = mascotsRef.current.find((m) => m.id === mascotId);

          // Skip if mascot is being dragged, already consuming, or not found
          if (
            !mascot ||
            mascot.state === "dragging" ||
            consumingMascotsRef.current.has(mascotId)
          ) {
            return;
          }

          consumeMascot(mascotId, mascot.body.position);
        }
      });
    };

    Events.on(engine, "collisionStart", handleCollision);
    return () => {
      Events.off(engine, "collisionStart", handleCollision);
    };
  }, [engine, portalState.active, consumeMascot]); // Removed mascots - using ref

  // Idle timeout - fade portal if no interaction (but not while dragging)
  useEffect(() => {
    if (!portalState.active || portalState.isCompleting || portalState.isFading || isDragging)
      return;

    idleTimeoutRef.current = setTimeout(() => {
      const timeSinceLastConsume = Date.now() - portalState.lastConsumeTime;

      if (timeSinceLastConsume >= PORTAL_IDLE_TIMEOUT) {
        // Fade out portal
        setPortalState((prev) => ({ ...prev, isFading: true }));

        setTimeout(() => {
          destroyPortal();
        }, 500);
      }
    }, PORTAL_IDLE_TIMEOUT);

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [
    portalState.active,
    portalState.lastConsumeTime,
    portalState.isCompleting,
    portalState.isFading,
    isDragging,
    destroyPortal,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      removePortalSensor();
    };
  }, [removePortalSensor]);

  return {
    portalState,
    consumingMascots,
    onMascotGrabbed,
    applyPortalGravity,
    completeMascotConsumption,
    destroyPortal,
  };
}
