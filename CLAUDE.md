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

## Mobile Responsiveness

### Breakpoints
- Mobile: `< 768px` (detected via `windowWidth < 768`)
- Desktop: `>= 768px`

### Mobile-Specific Behaviors

**Experiment Cards:**
- Vertical stack layout (not horizontal scroll)
- 300px card height (vs 640px desktop)
- Fade-in and slide-up animation on intro (uses `intro.cardProgress`)
- Bounce effect on mascot landing (scale 0.97)
- Fixed container height prevents layout shift during fade-in

**Physics Bodies:**
- Uses actual card dimensions (`rect.width`/`rect.height`) for non-rotated mobile cards
- Desktop uses hardcoded 420×640 dimensions (bounding rect inflated by rotation)
- `bodiesCreatedRef` ensures scroll updates work after manual refresh
- 200ms delay before updating bodies on respawn to let animations settle

**Hero Section:**
- Full screen height: `calc(100vh - 180px)`
- Hero text doesn't fade on scroll (stays visible)
- Intro logo scales at 0.7x to prevent clipping

**Community Section:**
- Height: `clamp(450px, 65vh, 900px)`
- Y offset multiplier: 0.8 (vs 1.0 desktop) for cards
- Card scale: 0.6x of desktop

**Navigation:**
- Hamburger menu on mobile
- Logo and mascots hidden when mobile menu is open
- Nav items slide in from right

**Conditional Rendering:**
- Mobile and desktop cards use `{isMobile && ...}` / `{!isMobile && ...}` (not CSS hide)
- Ensures `cardRefs` point to correct visible elements for physics

### Dark Mode
- `--color-primary` becomes white (`#ffffff`)
- `--color-brand-off-white` becomes `#262626`
- Logos use `dark:brightness-0 dark:invert`
- Social icons use `dark:invert group-hover:invert dark:group-hover:invert-0`

## Notes
- Reduced motion preference respected
- Cards' physics bodies created 600ms after intro (wait for entrance animation)
- ESC or click skips intro
- Portal blocks new mascot spawns (prevents spawn on drop)
- Mascot images in `public/mascots/` with expressive variants

---

## Session History (Jan 22, 2026)

### Logo Scroll Animation
- Implemented fluid logo scroll transition: logo smoothly moves from hero position (165px) to nav position (20px) as user scrolls first 50px
- Added `logoScrollY` state to track scroll position for interpolation
- Removed redundant nav logo from NavBar (SpawnLogo handles both states)
- Fixed logo z-index from `z-40` to `z-50` so it doesn't go under the filled navbar

### Mascot Auto-Spawn Fix
- Fixed mascots not auto-spawning on page load by adding `intro.isComplete` to the logo position effect dependency array
- Logo position now updates when intro completes, enabling mascot spawning

### Spawn Click Reliability
- Removed redundant 450ms cooldown from SpawnLogo (useSpawnQueue already handles throttling)
- Clicks are now more reliably converted to mascot spawns

### Physics Tuning
- Reduced mascot restitution: 0.7 → 0.5
- Reduced card restitution: 0.6 → 0.3
- Fixes rapid "basketball near ground" micro-bouncing

### NavBar Updates
- Added background fill: `backgroundColor: "var(--color-background)"`
- Reduced desktop nav link text size: `text-lg` → `text-base`
- NavBar fades in with `navOpacity` during intro animation

### Attempted but Reverted
- Moving NavBar/Footer to layout.tsx with React Context for visibility control - reverted due to complexity
- Hover color change on nav links using CSS variables - reverted to 70% opacity due to Tailwind/inline style conflicts

### Footer Logo Glitch Effect Fix
- Added font smoothing CSS to `FooterLogo.tsx` `renderCharacters` function:
  - `WebkitFontSmoothing: "antialiased"`
  - `MozOsxFontSmoothing: "grayscale"`
  - `textRendering: "geometricPrecision"`
- Increased initial character opacity from 0.6 → 0.8
- Fixes blurry text appearance at start of glitch animation

### Stories Page Breakpoint
- Changed `isMobile` breakpoint from `768px` to `1024px` in `src/app/stories/page.tsx`
- Two-column grid now only appears on larger screens where cards have room

### Community Page Responsive Layouts
- Added intermediate 2-column layout for tablet sizes (640px - 1024px)
- Three breakpoints now:
  - Below 640px: 1 column (mobile)
  - 640px - 1024px: 2 columns (tablet)
  - 1024px+: 4 columns (desktop)
- Tablet layout merges col1+col3 into left column, col2+col4 into right column
