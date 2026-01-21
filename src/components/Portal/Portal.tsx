"use client";

import { useEffect, useRef, useState } from "react";
import { PortalProps, PORTAL_SIZE } from "./types";

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
}

export function Portal({
  position,
  remaining,
  isConsuming,
  isCompleting,
  isClosing,
  isFading,
}: PortalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [isBouncing, setIsBouncing] = useState(false);
  const prevRemainingRef = useRef(remaining);

  // Counter bounce effect when remaining changes
  useEffect(() => {
    if (remaining !== prevRemainingRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      prevRemainingRef.current = remaining;
      return () => clearTimeout(timer);
    }
  }, [remaining]);

  // Swirl animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    function drawSwirl() {
      if (!ctx) return;

      ctx.clearRect(0, 0, PORTAL_SIZE, PORTAL_SIZE);

      const centerX = PORTAL_SIZE / 2;
      const centerY = PORTAL_SIZE / 2;

      // Draw spiral arms
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Multiple spiral arms with gradient opacity
      for (let arm = 0; arm < 4; arm++) {
        ctx.rotate(Math.PI / 2);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(147, 112, 219, ${0.6 - arm * 0.1})`;
        ctx.lineWidth = 3 - arm * 0.5;

        // Draw spiral
        for (let i = 0; i < 100; i++) {
          const angle = (i / 100) * Math.PI * 2;
          const radius = (i / 100) * (PORTAL_SIZE / 2 - 10);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();

      // Spawn new particles at outer edge
      if (Math.random() < 0.3) {
        particlesRef.current.push({
          angle: Math.random() * Math.PI * 2,
          radius: PORTAL_SIZE / 2 - 5,
          speed: 0.5 + Math.random() * 0.5,
          size: 1 + Math.random() * 2,
          opacity: 0.8,
        });
      }

      // Update and draw particles
      ctx.save();
      ctx.translate(centerX, centerY);

      particlesRef.current = particlesRef.current.filter((p) => {
        // Move toward center
        p.radius -= p.speed * (isConsuming ? 1.5 : 1);
        p.angle += 0.05;
        p.opacity -= 0.01;

        // Remove if reached center or faded
        if (p.radius < 5 || p.opacity <= 0) {
          return false;
        }

        // Draw particle
        const x = Math.cos(p.angle) * p.radius;
        const y = Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 180, 255, ${p.opacity})`;
        ctx.fill();

        return true;
      });

      ctx.restore();

      // Rotation speed (faster when consuming)
      rotation += isConsuming ? 0.08 : 0.02;

      animationId = requestAnimationFrame(drawSwirl);
    }

    drawSwirl();
    return () => cancelAnimationFrame(animationId);
  }, [isConsuming]);

  // Determine animation class
  const getAnimationClass = () => {
    if (isCompleting || isClosing) return "portal-completing";
    if (isFading) return "portal-fading";
    return "";
  };

  return (
    <div
      className={`portal-container ${getAnimationClass()}`}
      style={{
        position: "fixed",
        left: position.x - PORTAL_SIZE / 2,
        top: position.y - PORTAL_SIZE / 2,
        width: PORTAL_SIZE,
        height: PORTAL_SIZE,
        zIndex: 65,
        pointerEvents: "none",
      }}
    >
      {/* Outer glow */}
      <div
        className="portal-glow"
        style={{
          position: "absolute",
          inset: -20,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(147,112,219,0.4) 0%, transparent 70%)",
          animation: "portalPulse 2s ease-in-out infinite",
        }}
      />

      {/* Main portal body */}
      <div
        className="portal-body"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #000 0%, #1a0a2e 40%, #2d1b4e 70%, #4a2c7a 100%)",
          boxShadow: `
            0 0 30px rgba(147,112,219,0.5),
            0 0 60px rgba(147,112,219,0.3),
            inset 0 0 30px rgba(0,0,0,0.8)
          `,
        }}
      />

      {/* Swirl canvas */}
      <canvas
        ref={canvasRef}
        width={PORTAL_SIZE}
        height={PORTAL_SIZE}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
        }}
      />

      {/* Center void */}
      <div
        className="portal-center"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: PORTAL_SIZE * 0.3,
          height: PORTAL_SIZE * 0.3,
          borderRadius: "50%",
          background: "#000",
          boxShadow: "inset 0 0 20px rgba(147,112,219,0.3)",
        }}
      />

      {/* Counter */}
      <div
        className="portal-counter"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${isBouncing ? 1.3 : 1})`,
          transition: "transform 0.15s ease-out",
          color: "rgba(255,255,255,0.9)",
          fontSize: "14px",
          fontWeight: "bold",
          textShadow: "0 0 10px rgba(147,112,219,0.8)",
          pointerEvents: "none",
        }}
      >
        {remaining} left
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes portalSpawn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes portalPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes portalComplete {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          30% {
            transform: scale(1.3);
            box-shadow: 0 0 60px rgba(255, 215, 0, 0.8);
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }

        @keyframes portalFade {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0;
          }
        }

        .portal-container {
          animation: portalSpawn 0.3s ease-out forwards;
        }

        .portal-completing {
          animation: portalComplete 0.8s ease-in-out forwards;
        }

        .portal-fading {
          animation: portalFade 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

export default Portal;
