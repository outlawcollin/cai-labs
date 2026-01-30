"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { getMascot } from "@/lib/mascots/registry";
import { useEyeTracking } from "@/hooks/useEyeTracking";

interface StaticMascotProps {
  mascotId: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function StaticMascot({
  mascotId,
  size = 70,
  style,
}: StaticMascotProps) {
  const assets = getMascot(mascotId);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const { updateEyeOffset } = useEyeTracking({
    maxOffset: assets?.config.eyeOffsetMax ?? 5,
    trackingRadius: 300,
    lerpFactor: 0.15,
  });

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // RAF loop for eye updates
  const tick = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const offset = updateEyeOffset(center, mouseRef.current);
      setEyeOffset({ x: offset.x, y: offset.y });
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [updateEyeOffset]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // Random blinking
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 2000;
      timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 100);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  if (!assets) return null;

  const eyeSrc = isBlinking ? assets.eyes.blink : assets.eyes.neutral;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none"
      style={{
        width: size,
        height: size,
        ...style,
      }}
    >
      {/* Base */}
      <Image
        src={assets.base}
        alt={assets.name}
        width={size * 2}
        height={size * 2}
        className="absolute inset-0 w-full h-full object-contain"
        sizes={`${size}px`}
      />
      {/* Eyes */}
      <Image
        src={eyeSrc}
        alt=""
        width={size * 2}
        height={size * 2}
        className="absolute inset-0 w-full h-full object-contain"
        sizes={`${size}px`}
        style={{
          transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
        }}
      />
    </div>
  );
}
