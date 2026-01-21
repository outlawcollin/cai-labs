"use client";

import { useCallback, useRef, useState } from "react";
import Matter from "matter-js";
import { MascotBody, createMascotBody, LetterAnchor } from "@/lib/physics/bodies";
import {
  checkForHangingOpportunity,
  createHangingConstraint,
  releaseFromHanging,
} from "@/lib/physics/constraints";
import { getMascotTypeCount } from "@/components/MascotLauncher/Mascot";
import { getRandomMascot } from "@/lib/mascots/registry";
import { playSound } from "@/lib/sounds/soundManager";

const { World, Body, Events } = Matter;

const MAX_MASCOTS = 30;
const MAX_HANGING = 2;
const BOUNCES_TO_STAND = 1; // Number of bounces before standing up

// Birth animation timing
const BIRTH_DURATION = 180; // ms - duration of birth animation

interface SpawnerConfig {
  engine: Matter.Engine | null;
  logoPosition: { x: number; y: number } | null;
  letterAnchors: LetterAnchor[];
}

export function useMascotSpawner({ engine, logoPosition, letterAnchors }: SpawnerConfig) {
  const [mascots, setMascots] = useState<MascotBody[]>([]);
  const mascotsRef = useRef<MascotBody[]>([]);
  const nextIdRef = useRef(0);
  const hangingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const logoPositionRef = useRef(logoPosition);
  const engineRef = useRef(engine);

  // Keep refs updated
  mascotsRef.current = mascots;
  logoPositionRef.current = logoPosition;
  engineRef.current = engine;

  const spawnMascot = useCallback(
    (clickX: number, clickY: number) => {
      const currentEngine = engineRef.current;
      const currentLogoPosition = logoPositionRef.current;

      if (!currentEngine || !currentLogoPosition) {
        console.log("Cannot spawn: engine or logoPosition not ready", { currentEngine: !!currentEngine, currentLogoPosition });
        return;
      }

      const id = `mascot-${nextIdRef.current++}`;
      const mascotType = Math.floor(Math.random() * getMascotTypeCount());

      // Get a random mascot from the registry for expressive features
      const registryMascot = getRandomMascot();

      // Create physics body at logo position - starts static during birth
      const body = createMascotBody(currentLogoPosition.x, currentLogoPosition.y, id, mascotType);
      Body.setStatic(body, true); // Static during birth animation
      World.add(currentEngine.world, body);

      // === IMPROVED LAUNCH TRAJECTORY CALCULATION ===

      // Calculate base direction (away from click)
      const dx = currentLogoPosition.x - clickX;
      const dy = currentLogoPosition.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Determine if click is on left or right of logo
      const clickOnLeft = clickX < currentLogoPosition.x;

      // Strong horizontal bias - launch in opposite direction of click with big arcs
      // If click is on left, launch right (positive X). If click is on right, launch left (negative X)
      const horizontalDirection = clickOnLeft ? 1 : -1;

      // Add some horizontal spread variation (±30 degrees = ±0.52 radians)
      const horizontalSpread = (Math.random() - 0.5) * 1.0;

      // Strong upward bias for nice arcs (30-50 degrees up = -0.52 to -0.87 radians)
      const upwardAngle = -0.52 - Math.random() * 0.35;

      // Calculate launch angle: start from horizontal direction, add upward bias and spread
      const baseAngle = horizontalDirection > 0 ? 0 : Math.PI; // 0 = right, PI = left
      const launchAngle = baseAngle + horizontalSpread + upwardAngle;

      // Map distance to force with MORE variation - increased base forces for bigger arcs
      const minDist = 50;
      const maxDist = 400;
      const baseMinForce = 0.025; // Increased from 0.02
      const baseMaxForce = 0.10;  // Increased from 0.08

      // Add random force variation (±40%)
      const forceVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

      const normalizedDist = Math.min(Math.max((distance - minDist) / (maxDist - minDist), 0), 1);
      const baseForceMagnitude = baseMaxForce - normalizedDist * (baseMaxForce - baseMinForce);
      const forceMagnitude = baseForceMagnitude * forceVariation;

      // Calculate launch impulse (will be applied after birth animation)
      const forceX = Math.cos(launchAngle) * forceMagnitude;
      const forceY = Math.sin(launchAngle) * forceMagnitude;

      // Random spin - clockwise or counter-clockwise with varying intensity
      const spinDirection = Math.random() > 0.5 ? 1 : -1;
      const spinMagnitude = 0.1 + Math.random() * 0.3; // Varying tumble intensity
      const spin = spinDirection * spinMagnitude;

      const newMascot: MascotBody = {
        id,
        body,
        state: "birthing", // Start in birthing state
        mascotType,
        mascotId: registryMascot.id, // Registry ID for expressive mascots
        bounceCount: 0,
        cardBounceCount: 0,
        createdAt: Date.now(),
        onCard: false,
        birthProgress: 0,
        birthStartTime: Date.now(),
        pendingLaunch: { forceX, forceY, spin },
      };

      // Track collisions - specifically card collisions
      const collisionStartHandler = (event: Matter.IEventCollision<Matter.Engine>) => {
        for (const pair of event.pairs) {
          if (pair.bodyA === body || pair.bodyB === body) {
            const otherBody = pair.bodyA === body ? pair.bodyB : pair.bodyA;
            if (otherBody.label?.startsWith("card-")) {
              newMascot.cardBounceCount++;
              newMascot.onCard = true;
            }
            if (otherBody.label === "wall") {
              newMascot.bounceCount++;
            }
          }
        }
      };

      // Track when mascot leaves a card
      const collisionEndHandler = (event: Matter.IEventCollision<Matter.Engine>) => {
        for (const pair of event.pairs) {
          if (pair.bodyA === body || pair.bodyB === body) {
            const otherBody = pair.bodyA === body ? pair.bodyB : pair.bodyA;
            if (otherBody.label?.startsWith("card-")) {
              newMascot.onCard = false;
            }
          }
        }
      };

      Events.on(currentEngine, "collisionStart", collisionStartHandler);
      Events.on(currentEngine, "collisionEnd", collisionEndHandler);

      setMascots((prev) => {
        // If at max, mark oldest for removal with animation
        let updated = [...prev, newMascot];
        if (updated.length > MAX_MASCOTS) {
          // Find oldest non-removing mascot
          const oldestIndex = updated.findIndex(m => !m.isRemoving);
          if (oldestIndex !== -1) {
            updated[oldestIndex] = { ...updated[oldestIndex], isRemoving: true };
            // Actually remove after animation completes
            const oldestId = updated[oldestIndex].id;
            setTimeout(() => {
              removeMascot(oldestId);
            }, 300); // Match animation duration
          }
        }
        return updated;
      });

      return newMascot;
    },
    [] // No dependencies - uses refs
  );

  const removeMascot = useCallback(
    (id: string) => {
      if (!engine) return;

      setMascots((prev) => {
        const mascot = prev.find((m) => m.id === id);
        if (mascot) {
          // Clear any hanging timeout
          const timeout = hangingTimeoutsRef.current.get(id);
          if (timeout) {
            clearTimeout(timeout);
            hangingTimeoutsRef.current.delete(id);
          }

          // Remove constraint if hanging
          if (mascot.hangingConstraint) {
            World.remove(engine.world, mascot.hangingConstraint);
          }

          // Remove body
          World.remove(engine.world, mascot.body);
        }
        return prev.filter((m) => m.id !== id);
      });
    },
    [engine]
  );

  const updateHanging = useCallback(() => {
    if (!engine || letterAnchors.length === 0) return;

    const currentHangingCount = mascotsRef.current.filter((m) => m.state === "hanging").length;

    for (const mascot of mascotsRef.current) {
      // Check for new hanging opportunity
      const anchor = checkForHangingOpportunity(
        mascot,
        letterAnchors,
        MAX_HANGING,
        currentHangingCount
      );

      if (anchor) {
        // Create constraint
        const constraint = createHangingConstraint(mascot.body, anchor.body, anchor.anchorPoint);
        World.add(engine.world, constraint);

        mascot.hangingConstraint = constraint;
        mascot.state = "hanging";
        anchor.occupied = true;

        // Schedule release after random time (3-6 seconds)
        const releaseTime = 3000 + Math.random() * 3000;
        const timeout = setTimeout(() => {
          releaseFromHanging(mascot, engine, letterAnchors);
          hangingTimeoutsRef.current.delete(mascot.id);
          // Force re-render
          setMascots((prev) => [...prev]);
        }, releaseTime);

        hangingTimeoutsRef.current.set(mascot.id, timeout);

        // Force re-render to update state
        setMascots((prev) => [...prev]);
      }
    }
  }, [engine, letterAnchors]);

  // Check for mascots that should stand up after landing on a card
  const updateStanding = useCallback(() => {
    let needsUpdate = false;

    for (const mascot of mascotsRef.current) {
      // Only check flying mascots that are currently on a card and have bounced on a card at least once
      if (mascot.state !== "flying" || !mascot.onCard || mascot.cardBounceCount < BOUNCES_TO_STAND) continue;

      const velocity = mascot.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

      // Check if mascot has slowed down enough to stand (must be on a card)
      if (speed < 2) {
        // Make the body static so it stays in place
        Body.setStatic(mascot.body, true);
        // Reset angle to upright
        Body.setAngle(mascot.body, 0);
        mascot.state = "standing";
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setMascots((prev) => [...prev]);
    }
  }, []);

  // Update birthing mascots - progress animation and launch when complete
  const updateBirthing = useCallback(() => {
    const currentEngine = engineRef.current;
    if (!currentEngine) return;

    let needsUpdate = false;
    const now = Date.now();

    for (const mascot of mascotsRef.current) {
      if (mascot.state !== "birthing" || !mascot.birthStartTime) continue;

      const elapsed = now - mascot.birthStartTime;
      const progress = Math.min(elapsed / BIRTH_DURATION, 1);

      mascot.birthProgress = progress;
      needsUpdate = true;

      // Birth animation complete - launch the mascot
      if (progress >= 1 && mascot.pendingLaunch) {
        // Play whoosh sound on launch
        playSound("whoosh");

        // Make body dynamic
        Body.setStatic(mascot.body, false);

        // Apply launch impulse
        Body.applyForce(mascot.body, mascot.body.position, {
          x: mascot.pendingLaunch.forceX,
          y: mascot.pendingLaunch.forceY,
        });

        // Apply spin
        Body.setAngularVelocity(mascot.body, mascot.pendingLaunch.spin);

        // Transition to flying state
        mascot.state = "flying";
        mascot.birthProgress = undefined;
        mascot.birthStartTime = undefined;
        mascot.pendingLaunch = undefined;
      }
    }

    if (needsUpdate) {
      setMascots((prev) => [...prev]);
    }
  }, []);

  const cleanupStale = useCallback(() => {
    for (const mascot of mascotsRef.current) {
      // Skip hanging, dragging, standing, birthing, or already removing mascots
      if (mascot.state === "hanging" || mascot.state === "dragging" || mascot.state === "standing" || mascot.state === "birthing" || mascot.isRemoving) continue;

      // Only remove if off screen (no time-based removal)
      const pos = mascot.body.position;
      const margin = 200;
      if (
        pos.x < -margin ||
        pos.x > window.innerWidth + margin ||
        pos.y > window.innerHeight + margin // Only check if fallen below or out sides
      ) {
        removeMascot(mascot.id);
      }
    }
  }, [removeMascot]);

  // Clear all mascots immediately (remove from physics world)
  const clearAllMascots = useCallback(() => {
    const currentEngine = engineRef.current;
    if (!currentEngine) return;

    // Remove all mascot bodies from physics world
    for (const mascot of mascotsRef.current) {
      World.remove(currentEngine.world, mascot.body);
      if (mascot.hangingConstraint) {
        World.remove(currentEngine.world, mascot.hangingConstraint);
      }
      // Clear any hanging timeout
      const timeout = hangingTimeoutsRef.current.get(mascot.id);
      if (timeout) {
        clearTimeout(timeout);
        hangingTimeoutsRef.current.delete(mascot.id);
      }
    }

    setMascots([]);
  }, []);

  // Make all mascots fly away upward
  const flyAwayAll = useCallback(() => {
    for (const mascot of mascotsRef.current) {
      if (mascot.isRemoving) continue;

      // If standing, make non-static first
      if (mascot.state === "standing") {
        Body.setStatic(mascot.body, false);
      }

      // Apply strong upward force with slight horizontal randomness
      const forceX = (Math.random() - 0.5) * 0.02;
      const forceY = -0.08 - Math.random() * 0.04; // Strong upward force
      Body.applyForce(mascot.body, mascot.body.position, { x: forceX, y: forceY });

      mascot.state = "flying";
    }

    // Trigger re-render
    setMascots((prev) => [...prev]);

    // Clear all mascots after they fly away (1 second delay)
    setTimeout(() => {
      clearAllMascots();
    }, 1000);
  }, [clearAllMascots]);

  // Knock over mascots standing on a specific card (when card is hovered)
  const knockOverOnCard = useCallback((cardIndex: number, cardRect: DOMRect) => {
    let needsUpdate = false;

    for (const mascot of mascotsRef.current) {
      if (mascot.state !== "standing" || mascot.isRemoving) continue;

      // Check if mascot is roughly on this card (within card bounds horizontally)
      const pos = mascot.body.position;
      const margin = 50; // Some tolerance

      if (
        pos.x >= cardRect.left - margin &&
        pos.x <= cardRect.right + margin &&
        pos.y >= cardRect.top - margin &&
        pos.y <= cardRect.bottom + margin
      ) {
        // Make non-static so physics takes over
        Body.setStatic(mascot.body, false);

        // Apply a small upward/sideways force to make them jump/tumble
        const forceX = (Math.random() - 0.5) * 0.015;
        const forceY = -0.02 - Math.random() * 0.01;
        Body.applyForce(mascot.body, mascot.body.position, { x: forceX, y: forceY });

        // Reset to flying so they can stand again
        mascot.state = "flying";
        mascot.cardBounceCount = 0; // Reset so they need to bounce again to stand
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setMascots((prev) => [...prev]);
    }
  }, []);

  return {
    mascots,
    spawnMascot,
    removeMascot,
    updateHanging,
    updateStanding,
    updateBirthing,
    cleanupStale,
    flyAwayAll,
    knockOverOnCard,
  };
}
