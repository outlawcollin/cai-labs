"use client";

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
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
  glitchToKaomoji: 120,
  chargeUp: 100,
  burst: 60,
  glitchBack: 120,
  settle: 50,
  total: 450,
};

interface SpawnLogoProps {
  className?: string;
  onSpawnReady?: () => void;
}

export interface SpawnLogoHandle {
  triggerSpawn: () => boolean;
  isAnimating: boolean;
}

// All animation state in one object for single setState per frame
interface AnimationState {
  displayText: string;
  labsText: string;
  isAnimating: boolean;
  showSVG: boolean;
  svgOpacity: number;
  phase: "idle" | "glitch-to" | "charge" | "burst" | "glitch-back" | "settle";
  scale: number;
  chromaOffset: { r: { x: number; y: number }; b: { x: number; y: number } };
  shake: { x: number; y: number };
}

const initialState: AnimationState = {
  displayText: "(c.ai)",
  labsText: "labs",
  isAnimating: false,
  showSVG: true,
  svgOpacity: 1,
  phase: "idle",
  scale: 1,
  chromaOffset: { r: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  shake: { x: 0, y: 0 },
};

export const SpawnLogo = forwardRef<SpawnLogoHandle, SpawnLogoProps>(
  function SpawnLogo({ className, onSpawnReady }, ref) {
    const [state, setState] = useState<AnimationState>(initialState);

    const animationRef = useRef<number | null>(null);
    const targetKaomojiRef = useRef<string>("");
    const onSpawnReadyRef = useRef(onSpawnReady);
    onSpawnReadyRef.current = onSpawnReady;

    // Generate glitched text by replacing random characters
    const glitchText = useCallback((original: string, progress: number, target: string) => {
      const chars = original.split("");
      const targetChars = target.split("");

      for (let i = 0; i < chars.length; i++) {
        const shouldGlitch = Math.random() < 0.3 + progress * 0.4;
        if (shouldGlitch) {
          if (progress > 0.7 && i < targetChars.length) {
            chars[i] = Math.random() < progress ? targetChars[i] || GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          } else {
            chars[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
        }
      }
      return chars.join("");
    }, []);

    const triggerSpawn = useCallback(() => {
      // Only block if currently animating - cooldown is handled by useSpawnQueue
      if (state.isAnimating) {
        return false;
      }
      targetKaomojiRef.current = KAOMOJI_FACES[Math.floor(Math.random() * KAOMOJI_FACES.length)];

      let popSoundPlayed = false;
      playSound("glitch");

      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        let newState: AnimationState;

        // Phase 1: Glitch from "(c.ai) labs" to kaomoji (0-120ms)
        if (elapsed < TIMELINE.glitchToKaomoji) {
          const progress = elapsed / TIMELINE.glitchToKaomoji;
          const chromaIntensity = Math.sin(progress * Math.PI) * 4;

          newState = {
            displayText: progress < 0.8 ? glitchText("(c.ai)", progress, targetKaomojiRef.current) : targetKaomojiRef.current,
            labsText: progress < 0.8 ? glitchText("labs", progress, "") : "",
            isAnimating: true,
            showSVG: false,
            svgOpacity: 0,
            phase: "glitch-to",
            scale: 1 + Math.sin(elapsed * 0.1) * 0.05,
            chromaOffset: {
              r: { x: -chromaIntensity + Math.random() * 2, y: Math.random() * 2 - 1 },
              b: { x: chromaIntensity + Math.random() * 2, y: Math.random() * 2 - 1 },
            },
            shake: {
              x: (Math.random() - 0.5) * 6 * progress,
              y: (Math.random() - 0.5) * 4 * progress,
            },
          };
        }
        // Phase 2: Charge up (120-220ms)
        else if (elapsed < TIMELINE.glitchToKaomoji + TIMELINE.chargeUp) {
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji;
          const progress = phaseElapsed / TIMELINE.chargeUp;

          newState = {
            displayText: targetKaomojiRef.current,
            labsText: "",
            isAnimating: true,
            showSVG: false,
            svgOpacity: 0,
            phase: "charge",
            scale: 1 + progress * 0.15,
            chromaOffset: {
              r: { x: -2 * (1 - progress), y: 0 },
              b: { x: 2 * (1 - progress), y: 0 },
            },
            shake: {
              x: (Math.random() - 0.5) * 3,
              y: (Math.random() - 0.5) * 2,
            },
          };
        }
        // Phase 3: Burst! (220-280ms)
        else if (elapsed < TIMELINE.glitchToKaomoji + TIMELINE.chargeUp + TIMELINE.burst) {
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji - TIMELINE.chargeUp;
          const progress = phaseElapsed / TIMELINE.burst;

          if (!popSoundPlayed) {
            playSound("pop");
            popSoundPlayed = true;
          }

          if (progress < 0.1 && onSpawnReadyRef.current) {
            onSpawnReadyRef.current();
          }

          newState = {
            displayText: SURPRISED_FACE,
            labsText: "",
            isAnimating: true,
            showSVG: false,
            svgOpacity: 0,
            phase: "burst",
            scale: 1.15 + Math.sin(progress * Math.PI) * 0.2,
            chromaOffset: { r: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
            shake: { x: 0, y: 0 },
          };
        }
        // Phase 4: Glitch back to "(c.ai) labs" (280-400ms)
        else if (elapsed < TIMELINE.glitchToKaomoji + TIMELINE.chargeUp + TIMELINE.burst + TIMELINE.glitchBack) {
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji - TIMELINE.chargeUp - TIMELINE.burst;
          const progress = phaseElapsed / TIMELINE.glitchBack;
          const chromaIntensity = (1 - progress) * 3;

          newState = {
            displayText: progress < 0.8 ? glitchText(SURPRISED_FACE, progress, "(c.ai)") : "(c.ai)",
            labsText: progress < 0.8 ? (progress > 0.4 ? glitchText("", progress - 0.4, "labs") : "") : "labs",
            isAnimating: true,
            showSVG: false,
            svgOpacity: 0,
            phase: "glitch-back",
            scale: 1.15 - progress * 0.15,
            chromaOffset: {
              r: { x: -chromaIntensity, y: 0 },
              b: { x: chromaIntensity, y: 0 },
            },
            shake: {
              x: (Math.random() - 0.5) * 4 * (1 - progress),
              y: (Math.random() - 0.5) * 3 * (1 - progress),
            },
          };
        }
        // Phase 5: Settle (400-450ms)
        else if (elapsed < TIMELINE.total) {
          const phaseElapsed = elapsed - TIMELINE.glitchToKaomoji - TIMELINE.chargeUp - TIMELINE.burst - TIMELINE.glitchBack;
          const progress = phaseElapsed / TIMELINE.settle;
          const bounce = Math.cos(progress * Math.PI * 2) * 0.03 * (1 - progress);

          newState = {
            displayText: "(c.ai)",
            labsText: "labs",
            isAnimating: true,
            showSVG: false,
            svgOpacity: 0,
            phase: "settle",
            scale: 1 + bounce,
            chromaOffset: { r: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
            shake: { x: 0, y: 0 },
          };
        }
        // Animation complete
        else {
          setState({
            ...initialState,
            svgOpacity: 1,
          });
          return;
        }

        setState(newState);
        animationRef.current = requestAnimationFrame(animate);
      };

      // Start animation
      setState({
        ...initialState,
        isAnimating: true,
        showSVG: false,
        svgOpacity: 0,
      });
      animationRef.current = requestAnimationFrame(animate);
      return true;
    }, [state.isAnimating, glitchText]);

    // Expose handle to parent
    useImperativeHandle(ref, () => ({
      triggerSpawn,
      isAnimating: state.isAnimating,
    }), [triggerSpawn, state.isAnimating]);

    return (
      <div
        className={`flex items-center gap-1 ${className || ""}`}
        style={{
          transform: `translate(${state.shake.x}px, ${state.shake.y}px) scale(${state.scale})`,
          transition: state.phase === "idle" ? "transform 0.15s ease-out" : undefined,
        }}
      >
        {state.showSVG ? (
          <img
            src="/logo.svg"
            alt="(c.ai)labs"
            className="dark:brightness-0 dark:invert"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              height: "26px",
              opacity: state.svgOpacity,
              transition: "opacity 150ms ease-out",
              userSelect: "none",
              WebkitUserDrag: "none",
              pointerEvents: "none",
            } as React.CSSProperties}
          />
        ) : (
          <>
            {/* Red chromatic layer */}
            {(state.chromaOffset.r.x !== 0 || state.chromaOffset.r.y !== 0) && (
              <span
                className="font-mono text-[26px] absolute pointer-events-none select-none"
                style={{
                  color: "rgba(255, 0, 0, 0.5)",
                  transform: `translate(${state.chromaOffset.r.x}px, ${state.chromaOffset.r.y}px)`,
                  mixBlendMode: "screen",
                }}
              >
                {state.displayText}
                {state.labsText && <span className="ml-1">{state.labsText}</span>}
              </span>
            )}

            {/* Blue chromatic layer */}
            {(state.chromaOffset.b.x !== 0 || state.chromaOffset.b.y !== 0) && (
              <span
                className="font-mono text-[26px] absolute pointer-events-none select-none"
                style={{
                  color: "rgba(0, 100, 255, 0.5)",
                  transform: `translate(${state.chromaOffset.b.x}px, ${state.chromaOffset.b.y}px)`,
                  mixBlendMode: "screen",
                }}
              >
                {state.displayText}
                {state.labsText && <span className="ml-1">{state.labsText}</span>}
              </span>
            )}

            {/* Main text layer */}
            <span
              className="font-mono text-[26px]"
              style={{ color: "var(--color-primary)" }}
            >
              {state.displayText}
            </span>
            {state.labsText && (
              <span
                className="font-mono text-[26px]"
                style={{ color: "var(--color-primary)" }}
              >
                {state.labsText}
              </span>
            )}
          </>
        )}
      </div>
    );
  }
);

export default SpawnLogo;
