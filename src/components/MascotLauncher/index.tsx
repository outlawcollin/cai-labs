"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { usePhysicsEngine } from "@/hooks/usePhysicsEngine";
import { useMascotSpawner } from "@/hooks/useMascotSpawner";
import { useMouseInteraction } from "@/hooks/useMouseInteraction";
import { LetterAnchor } from "@/lib/physics/bodies";
import { Logo } from "./Logo";
import { Cards } from "./Cards";
import { Mascot } from "./Mascot";

export function MascotLauncher() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [letterAnchors, setLetterAnchors] = useState<LetterAnchor[]>([]);
  const [logoPosition, setLogoPosition] = useState<{ x: number; y: number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initialSpawnDone = useRef(false);

  const { engine, registerUpdateCallback } = usePhysicsEngine();

  const { mascots, spawnMascot, updateHanging, cleanupStale } = useMascotSpawner({
    engine,
    logoPosition,
    letterAnchors,
  });

  const { applyRepulsion } = useMouseInteraction({
    engine,
    mascots,
    letterAnchors,
    containerRef,
  });

  // Mark as ready when engine and logo position are available
  useEffect(() => {
    if (engine && logoPosition) {
      setIsReady(true);
    }
  }, [engine, logoPosition]);

  // Initial spawn of 4-5 mascots when ready
  useEffect(() => {
    if (!isReady || initialSpawnDone.current) return;
    initialSpawnDone.current = true;

    // Spawn 5 mascots with staggered timing
    const spawnInitialMascots = async () => {
      const numMascots = 5;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < numMascots; i++) {
        // Random click position around the screen edges
        const angle = (i / numMascots) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 300 + Math.random() * 200;
        const clickX = centerX + Math.cos(angle) * radius;
        const clickY = centerY + Math.sin(angle) * radius;

        spawnMascot(clickX, clickY);

        // Wait before spawning next one
        await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 100));
      }
    };

    // Small delay to let everything settle
    setTimeout(spawnInitialMascots, 300);
  }, [isReady, spawnMascot]);

  // Register physics update callbacks
  useEffect(() => {
    const unsubscribe = registerUpdateCallback(() => {
      applyRepulsion();
      updateHanging();
    });
    return unsubscribe;
  }, [registerUpdateCallback, applyRepulsion, updateHanging]);

  // Periodic cleanup of stale mascots
  useEffect(() => {
    const interval = setInterval(cleanupStale, 1000);
    return () => clearInterval(interval);
  }, [cleanupStale]);

  // Handle click to spawn mascot
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isReady) return;

      // Don't spawn if clicking on a card button or other interactive element
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.closest("button")) return;

      spawnMascot(e.clientX, e.clientY);
    },
    [spawnMascot, isReady]
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden cursor-crosshair"
      style={{ background: "var(--color-background)" }}
      onClick={handleClick}
    >
      {/* Logo with letter anchors for hanging */}
      <Logo
        engine={engine}
        onAnchorsReady={setLetterAnchors}
        onLogoPositionReady={setLogoPosition}
      />

      {/* Mascots layer */}
      <div className="absolute inset-0 pointer-events-none">
        {mascots.map((mascot) => (
          <Mascot key={mascot.id} mascotData={mascot} />
        ))}
      </div>

      {/* Cards at bottom */}
      <Cards engine={engine} />

      {/* Click hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-[var(--color-primary)]/50 pointer-events-none">
        Click anywhere to spawn mascots
      </div>
    </div>
  );
}

export default MascotLauncher;
