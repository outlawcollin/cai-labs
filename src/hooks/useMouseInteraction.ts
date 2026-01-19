"use client";

import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { MascotBody, LetterAnchor } from "@/lib/physics/bodies";
import { releaseFromHanging } from "@/lib/physics/constraints";

const { Body, Mouse, MouseConstraint, World } = Matter;

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
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const draggedMascotRef = useRef<MascotBody | null>(null);
  const mascotsRef = useRef(mascots);

  // Keep mascots ref updated
  mascotsRef.current = mascots;

  // Setup mouse constraint for dragging
  useEffect(() => {
    if (!engine || !containerRef.current) return;

    const mouse = Mouse.create(containerRef.current);

    // Fix mouse position scaling for high DPI displays
    mouse.pixelRatio = window.devicePixelRatio || 1;

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.3,
        render: { visible: false },
      },
    });

    mouseConstraintRef.current = mouseConstraint;
    World.add(engine.world, mouseConstraint);

    // Handle drag start
    Matter.Events.on(mouseConstraint, "startdrag", (event) => {
      const body = (event as unknown as { body?: Matter.Body }).body;
      if (body?.label?.startsWith("mascot-")) {
        const mascotId = body.label.replace("mascot-", "");
        const mascot = mascotsRef.current.find((m) => m.id === mascotId);
        if (mascot) {
          // Release from hanging if needed
          if (mascot.state === "hanging") {
            releaseFromHanging(mascot, engine, letterAnchors);
          }
          mascot.state = "dragging";
          draggedMascotRef.current = mascot;
        }
      }
    });

    // Handle drag end
    Matter.Events.on(mouseConstraint, "enddrag", () => {
      if (draggedMascotRef.current) {
        draggedMascotRef.current.state = "flying";
        draggedMascotRef.current = null;
      }
    });

    return () => {
      World.remove(engine.world, mouseConstraint);
      mouseConstraintRef.current = null;
    };
  }, [engine, containerRef, letterAnchors]);

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
