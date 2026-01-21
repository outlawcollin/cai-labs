import confetti from "canvas-confetti";

export function triggerSuccessConfetti(originX: number, originY: number) {
  // Convert to relative coordinates (0-1)
  const x = originX / window.innerWidth;
  const y = originY / window.innerHeight;

  // First burst from portal position
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x, y },
    colors: ["#9370DB", "#DDA0DD", "#E6E6FA", "#FFD700", "#FF69B4"],
  });

  // Follow-up bursts for extra impact
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#9370DB", "#DDA0DD", "#FFD700"],
    });
  }, 150);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#9370DB", "#DDA0DD", "#FFD700"],
    });
  }, 300);
}
