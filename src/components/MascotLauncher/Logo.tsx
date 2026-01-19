"use client";

import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { createLetterBody, LetterAnchor } from "@/lib/physics/bodies";

const { World } = Matter;

interface LogoProps {
  engine: Matter.Engine | null;
  onAnchorsReady: (anchors: LetterAnchor[]) => void;
  onLogoPositionReady: (position: { x: number; y: number }) => void;
}

export function Logo({ engine, onAnchorsReady, onLogoPositionReady }: LogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bodiesCreated = useRef(false);

  const letters = useRef([
    { char: "(", group: "cai" },
    { char: "c", group: "cai" },
    { char: ".", group: "cai" },
    { char: "a", group: "cai" },
    { char: "i", group: "cai" },
    { char: ")", group: "cai" },
    { char: " ", group: "space" },
    { char: "l", group: "labs" },
    { char: "a", group: "labs" },
    { char: "b", group: "labs" },
    { char: "s", group: "labs" },
  ]).current;

  const createLetterBodies = useCallback(() => {
    if (!engine || !containerRef.current || bodiesCreated.current) return;

    const anchors: LetterAnchor[] = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate logo center for spawn position
    const logoCenterX = containerRect.left + containerRect.width / 2;
    const logoCenterY = containerRect.top + containerRect.height / 2;
    onLogoPositionReady({ x: logoCenterX, y: logoCenterY });

    letterRefs.current.forEach((letterEl, index) => {
      if (!letterEl || letters[index].char === " ") return;

      const rect = letterEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const body = createLetterBody(
        centerX,
        centerY,
        rect.width,
        rect.height,
        `letter-${index}`
      );

      World.add(engine.world, body);

      // Create anchor point at bottom center of letter
      anchors.push({
        letterId: `${index}`,
        body,
        anchorPoint: { x: 0, y: rect.height / 2 + 5 },
        occupied: false,
      });
    });

    bodiesCreated.current = true;
    onAnchorsReady(anchors);
  }, [engine, onAnchorsReady, onLogoPositionReady, letters]);

  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(createLetterBodies, 100);
    return () => clearTimeout(timer);
  }, [createLetterBodies]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      bodiesCreated.current = false;
      // Re-create on next frame
      setTimeout(createLetterBodies, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [createLetterBodies]);

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-none"
      style={{ top: "12%" }}
    >
      <div className="text-[48px] font-black tracking-tight">
        {letters.map((letter, index) => (
          <span
            key={index}
            ref={(el) => { letterRefs.current[index] = el; }}
            className={`inline-block ${
              letter.group === "cai"
                ? "text-[var(--color-primary)]"
                : letter.group === "labs"
                ? "text-[var(--color-primary)]"
                : ""
            }`}
            style={{
              opacity: letter.char === " " ? 0 : 1,
              width: letter.char === " " ? "0.3em" : "auto",
            }}
          >
            {letter.char}
          </span>
        ))}
      </div>
    </div>
  );
}
