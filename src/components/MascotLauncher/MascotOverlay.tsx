"use client";

import { useRef, useState, useEffect, RefObject } from "react";
import Matter from "matter-js";
import { usePhysicsEngine } from "@/hooks/usePhysicsEngine";
import { useMascotSpawner } from "@/hooks/useMascotSpawner";
import { useMouseInteraction } from "@/hooks/useMouseInteraction";
import { LetterAnchor } from "@/lib/physics/bodies";
import { Mascot } from "./Mascot";

const { Bodies, World, Events } = Matter;

interface MascotOverlayProps {
  logoPosition: { x: number; y: number } | null;
  titleRef: RefObject<HTMLHeadingElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  onSpawnerReady?: (spawnFn: (x: number, y: number) => void) => void;
  onCardHit?: (cardIndex: number) => void;
  isHeroState?: boolean;
  onFlyAwayReady?: (flyAwayFn: () => void) => void;
  onKnockOverReady?: (knockOverFn: (cardIndex: number, cardRect: DOMRect) => void) => void;
}

export function MascotOverlay({ logoPosition, titleRef, cardRefs, onSpawnerReady, onCardHit, isHeroState = true, onFlyAwayReady, onKnockOverReady }: MascotOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [letterAnchors] = useState<LetterAnchor[]>([]);
  const [isReady, setIsReady] = useState(false);
  const initialSpawnDone = useRef(false);
  const staticBodiesRef = useRef<Matter.Body[]>([]);
  const bodiesCreatedRef = useRef(false);
  const onCardHitRef = useRef(onCardHit);
  onCardHitRef.current = onCardHit;
  const onFlyAwayReadyRef = useRef(onFlyAwayReady);
  onFlyAwayReadyRef.current = onFlyAwayReady;
  const onKnockOverReadyRef = useRef(onKnockOverReady);
  onKnockOverReadyRef.current = onKnockOverReady;

  const { engine, registerUpdateCallback } = usePhysicsEngine();

  const { mascots, spawnMascot, updateHanging, updateStanding, cleanupStale, flyAwayAll, knockOverOnCard } = useMascotSpawner({
    engine,
    logoPosition,
    letterAnchors,
  });

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
  // Delay creation to allow initial mascot spawn to escape
  useEffect(() => {
    if (!engine || bodiesCreatedRef.current) return;

    const createStaticBodies = () => {
      // Remove any existing static bodies
      if (staticBodiesRef.current.length > 0) {
        World.remove(engine.world, staticBodiesRef.current);
        staticBodiesRef.current = [];
      }

      const bodies: Matter.Body[] = [];

      // Title body disabled for now - was blocking mascots
      // if (titleRef.current) {
      //   const rect = titleRef.current.getBoundingClientRect();
      //   const titleBody = Bodies.rectangle(
      //     rect.left + rect.width / 2,
      //     rect.top + rect.height / 2,
      //     rect.width,
      //     rect.height * 0.6,
      //     {
      //       isStatic: true,
      //       label: "title",
      //       restitution: 0.7,
      //       friction: 0.05,
      //     }
      //   );
      //   bodies.push(titleBody);
      // }

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

    // Wait for DOM elements to be ready
    const timer = setTimeout(createStaticBodies, 300);
    return () => clearTimeout(timer);
  }, [engine, titleRef, cardRefs]);

  // Update static bodies on scroll (cards move)
  useEffect(() => {
    if (!engine) return;

    const updateStaticBodies = () => {
      // Remove old bodies
      if (staticBodiesRef.current.length > 0) {
        World.remove(engine.world, staticBodiesRef.current);
        staticBodiesRef.current = [];
      }

      const bodies: Matter.Body[] = [];

      // Title body disabled for now
      // if (titleRef.current) {
      //   const rect = titleRef.current.getBoundingClientRect();
      //   if (rect.width > 0 && rect.height > 0) {
      //     const titleBody = Bodies.rectangle(
      //       rect.left + rect.width / 2,
      //       rect.top + rect.height / 2,
      //       rect.width,
      //       rect.height * 0.6,
      //       {
      //         isStatic: true,
      //         label: "title",
      //         restitution: 0.7,
      //         friction: 0.05,
      //       }
      //     );
      //     bodies.push(titleBody);
      //   }
      // }

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
  }, [engine, titleRef, cardRefs]);

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

  // Initial spawn of 5 mascots when ready
  useEffect(() => {
    if (!isReady || initialSpawnDone.current) return;
    initialSpawnDone.current = true;

    const spawnInitialMascots = async () => {
      const numMascots = 5;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < numMascots; i++) {
        const angle = (i / numMascots) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 300 + Math.random() * 200;
        const clickX = centerX + Math.cos(angle) * radius;
        const clickY = centerY + Math.sin(angle) * radius;

        spawnMascot(clickX, clickY);

        await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 100));
      }
    };

    setTimeout(spawnInitialMascots, 500);
  }, [isReady, spawnMascot]);

  // Register physics update callbacks
  useEffect(() => {
    const unsubscribe = registerUpdateCallback(() => {
      applyRepulsion();
      updateHanging();
      updateStanding();
    });
    return unsubscribe;
  }, [registerUpdateCallback, applyRepulsion, updateHanging, updateStanding]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(cleanupStale, 1000);
    return () => clearInterval(interval);
  }, [cleanupStale]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 60 }}
    >
      {mascots.map((mascot) => (
        <Mascot key={mascot.id} mascotData={mascot} />
      ))}
    </div>
  );
}
