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

const { World, Body, Events } = Matter;

const MAX_MASCOTS = 30;
const MAX_HANGING = 2;
const BOUNCES_TO_STAND = 1; // Number of bounces before standing up

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

      // Create physics body at logo position
      const body = createMascotBody(currentLogoPosition.x, currentLogoPosition.y, id, mascotType);
      World.add(currentEngine.world, body);

      // Calculate launch direction (away from click)
      const dx = currentLogoPosition.x - clickX;
      const dy = currentLogoPosition.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Normalize and add random variation
      const angleVariation = (Math.random() - 0.5) * 0.7; // ±20 degrees in radians
      const baseAngle = Math.atan2(dy, dx);
      const launchAngle = baseAngle + angleVariation;

      // Map distance to force (closer = stronger)
      const minDist = 50;
      const maxDist = 400;
      const minForce = 0.025;
      const maxForce = 0.06;
      const normalizedDist = Math.min(Math.max((distance - minDist) / (maxDist - minDist), 0), 1);
      const forceMagnitude = maxForce - normalizedDist * (maxForce - minForce);

      // Apply launch impulse
      const forceX = Math.cos(launchAngle) * forceMagnitude;
      const forceY = Math.sin(launchAngle) * forceMagnitude;
      Body.applyForce(body, body.position, { x: forceX, y: forceY });

      const newMascot: MascotBody = {
        id,
        body,
        state: "flying",
        mascotType,
        bounceCount: 0,
        cardBounceCount: 0,
        createdAt: Date.now(),
        onCard: false,
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

  const cleanupStale = useCallback(() => {
    for (const mascot of mascotsRef.current) {
      // Skip hanging, dragging, standing, or already removing mascots
      if (mascot.state === "hanging" || mascot.state === "dragging" || mascot.state === "standing" || mascot.isRemoving) continue;

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
  }, []);

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
    cleanupStale,
    flyAwayAll,
    knockOverOnCard,
  };
}
