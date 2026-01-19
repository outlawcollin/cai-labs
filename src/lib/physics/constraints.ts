import Matter from "matter-js";
import { MascotBody, LetterAnchor } from "./bodies";

const { Constraint, World } = Matter;

export function createHangingConstraint(
  mascotBody: Matter.Body,
  letterBody: Matter.Body,
  anchorPoint: { x: number; y: number }
): Matter.Constraint {
  return Constraint.create({
    bodyA: mascotBody,
    pointA: { x: 0, y: -20 }, // Top of mascot (hands position)
    bodyB: letterBody,
    pointB: anchorPoint,
    length: 30,
    stiffness: 0.8,
    damping: 0.1,
  });
}

export function checkForHangingOpportunity(
  mascot: MascotBody,
  letterAnchors: LetterAnchor[],
  maxHanging: number,
  currentHangingCount: number
): LetterAnchor | null {
  // Skip if already hanging or was recently hanging
  if (mascot.state === "hanging" || mascot.state === "dragging") return null;
  if (mascot.lastHangTime && Date.now() - mascot.lastHangTime < 3000) return null;

  // Need some bounces or time alive before can hang
  const timeAlive = Date.now() - mascot.createdAt;
  if (mascot.bounceCount < 2 && timeAlive < 3000) return null;

  // Check max hanging limit
  if (currentHangingCount >= maxHanging) return null;

  // Random chance to attempt hanging
  if (Math.random() > 0.02) return null; // ~2% chance per frame when eligible

  const mascotPos = mascot.body.position;
  const velocity = mascot.body.velocity;

  // Only try to hang if moving somewhat slowly
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (speed > 5) return null;

  // Find closest unoccupied anchor within range
  let closestAnchor: LetterAnchor | null = null;
  let closestDistance = 80; // Max grab distance

  for (const anchor of letterAnchors) {
    if (anchor.occupied) continue;

    const anchorWorldX = anchor.body.position.x + anchor.anchorPoint.x;
    const anchorWorldY = anchor.body.position.y + anchor.anchorPoint.y;

    const dx = mascotPos.x - anchorWorldX;
    const dy = mascotPos.y - anchorWorldY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestAnchor = anchor;
    }
  }

  return closestAnchor;
}

export function releaseFromHanging(
  mascot: MascotBody,
  engine: Matter.Engine,
  letterAnchors: LetterAnchor[]
): void {
  if (mascot.hangingConstraint) {
    World.remove(engine.world, mascot.hangingConstraint);
    mascot.hangingConstraint = undefined;
  }

  // Mark anchor as free
  for (const anchor of letterAnchors) {
    if (anchor.occupied && anchor.letterId === mascot.body.label.split("-")[1]) {
      anchor.occupied = false;
      break;
    }
  }

  mascot.state = "flying";
  mascot.lastHangTime = Date.now();

  // Give a little release impulse
  const impulseX = (Math.random() - 0.5) * 0.003;
  const impulseY = 0.002;
  Matter.Body.applyForce(mascot.body, mascot.body.position, { x: impulseX, y: impulseY });
}
