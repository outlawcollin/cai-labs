"use client";

import { useRef, useState, useEffect, RefObject, useCallback } from "react";
import Matter from "matter-js";
import { usePhysicsEngine } from "@/hooks/usePhysicsEngine";
import { useMascotSpawner } from "@/hooks/useMascotSpawner";
import { useMouseInteraction } from "@/hooks/useMouseInteraction";
import { usePortalGame } from "@/hooks/usePortalGame";
import { LetterAnchor, MascotBody } from "@/lib/physics/bodies";
import { ExpressiveMascot } from "./ExpressiveMascot";
import { Portal, PORTAL_GRAVITY_RADIUS } from "@/components/Portal";
import { preloadMascotAssets } from "@/lib/mascots/registry";

const { Bodies, Body, World, Events } = Matter;

interface MascotOverlayProps {
  logoPosition: { x: number; y: number } | null;
  titleRef: RefObject<HTMLHeadingElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  onSpawnerReady?: (spawnFn: (x: number, y: number) => void) => void;
  onCardHit?: (cardIndex: number) => void;
  isHeroState?: boolean;
  onFlyAwayReady?: (flyAwayFn: () => void) => void;
  onKnockOverReady?: (knockOverFn: (cardIndex: number, cardRect: DOMRect) => void) => void;
  onRespawnReady?: (respawnFn: () => void) => void;
  onPortalStateChange?: (isActive: boolean) => void;
  onTriggerLogoAnimation?: () => void;
  introComplete?: boolean;
}

export function MascotOverlay({ logoPosition, titleRef, cardRefs, onSpawnerReady, onCardHit, isHeroState = true, onFlyAwayReady, onKnockOverReady, onRespawnReady, onPortalStateChange, onTriggerLogoAnimation, introComplete = false }: MascotOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [letterAnchors] = useState<LetterAnchor[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const initialSpawnDone = useRef(false);
  const staticBodiesRef = useRef<Matter.Body[]>([]);
  const bodiesCreatedRef = useRef(false);
  const onCardHitRef = useRef(onCardHit);
  onCardHitRef.current = onCardHit;
  const onFlyAwayReadyRef = useRef(onFlyAwayReady);
  onFlyAwayReadyRef.current = onFlyAwayReady;
  const onKnockOverReadyRef = useRef(onKnockOverReady);
  onKnockOverReadyRef.current = onKnockOverReady;
  const onRespawnReadyRef = useRef(onRespawnReady);
  onRespawnReadyRef.current = onRespawnReady;
  const onPortalStateChangeRef = useRef(onPortalStateChange);
  onPortalStateChangeRef.current = onPortalStateChange;
  const onTriggerLogoAnimationRef = useRef(onTriggerLogoAnimation);
  onTriggerLogoAnimationRef.current = onTriggerLogoAnimation;

  const { engine, registerUpdateCallback } = usePhysicsEngine();

  // Preload mascot assets on mount
  useEffect(() => {
    preloadMascotAssets();
  }, []);

  // Track mouse position for eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const { mascots, spawnMascot, updateHanging, updateStanding, updateBirthing, cleanupStale, flyAwayAll, knockOverOnCard, removeMascot } = useMascotSpawner({
    engine,
    logoPosition,
    letterAnchors,
  });

  // Custom drag state management
  const [draggedMascotId, setDraggedMascotId] = useState<string | null>(null);
  const draggedMascotRef = useRef<MascotBody | null>(null);

  // Portal game integration
  const {
    portalState,
    consumingMascots,
    onMascotGrabbed,
    applyPortalGravity,
    completeMascotConsumption,
  } = usePortalGame({
    engine,
    mascots,
    onMascotConsumed: removeMascot,
    isDragging: draggedMascotId !== null,
  });

  // Handle drag start for a mascot
  const handleDragStart = useCallback((mascot: MascotBody, grabPosition: { x: number; y: number }) => {
    if (!engine) return;

    // Make the body static while dragging so gravity doesn't affect it
    // We'll move it manually in handleDragMove
    Body.setStatic(mascot.body, true);
    Body.setAngle(mascot.body, 0); // Reset rotation when picked up

    mascot.state = "dragging";
    draggedMascotRef.current = mascot;
    setDraggedMascotId(mascot.id);

    // Trigger portal spawn
    onMascotGrabbed(grabPosition);
  }, [engine, onMascotGrabbed]);

  // Handle drag move - update physics body position with portal pull effect
  const handleDragMove = useCallback((x: number, y: number) => {
    if (!draggedMascotRef.current) return;

    const body = draggedMascotRef.current.body;

    // Check if portal is active and apply pull effect
    if (portalState.active && portalState.position) {
      const dx = portalState.position.x - x;
      const dy = portalState.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Apply pull when within gravity radius
      if (distance < PORTAL_GRAVITY_RADIUS && distance > 10) {
        // Stronger pull as mascot gets closer (quadratic falloff)
        const intensity = 1 - (distance / PORTAL_GRAVITY_RADIUS);
        const pullStrength = intensity * intensity * 0.7; // Max 70% pull toward portal (was 40%)

        // Offset position toward portal
        const offsetX = dx * pullStrength;
        const offsetY = dy * pullStrength;

        // Also offset cursor position slightly toward portal for visual warping
        const cursorOffsetX = dx * intensity * 0.15;
        const cursorOffsetY = dy * intensity * 0.15;

        // Also add slight rotation toward portal
        const angleToPortal = Math.atan2(dy, dx);
        Body.setAngle(body, angleToPortal * intensity * 0.3);

        Body.setPosition(body, { x: x + offsetX + cursorOffsetX, y: y + offsetY + cursorOffsetY });
        return;
      }
    }

    // No portal pull - move to cursor position directly
    Body.setPosition(body, { x, y });
  }, [portalState.active, portalState.position]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!draggedMascotRef.current) return;

    const mascot = draggedMascotRef.current;

    // Reset angle to upright when released
    Body.setAngle(mascot.body, 0);
    // Make the body non-static so physics takes over again
    Body.setStatic(mascot.body, false);
    // Give a tiny downward velocity so it starts falling naturally
    Body.setVelocity(mascot.body, { x: 0, y: 2 });

    mascot.state = "flying";
    mascot.cardBounceCount = 0; // Reset so they can stand again
    draggedMascotRef.current = null;
    setDraggedMascotId(null);
  }, []);

  // Listen for card collisions to trigger bounce animation
  useEffect(() => {
    if (!engine) return;

    const handleCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];

        // Check if one is a mascot and one is a card
        const cardLabel = labels.find(l => l?.startsWith("card-"));
        const mascotLabel = labels.find(l => l?.startsWith("mascot-"));

        if (cardLabel && mascotLabel) {
          const cardIndex = parseInt(cardLabel.replace("card-", ""), 10);
          if (!isNaN(cardIndex) && onCardHitRef.current) {
            onCardHitRef.current(cardIndex);
          }
        }
      }
    };

    Events.on(engine, "collisionStart", handleCollision);
    return () => {
      Events.off(engine, "collisionStart", handleCollision);
    };
  }, [engine]);

  const { applyRepulsion } = useMouseInteraction({
    engine,
    mascots,
    letterAnchors,
    containerRef,
  });

  // Create static physics bodies for title and cards
  // Only create after intro completes so cards are in their final positions
  useEffect(() => {
    if (!engine || !introComplete || bodiesCreatedRef.current) return;

    const createStaticBodies = () => {
      // Remove any existing static bodies
      if (staticBodiesRef.current.length > 0) {
        World.remove(engine.world, staticBodiesRef.current);
        staticBodiesRef.current = [];
      }

      const bodies: Matter.Body[] = [];

      // Create bodies for cards
      if (cardRefs.current) {
        cardRefs.current.forEach((cardEl, index) => {
          if (!cardEl) return;

          const rect = cardEl.getBoundingClientRect();
          // Get the computed transform to extract rotation
          const style = window.getComputedStyle(cardEl);
          const transform = style.transform;
          let angle = 0;

          if (transform && transform !== "none") {
            const values = transform.match(/matrix\(([^)]+)\)/);
            if (values) {
              const parts = values[1].split(", ");
              angle = Math.atan2(parseFloat(parts[1]), parseFloat(parts[0]));
            }
          }

          const cardBody = Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            {
              isStatic: true,
              angle,
              label: `card-${index}`,
              restitution: 0.6,
              friction: 0.1,
              chamfer: { radius: 16 },
            }
          );
          bodies.push(cardBody);
        });
      }

      if (bodies.length > 0) {
        World.add(engine.world, bodies);
        staticBodiesRef.current = bodies;
        bodiesCreatedRef.current = true;
      }
    };

    // Wait for cards to fully settle into position after intro completes
    // Using 600ms to ensure card entrance animations are complete
    const timer = setTimeout(createStaticBodies, 600);
    return () => clearTimeout(timer);
  }, [engine, introComplete, cardRefs]);

  // Update static bodies on scroll (cards move)
  useEffect(() => {
    if (!engine || !bodiesCreatedRef.current) return;

    const updateStaticBodies = () => {
      // Remove old bodies
      if (staticBodiesRef.current.length > 0) {
        World.remove(engine.world, staticBodiesRef.current);
        staticBodiesRef.current = [];
      }

      const bodies: Matter.Body[] = [];

      // Recreate card bodies
      if (cardRefs.current) {
        cardRefs.current.forEach((cardEl, index) => {
          if (!cardEl) return;

          const rect = cardEl.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const style = window.getComputedStyle(cardEl);
          const transform = style.transform;
          let angle = 0;

          if (transform && transform !== "none") {
            const values = transform.match(/matrix\(([^)]+)\)/);
            if (values) {
              const parts = values[1].split(", ");
              angle = Math.atan2(parseFloat(parts[1]), parseFloat(parts[0]));
            }
          }

          const cardBody = Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            {
              isStatic: true,
              angle,
              label: `card-${index}`,
              restitution: 0.6,
              friction: 0.1,
              chamfer: { radius: 16 },
            }
          );
          bodies.push(cardBody);
        });
      }

      if (bodies.length > 0) {
        World.add(engine.world, bodies);
        staticBodiesRef.current = bodies;
      }
    };

    // Update on scroll
    const handleScroll = () => {
      requestAnimationFrame(updateStaticBodies);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [engine, introComplete, cardRefs]);

  // Mark as ready when engine and logo position are available
  useEffect(() => {
    if (engine && logoPosition) {
      setIsReady(true);
    }
  }, [engine, logoPosition]);

  // Expose spawn function to parent
  useEffect(() => {
    if (isReady && onSpawnerReady) {
      onSpawnerReady(spawnMascot);
    }
  }, [isReady, onSpawnerReady, spawnMascot]);

  // Expose fly away function to parent
  useEffect(() => {
    if (isReady && onFlyAwayReadyRef.current) {
      onFlyAwayReadyRef.current(flyAwayAll);
    }
  }, [isReady, flyAwayAll]);

  // Expose knock over function to parent
  useEffect(() => {
    if (isReady && onKnockOverReadyRef.current) {
      onKnockOverReadyRef.current(knockOverOnCard);
    }
  }, [isReady, knockOverOnCard]);

  // Notify parent when portal state changes
  useEffect(() => {
    if (onPortalStateChangeRef.current) {
      onPortalStateChangeRef.current(portalState.active);
    }
  }, [portalState.active]);

  // Function to spawn mascots with delays (used for initial and respawn)
  const spawnMascotsWithDelay = useCallback(async () => {
    const numMascots = 5;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < numMascots; i++) {
      const angle = (i / numMascots) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 300 + Math.random() * 200;
      const clickX = centerX + Math.cos(angle) * radius;
      const clickY = centerY + Math.sin(angle) * radius;

      // Trigger logo animation before each spawn
      onTriggerLogoAnimationRef.current?.();

      spawnMascot(clickX, clickY);

      // Longer delay between spawns (300-450ms)
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 150));
    }
  }, [spawnMascot]);

  // Expose respawn function to parent
  useEffect(() => {
    if (isReady && onRespawnReadyRef.current) {
      onRespawnReadyRef.current(spawnMascotsWithDelay);
    }
  }, [isReady, spawnMascotsWithDelay]);

  // Initial spawn of 5 mascots when ready AND intro is complete
  useEffect(() => {
    if (!isReady || !introComplete || initialSpawnDone.current) return;
    initialSpawnDone.current = true;

    // Small delay after intro completes before spawning
    setTimeout(spawnMascotsWithDelay, 300);
  }, [isReady, introComplete, spawnMascotsWithDelay]);

  // Register physics update callbacks
  useEffect(() => {
    const unsubscribe = registerUpdateCallback(() => {
      applyRepulsion();
      applyPortalGravity();
      updateHanging();
      updateStanding();
      updateBirthing();
    });
    return unsubscribe;
  }, [registerUpdateCallback, applyRepulsion, applyPortalGravity, updateHanging, updateStanding, updateBirthing]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(cleanupStale, 1000);
    return () => clearInterval(interval);
  }, [cleanupStale]);

  // Helper to check if a mascot is being consumed
  const getConsumingState = (mascotId: string) => {
    return consumingMascots.find((m) => m.mascotId === mascotId);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 60 }}
    >
      {/* Portal */}
      {portalState.active && portalState.position && (
        <Portal
          position={portalState.position}
          remaining={portalState.remaining}
          isConsuming={portalState.isConsuming}
          isCompleting={portalState.isCompleting}
          isClosing={portalState.isClosing}
          isFading={portalState.isFading}
        />
      )}

      {/* Mascots */}
      {mascots.map((mascot) => {
        const consumingState = getConsumingState(mascot.id);
        const isBeingConsumed = !!consumingState;

        return (
          <ExpressiveMascot
            key={mascot.id}
            mascotData={mascot}
            mousePosition={mousePosition}
            isBeingDragged={draggedMascotId === mascot.id}
            isBeingConsumed={isBeingConsumed}
            consumeTarget={portalState.position || undefined}
            onConsumeComplete={() => completeMascotConsumption(mascot.id)}
            onDragStart={(e: { clientX: number; clientY: number }) => {
              handleDragStart(mascot, { x: e.clientX, y: e.clientY });
            }}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
          />
        );
      })}
    </div>
  );
}
