"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { playSound } from "@/lib/sounds/soundManager";

// Kaomoji faces for spawn animation
const KAOMOJI_FACES = [
  "(◕‿◕)",
  "(◉‿◉)",
  "(◕ᴗ◕)",
  "(✧ᴗ✧)",
  "(◠‿◠)",
  "(ᵔᴥᵔ)",
  "(•‿•)",
  "(◉ω◉)",
  "(｡◕‿◕｡)",
  "(◕‿↼)",
  "(°▽°)",
  "(◕◡◕)",
];

const SURPRISED_FACE = "(◎_◎)";
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Animation timeline (in ms)
const TIMELINE = {
  glitchToKaomoji: 120,      // 0-120ms: Glitch from "(c.ai) labs" to kaomoji
  chargeUp: 100,              // 120-220ms: Charging pulse
  burst: 60,                  // 220-280ms: Burst moment with surprised face
  glitchBack: 120,            // 280-400ms: Glitch back to "(c.ai) labs"
  settle: 50,                 // 400-450ms: Settle with bounce
  total: 450,                 // Total animation duration
};

// Spawn cooldown
const SPAWN_COOLDOWN = 450;

interface SpawnLogoProps {
  className?: string;
  onSpawnReady?: () => void;
}

export interface SpawnLogoHandle {
  triggerSpawn: () => boolean; // Returns true if spawn was triggered, false if on cooldown
  isAnimating: boolean;
}

export const SpawnLogo = forwardRef<SpawnLogoHandle, SpawnLogoProps>(
  function SpawnLogo({ className, onSpawnReady }, ref) {
    const [displayText, setDisplayText] = useState("(c.ai)");
    const [labsText, setLabsText] = useState("labs");
    const [isAnimating, setIsAnimating] = useState(false);
    const [phase, setPhase] = useState<"idle" | "glitch-to" | "charge" | "burst" | "glitch-back" | "settle">("idle");
    const [scale, setScale] = useState(1);
    const [chromaOffset, setChromaOffset] = useState({ r: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
    const [shake, setShake] = useState({ x: 0, y: 0 });

    const animationRef = useRef<number | null>(null);
    const lastSpawnRef = useRef<number>(0);
    const targetKaomojiRef = useRef<string>("");
    const onSpawnReadyRef = useRef(onSpawnReady);
    onSpawnReadyRef.current = onSpawnReady;

    // Generate glitched text by replacing random characters
    const glitchText = useCallback((original: string, progress: number, target: string) => {
      const chars = original.split("");
      const targetChars = target.split("");
      const glitchCount = Math.floor(chars.length * (1 - Math.abs(progress - 0.5) * 2));

      for (let i = 0; i < chars.length; i++) {
        const shouldGlitch = Math.random() < 0.3 + progress * 0.4;
        if (shouldGlitch) {
          if (progress > 0.7 && i < targetChars.length) {
            // Transitioning to target
            chars[i] = Math.random() < progress ? targetChars[i] || GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          } else {
            chars[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
        }
      }
      return chars.join("");
    }, []);

    const triggerSpawn = useCallback(() => {
      const now = Date.now();
      if (now - lastSpawnRef.current < SPAWN_COOLDOWN || isAnimating) {
        return false; // On cooldown or already animating
      }

      lastSpawnRef.current = now;
      setIsAnimating(true);

      // Select random kaomoji for this spawn
      targetKaomojiRef.current = KAOMOJI_FACES[Math.floor(Math.random() * KAOMOJI_FACES.length)];

      // Track which sounds have been played this animation
      let glitchSoundPlayed = false;
      let popSoundPlayed = false;

      // Play glitch sound at start
      playSound("glitch");

      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;

        // Phase 1: Glitch from "(c.ai) labs" to kaomoji (0-120ms)
        if (elapsed < TIMELINE.glitchToKaomoji) {
          setPhase("glitch-to");
          const progress = elapsed / TIMELINE.glitchToKaomoji;

          // Glitch text
          if (progress < 0.8) {
            setDisplayText(glitchText("(c.ai)", progress, targetKaomojiRef.current));
            setLabsText(glitchText("labs", progress, ""));
          } else {
            setDisplayText(targetKaomojiRef.current);
            setLabsText("");
          }

          // Chromatic aberration
          const chromaIntensity = Math.sin(progress * Math.PI) * 4;
          setChromaOffset({
            r: { x: -chromaIntensity + Math.random() * 2, y: Math.random() * 2 - 1 },
            b: { x: chromaIntensity + Math.random() * 2, y: Math.random() * 2 - 1 },
          });

          // Shake
          setShake({
            x: (Math.random() - 0.5) * 6 * progress,
            y: (Math.random() - 0.5) * 4 * progress,
          });

          // Scale wobble
          setScale(1 + Math.sin(elapsed * 0.1) * 0.05);
        }
        // Phase 2: Charge up (120-220ms)
        else if (elapsed < TIMELINE.glitchToKaomoji + TIMELINE.chargeUp) {
          setPhase("charge");
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji;
          const progress = phaseElapsed / TIMELINE.chargeUp;

          setDisplayText(targetKaomojiRef.current);
          setLabsText("");

          // Growing scale for charge-up
          setScale(1 + progress * 0.15);

          // Subtle vibration
          setShake({
            x: (Math.random() - 0.5) * 3,
            y: (Math.random() - 0.5) * 2,
          });

          // Reduce chroma
          setChromaOffset({
            r: { x: -2 * (1 - progress), y: 0 },
            b: { x: 2 * (1 - progress), y: 0 },
          });
        }
        // Phase 3: Burst! (220-280ms) - This is when mascot spawns
        else if (elapsed < TIMELINE.glitchToKaomoji + TIMELINE.chargeUp + TIMELINE.burst) {
          setPhase("burst");
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji - TIMELINE.chargeUp;
          const progress = phaseElapsed / TIMELINE.burst;

          // Play pop sound at burst start
          if (!popSoundPlayed) {
            playSound("pop");
            popSoundPlayed = true;
          }

          // Surprised face at burst
          setDisplayText(SURPRISED_FACE);

          // Sharp scale punch outward then back
          const burstScale = 1.15 + Math.sin(progress * Math.PI) * 0.2;
          setScale(burstScale);

          // No shake during burst - clean expansion
          setShake({ x: 0, y: 0 });
          setChromaOffset({ r: { x: 0, y: 0 }, b: { x: 0, y: 0 } });

          // Trigger spawn callback at the start of burst
          if (progress < 0.1 && onSpawnReadyRef.current) {
            onSpawnReadyRef.current();
          }
        }
        // Phase 4: Glitch back to "(c.ai) labs" (280-400ms)
        else if (elapsed < TIMELINE.glitchToKaomoji + TIMELINE.chargeUp + TIMELINE.burst + TIMELINE.glitchBack) {
          setPhase("glitch-back");
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji - TIMELINE.chargeUp - TIMELINE.burst;
          const progress = phaseElapsed / TIMELINE.glitchBack;

          // Glitch from surprised face back to logo
          if (progress < 0.8) {
            setDisplayText(glitchText(SURPRISED_FACE, progress, "(c.ai)"));
            setLabsText(progress > 0.4 ? glitchText("", progress - 0.4, "labs") : "");
          } else {
            setDisplayText("(c.ai)");
            setLabsText("labs");
          }

          // Chromatic aberration fading
          const chromaIntensity = (1 - progress) * 3;
          setChromaOffset({
            r: { x: -chromaIntensity, y: 0 },
            b: { x: chromaIntensity, y: 0 },
          });

          // Decreasing shake
          setShake({
            x: (Math.random() - 0.5) * 4 * (1 - progress),
            y: (Math.random() - 0.5) * 3 * (1 - progress),
          });

          // Scale returning
          setScale(1.15 - progress * 0.15);
        }
        // Phase 5: Settle (400-450ms)
        else if (elapsed < TIMELINE.total) {
          setPhase("settle");
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji - TIMELINE.chargeUp - TIMELINE.burst - TIMELINE.glitchBack;
          const progress = phaseElapsed / TIMELINE.settle;

          setDisplayText("(c.ai)");
          setLabsText("labs");

          // Bounce settle
          const bounce = Math.cos(progress * Math.PI * 2) * 0.03 * (1 - progress);
          setScale(1 + bounce);

          setShake({ x: 0, y: 0 });
          setChromaOffset({ r: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
        }
        // Animation complete
        else {
          setPhase("idle");
          setDisplayText("(c.ai)");
          setLabsText("labs");
          setScale(1);
          setShake({ x: 0, y: 0 });
          setChromaOffset({ r: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
          setIsAnimating(false);
          return;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
      return true;
    }, [isAnimating, glitchText]);

    // Cleanup animation on unmount
    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    // Expose handle to parent
    useImperativeHandle(ref, () => ({
      triggerSpawn,
      isAnimating,
    }), [triggerSpawn, isAnimating]);

    return (
      <div
        className={`flex items-center gap-1 ${className || ""}`}
        style={{
          transform: `translate(${shake.x}px, ${shake.y}px) scale(${scale})`,
          transition: phase === "idle" ? "transform 0.15s ease-out" : undefined,
        }}
      >
        {/* Red chromatic layer */}
        {(chromaOffset.r.x !== 0 || chromaOffset.r.y !== 0) && (
          <span
            className="font-mono text-[26px] absolute pointer-events-none select-none"
            style={{
              color: "rgba(255, 0, 0, 0.5)",
              transform: `translate(${chromaOffset.r.x}px, ${chromaOffset.r.y}px)`,
              mixBlendMode: "screen",
            }}
          >
            {displayText}
            {labsText && <span className="ml-1">{labsText}</span>}
          </span>
        )}

        {/* Blue chromatic layer */}
        {(chromaOffset.b.x !== 0 || chromaOffset.b.y !== 0) && (
          <span
            className="font-mono text-[26px] absolute pointer-events-none select-none"
            style={{
              color: "rgba(0, 100, 255, 0.5)",
              transform: `translate(${chromaOffset.b.x}px, ${chromaOffset.b.y}px)`,
              mixBlendMode: "screen",
            }}
          >
            {displayText}
            {labsText && <span className="ml-1">{labsText}</span>}
          </span>
        )}

        {/* Main text layer */}
        <span
          className="font-mono text-[26px]"
          style={{ color: "var(--color-primary)" }}
        >
          {displayText}
        </span>
        {labsText && (
          <span
            className="font-mono text-[26px]"
            style={{ color: "var(--color-primary)" }}
          >
            {labsText}
          </span>
        )}
      </div>
    );
  }
);

export default SpawnLogo;
