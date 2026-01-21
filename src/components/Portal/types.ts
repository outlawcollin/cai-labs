export interface PortalState {
  active: boolean;
  position: { x: number; y: number } | null;
  targetCount: number;
  currentCount: number;
  remaining: number;
  isConsuming: boolean;
  isCompleting: boolean;
  isClosing: boolean;
  isFading: boolean;
  spawnTime: number;
  lastConsumeTime: number;
}

export interface PortalProps {
  position: { x: number; y: number };
  remaining: number;
  isConsuming: boolean;
  isCompleting: boolean;
  isClosing: boolean;
  isFading: boolean;
}

export const PORTAL_SIZE = 100;
export const PORTAL_GRAVITY_RADIUS = 280; // Increased from 200 for stronger pull-in effect
export const PORTAL_GRAVITY_STRENGTH = 0.0003;
export const PORTAL_IDLE_TIMEOUT = 8000;
