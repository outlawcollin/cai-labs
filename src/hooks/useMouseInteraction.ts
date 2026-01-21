"use client";

import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { MascotBody, LetterAnchor } from "@/lib/physics/bodies";

const { Body } = Matter;

interface MouseInteractionConfig {
  engine: Matter.Engine | null;
  mascots: MascotBody[];
  letterAnchors: LetterAnchor[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useMouseInteraction({
  engine,
  mascots,
  letterAnchors,
  containerRef,
}: MouseInteractionConfig) {
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const mascotsRef = useRef(mascots);

  // Keep mascots ref updated
  mascotsRef.current = mascots;

  // Track mouse position for repulsion effect
  useEffect(() => {
    let lastUpdate = 0;
    const throttleMs = 16; // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate < throttleMs) return;
      lastUpdate = now;

      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Apply repulsion force to nearby mascots
  const applyRepulsion = useCallback(() => {
    const mousePos = mousePositionRef.current;
    const repelRadius = 100;
    const maxForce = 0.002;

    for (const mascot of mascotsRef.current) {
      // Skip if hanging or being dragged
      if (mascot.state === "hanging" || mascot.state === "dragging") continue;

      const bodyPos = mascot.body.position;
      const dx = bodyPos.x - mousePos.x;
      const dy = bodyPos.y - mousePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < repelRadius && distance > 0) {
        // Normalize direction
        const nx = dx / distance;
        const ny = dy / distance;

        // Force falls off with distance
        const forceMagnitude = ((repelRadius - distance) / repelRadius) * maxForce;

        Body.applyForce(mascot.body, bodyPos, {
          x: nx * forceMagnitude,
          y: ny * forceMagnitude,
        });
      }
    }
  }, []);

  return { applyRepulsion, mousePositionRef };
}
