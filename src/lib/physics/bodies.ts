import Matter from "matter-js";

const { Bodies, World } = Matter;

// Collision categories for filtering what bodies interact with what
export const COLLISION_CATEGORY = {
  MASCOT: 0x0001,
  CARD: 0x0002,
  WALL: 0x0004,
  DEFAULT: 0x0008,
};

export type MascotState = "flying" | "hanging" | "dragging" | "idle" | "standing" | "birthing";

export interface MascotBody {
  id: string;
  body: Matter.Body;
  state: MascotState;
  mascotType: number;
  mascotId?: string; // Registry ID for expressive mascots (e.g., 'mascot-21')
  bounceCount: number;
  cardBounceCount: number; // Track bounces specifically on cards
  createdAt: number;
  hangingConstraint?: Matter.Constraint;
  lastHangTime?: number;
  onCard?: boolean; // Whether currently touching a card
  isRemoving?: boolean; // Whether mascot is in removal animation
  birthProgress?: number; // 0-1 progress of birth animation
  birthStartTime?: number; // When birth animation started
  pendingLaunch?: { // Deferred launch impulse applied after birth
    forceX: number;
    forceY: number;
    spin: number;
  };
  // Event handlers stored for cleanup
  collisionStartHandler?: (event: Matter.IEventCollision<Matter.Engine>) => void;
  collisionEndHandler?: (event: Matter.IEventCollision<Matter.Engine>) => void;
}

export function createMascotBody(
  x: number,
  y: number,
  id: string,
  mascotType: number
): Matter.Body {
  return Bodies.circle(x, y, 35, {
    restitution: 0.5, // Moderate bounce - settles faster, avoids rapid micro-bouncing
    friction: 0.05, // Lower friction for smoother slides
    frictionAir: 0.005, // Less air resistance - keeps momentum longer
    label: `mascot-${id}`,
    density: 0.001,
    collisionFilter: {
      category: COLLISION_CATEGORY.MASCOT,
      mask: COLLISION_CATEGORY.MASCOT | COLLISION_CATEGORY.CARD | COLLISION_CATEGORY.WALL | COLLISION_CATEGORY.DEFAULT,
    },
  });
}

export function createCardBody(
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  id: string
): Matter.Body {
  return Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    angle: angle * (Math.PI / 180),
    label: `card-${id}`,
    chamfer: { radius: 16 },
    restitution: 0.3, // Lower bounce on cards - prevents rapid micro-bouncing
    friction: 0.05, // Low friction for smooth deflections
  });
}

export function createLetterBody(
  x: number,
  y: number,
  width: number,
  height: number,
  id: string
): Matter.Body {
  return Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    label: `letter-${id}`,
    isSensor: true, // Letters don't physically block, just detect for hanging
  });
}

export interface LetterAnchor {
  letterId: string;
  body: Matter.Body;
  anchorPoint: { x: number; y: number };
  occupied: boolean;
}
