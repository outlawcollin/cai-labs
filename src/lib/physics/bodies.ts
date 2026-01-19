import Matter from "matter-js";

const { Bodies, World } = Matter;

export type MascotState = "flying" | "hanging" | "dragging" | "idle" | "standing";

export interface MascotBody {
  id: string;
  body: Matter.Body;
  state: MascotState;
  mascotType: number;
  bounceCount: number;
  cardBounceCount: number; // Track bounces specifically on cards
  createdAt: number;
  hangingConstraint?: Matter.Constraint;
  lastHangTime?: number;
  onCard?: boolean; // Whether currently touching a card
  isRemoving?: boolean; // Whether mascot is in removal animation
}

export function createMascotBody(
  x: number,
  y: number,
  id: string,
  mascotType: number
): Matter.Body {
  return Bodies.circle(x, y, 35, {
    restitution: 0.5, // Medium bouncy
    friction: 0.1,
    frictionAir: 0.01,
    label: `mascot-${id}`,
    density: 0.001,
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
