# Cai Labs - Project Context

## Overview
A Next.js brand landing page for Cai Labs featuring interactive mascot characters with Matter.js physics, animated intro sequences, and experiment cards. Users can click to spawn mascots that bounce around and interact with UI elements.

## Tech Stack
- Next.js 16+ with App Router
- TypeScript
- Tailwind CSS
- Matter.js for physics simulation
- React hooks for animations and state

## Key Components

### MascotLauncher (`src/components/MascotLauncher/`)
Interactive mascot system with physics-based movement and portal game mechanics.

**Files:**
- `MascotOverlay.tsx` - Main overlay managing mascot spawning, physics bodies for cards, drag interactions, and portal game
- `ExpressiveMascot.tsx` - Individual mascot renderer with eye tracking, states (flying, standing, dragging, birthing), and consume animations
- `Mascot.tsx` - Legacy mascot component with type definitions

**Mascot States:**
- `birthing` - Initial spawn animation from logo
- `flying` - In motion, affected by physics
- `standing` - Landed on a card, static
- `hanging` - Attached to letter anchors (unused currently)
- `dragging` - Being dragged by user

### Portal Game (`src/hooks/usePortalGame.ts`)
When user drags a mascot, a portal spawns asking for 2-5 sacrifices. Features:
- Gravity pull effect when mascots are near (280px radius)
- Warp visual effect during drag
- Success animation when target reached
- Idle timeout (8s) unless actively dragging

### Physics System (`src/lib/physics/`, `src/hooks/usePhysicsEngine.ts`)
- Matter.js engine with custom update loop
- Static bodies created for experiment cards (with rotation support)
- Mascot bodies with bounce, friction, and air resistance
- Collision detection for card hits (triggers bounce animation)

### Mascot Spawner (`src/hooks/useMascotSpawner.ts`)
Manages mascot lifecycle:
- Spawn from logo with arc trajectories (left clicks → right arcs, right clicks → left arcs)
- Birth animation (180ms scale-up from logo)
- Max 30 mascots, oldest removed with fade animation
- Fly away on scroll (all mascots launch upward, cleared after 1s)
- Respawn when scrolling back to hero

### Home Page (`src/app/page.tsx`)
Main landing with:
- Intro animation (logo glitch → cards rise → mascots spawn)
- Hero state (cards stacked, mascots active) vs scrolled state (cards horizontal scroll)
- SpawnLogo kaomoji animation on click/auto-spawn
- Experiment cards with color variants and hover effects

### Experiment Cards (`src/components/ExperimentCard.tsx`)
- 5 experiments: Podcasts, Comics, Streams, Image Studio, Books
- Color variants: lime, lavender, butter, rose, sky (light/dark)
- Hover triggers mascot knock-over on that card
- Images in `public/experiments/`

### Intro Animation (`src/hooks/useHomeIntro.ts`)
Choreographed sequence:
1. "cai" typed with glitch effect
2. "labs" appears
3. Logo moves to top, scales down
4. Cards rise from bottom with stagger
5. Mascots auto-spawn with logo animation

## Key Behaviors

### Mascot Spawning
- Click anywhere in hero → logo animates to kaomoji → mascot launches in arc opposite to click
- Initial 5 mascots spawn with 300-450ms delays after intro
- Respawn 5 mascots when scrolling back to hero (500ms delay)

### Portal Mechanics
- Drag mascot → portal appears
- Mascots pulled toward portal when within 280px
- Stronger warp effect as mascot approaches (70% max pull)
- Portal stays active while dragging (no idle timeout)
- 2-5 mascots required for success

### Scroll Behavior
- Scroll down >50px → fly away all mascots, transition to horizontal card scroll
- Scroll back to top → respawn mascots after delay
- Cards transition from stacked fan to horizontal row

## Z-Index Hierarchy
- 60: MascotOverlay container
- 65: Portal
- 70: Mascot being consumed (during portal animation)

## Development
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Run ESLint
```

## Notes
- Reduced motion preference respected
- Cards' physics bodies created 600ms after intro (wait for entrance animation)
- ESC or click skips intro
- Portal blocks new mascot spawns (prevents spawn on drop)
- Mascot images in `public/mascots/` with expressive variants
