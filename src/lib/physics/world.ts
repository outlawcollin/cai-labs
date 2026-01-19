import Matter from "matter-js";

const { Engine, World, Bodies, Events } = Matter;

export interface PhysicsWorld {
  engine: Matter.Engine;
  walls: Matter.Body[];
}

export function createPhysicsWorld(): PhysicsWorld {
  const engine = Engine.create({
    gravity: { x: 0, y: 1.2, scale: 0.001 },
  });

  // Walls will be created/updated on resize
  const walls: Matter.Body[] = [];

  return { engine, walls };
}

export function createWalls(
  engine: Matter.Engine,
  existingWalls: Matter.Body[],
  width: number,
  height: number
): Matter.Body[] {
  // Remove existing walls
  if (existingWalls.length > 0) {
    World.remove(engine.world, existingWalls);
  }

  const wallThickness = 100;
  const wallOptions = {
    isStatic: true,
    friction: 0.3,
    restitution: 0.6,
    label: "wall",
  };

  const newWalls = [
    // No top or bottom walls - mascots can fall out of the world
    // Left wall
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, wallOptions),
    // Right wall
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, wallOptions),
  ];

  World.add(engine.world, newWalls);
  return newWalls;
}

export function runPhysicsLoop(
  engine: Matter.Engine,
  onUpdate: () => void
): () => void {
  let animationId: number;
  let lastTime = performance.now();

  const loop = (time: number) => {
    const delta = time - lastTime;
    lastTime = time;

    // Cap delta to prevent large jumps
    const cappedDelta = Math.min(delta, 32);
    Engine.update(engine, cappedDelta);
    onUpdate();

    animationId = requestAnimationFrame(loop);
  };

  animationId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animationId);
  };
}
