"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import { createPhysicsWorld, createWalls, runPhysicsLoop } from "@/lib/physics/world";

export function usePhysicsEngine() {
  const [engine, setEngine] = useState<Matter.Engine | null>(null);
  const wallsRef = useRef<Matter.Body[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);
  const updateCallbacksRef = useRef<Set<() => void>>(new Set());

  // Initialize physics world
  useEffect(() => {
    const { engine: newEngine } = createPhysicsWorld();
    setEngine(newEngine);

    // Create initial walls
    wallsRef.current = createWalls(
      newEngine,
      wallsRef.current,
      window.innerWidth,
      window.innerHeight
    );

    // Start physics loop
    cleanupRef.current = runPhysicsLoop(newEngine, () => {
      updateCallbacksRef.current.forEach((callback) => callback());
    });

    return () => {
      cleanupRef.current?.();
      Matter.Engine.clear(newEngine);
      Matter.World.clear(newEngine.world, false);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!engine) return;

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        wallsRef.current = createWalls(
          engine,
          wallsRef.current,
          window.innerWidth,
          window.innerHeight
        );
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [engine]);

  // Handle visibility change (pause when tab hidden)
  useEffect(() => {
    if (!engine) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        engine.timing.timeScale = 0;
      } else {
        engine.timing.timeScale = 1;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [engine]);

  const registerUpdateCallback = useCallback((callback: () => void) => {
    updateCallbacksRef.current.add(callback);
    return () => {
      updateCallbacksRef.current.delete(callback);
    };
  }, []);

  return { engine, registerUpdateCallback };
}
