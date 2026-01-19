"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { MascotBody } from "@/lib/physics/bodies";

// Available mascot images
const mascotImages = [
  "/mascots/mascot-03.png", // Green dinosaur
  "/mascots/mascot-21.png", // Yellow bird
  "/mascots/mascot-11.png", // Pink cat
  "/mascots/mascot-02.png", // Purple cat
  "/mascots/mascot-22.png", // Green bear
  "/mascots/mascot-05.png", // Yellow blob
];

interface MascotProps {
  mascotData: MascotBody;
  onPositionUpdate?: () => void;
}

export function Mascot({ mascotData }: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef({ x: 0, y: 0, angle: 0 });
  const [hoverTilt, setHoverTilt] = useState(0);

  // Handle mouse move for tilt effect on standing mascots
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (mascotData.state !== "standing" || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;

    // Calculate tilt based on mouse position relative to center
    const offset = mouseX - centerX;
    const maxTilt = 15; // Maximum tilt in degrees
    const tilt = (offset / (rect.width / 2)) * maxTilt;
    setHoverTilt(Math.max(-maxTilt, Math.min(maxTilt, tilt)));
  }, [mascotData.state]);

  const handleMouseLeave = useCallback(() => {
    setHoverTilt(0);
  }, []);

  useEffect(() => {
    let animationId: number;

    const updatePosition = () => {
      if (!containerRef.current || !mascotData.body) return;

      const { x, y } = mascotData.body.position;
      const angle = mascotData.body.angle;

      // Only update DOM if position changed significantly
      const last = lastUpdateRef.current;
      if (
        Math.abs(x - last.x) > 0.1 ||
        Math.abs(y - last.y) > 0.1 ||
        Math.abs(angle - last.angle) > 0.01
      ) {
        containerRef.current.style.transform = `translate(${x - 35}px, ${y - 35}px) rotate(${angle}rad)`;
        lastUpdateRef.current = { x, y, angle };
      }

      animationId = requestAnimationFrame(updatePosition);
    };

    animationId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mascotData.body]);

  const mascotImage = mascotImages[mascotData.mascotType % mascotImages.length];

  const isStanding = mascotData.state === "standing";
  const isRemoving = mascotData.isRemoving;

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{
        width: 70,
        height: 70,
        willChange: "transform",
        // Smooth transition when standing up
        transition: isStanding ? "transform 0.3s ease-out" : mascotData.state === "hanging" ? "none" : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={imageRef}
        style={{
          transform: isRemoving
            ? "scale(0)"
            : isStanding
              ? `rotate(${hoverTilt}deg)`
              : undefined,
          transition: isRemoving
            ? "transform 0.3s cubic-bezier(0.5, -0.5, 0.7, 0.2)"
            : "transform 0.15s ease-out",
          transformOrigin: isStanding ? "center bottom" : "center center",
        }}
      >
        <Image
          src={mascotImage}
          alt="Mascot"
          width={70}
          height={70}
          className="w-full h-full object-contain select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}

export function getMascotTypeCount(): number {
  return mascotImages.length;
}
