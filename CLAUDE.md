# Cai Labs - Project Context

## Overview
A Next.js brand landing page for Cai Labs featuring interactive mascot characters with Matter.js physics, animated intro sequences, and experiment cards. Users can click to spawn mascots that bounce around and interact with UI elements.

## Tech Stack
- Next.js 16+ with App Router
- TypeScript
- Tailwind CSS
- Matter.js for physics simulation
- React hooks for animations and state

## Available Tools

### MCP Servers
- **Figma** — `get_design_context`, `get_variable_defs`, `get_screenshot`, `get_metadata`, `create_design_system_rules`, `get_figjam`
- **Figma Remote** — same as above plus `generate_diagram`, `get_code_connect_map`, `whoami`, `add_code_connect_map`, `get_code_connect_suggestions`, `send_code_connect_mappings`
- **Claude in Chrome** — browser automation: `navigate`, `read_page`, `get_page_text`, `find`, `form_input`, `computer`, `javascript_tool`, `resize_window`, `gif_creator`, `upload_image`, `tabs_context_mcp`, `tabs_create_mcp`, `update_plan`, `read_console_messages`, `read_network_requests`, `shortcuts_list`, `shortcuts_execute`
- **Context7** — up-to-date library docs: `resolve-library-id`, `query-docs`
- **Firecrawl** — web scraping/crawling: `firecrawl_scrape`, `firecrawl_map`, `firecrawl_search`, `firecrawl_crawl`, `firecrawl_check_crawl_status`, `firecrawl_extract`, `firecrawl_agent`, `firecrawl_agent_status`

### Skills (slash commands)
- `/remember` — save session notes on what was done, learned, and next steps
- `/web-design-guidelines` — review UI code against Web Interface Guidelines
- `/vercel-react-best-practices` — React/Next.js performance optimization audit
- `/rams` — accessibility and visual design review
- `/keybindings-help` — customize keyboard shortcuts

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

## Session History (Jan 29, 2026)

### Image Studio — Fullscreen Image Viewer
- Added `ImageFullscreen.tsx` component: click a generated image to open fullscreen overlay
- Image displays in 9:16 aspect ratio with `object-cover`, centered with padding
- Top bar (inside image): close (X), download, and Post buttons using solid `--color-inverse-surface` styling
- Bottom bar (inside image): starring avatars/names, option pills (desktop), Reshoot + Use Details buttons
- Dark scrim background (`rgba(0,0,0,0.85)`), gradient overlays on top/bottom bars
- Close via scrim click, Escape key, or X button
- Body scroll locked while fullscreen is open
- Wired up in `GenerationBatch.tsx` with local `fullscreenImage` state
- Mobile: bottom action buttons are icon-only 38px circles

### Image Studio — Data Updates
- Updated placeholder images from `bg_image.png` to `parkbench.png` (both in `data.ts` and hardcoded URLs in `page.tsx`)
- Added 4 new effects: Sparkles, Hearts, Lightning, Smoke
- Added 2 new scenes: Casino, Stage

### Image Studio — Minor Fixes
- Reverted navbar/footer gradient experiment back to solid `backgroundColor`
- Mobile cancel button in LoadingState now icon-only 38px circle (matches generated state buttons)
- OutputArea history rendering: replaced `.map()` with null returns with `.filter().map()` pattern
- Applied `--color-outline-variant` border to cancel button for consistency

## Session History (Jan 30, 2026)

### Image Studio — Data Updates
- Updated all style thumbnails from `ghost_*.jpg` to new `*.png` files; renamed "Realistic" to "Photorealistic"
- Added Low Angle shot (sh8)
- Added 5 new gestures: Finger Gun, Pointing, Shushing, Thinking, Waving
- Replaced expression list (was just "Sad") with 10 expressions: Angry, Crying, Excited, Laughing, Nervous, Shy, Smiling, Smirking, Surprised, Thinking
- Added 5 new outfits: Formal, Formalwear, School, Swimwear, Traditional
- Added 4 new scenes: Bedroom, Cafe, Gym, Locker Room
- Added 6 new effects: Bokeh, Fog, Motion Blur, Petals, Snow, Stars, Lens Flare; removed Smoke

### Image Studio — Mobile Drawer Fixes
- Drawer defaults to open on mobile; removed floating "+" button
- Fixed nested scroll conflict: MobileDrawer content wrapper changed to `flex-1 min-h-0`, Sidebar handles its own scroll with `overscroll-behavior-y: contain`
- Added body scroll lock when drawer is open
- Added `overscroll-behavior: none` on drawer container, `touch-action: none` on drag handle
- Removed black backdrop overlay from drawer
- Submit button (CreateButton) stays pinned at bottom of drawer; equalized padding with `py-3` on mobile

### Image Studio — SelectionModal Fixes
- Portaled modal to `document.body` via `createPortal` to escape MobileDrawer's `transform` context
- Replaced close icon SVG with inline version of `crossed small, delete, remove.svg` using `var(--color-on-surface)` stroke
- Removed `transition-opacity` from close button to fix hover shift

### Image Studio — Generated/Fullscreen State Updates
- Removed detail pills from LoadingState and GenerationBatch metadata rows
- Changed metadata row layout to `justify-between` on all screen sizes (was conditional)
- Download/Post button hover: default `--color-on-surface` bg, hover `--color-inverse-on-surface` bg (with inverted text), using tokens for theme support
- Removed entire bottom bar from ImageFullscreen (starring, pills, reshoot/use details)
- Removed `hover:opacity-80` from fullscreen Download/Post buttons

### Image Studio — Charms Dropdown
- Created `CharmsModal.tsx`: dropdown positioned below navbar charms button
- Shows "Charms" header with gift/add icon buttons (44px, hover state with token colors)
- Hero section: large charm image + balance count with inline SVG "C" logo using `--color-on-surface`/`--color-surface` tokens
- Click outside or Escape to close
- Currently disabled (onClick commented out) — ready to re-enable

### Leaderboards Page
- Built full leaderboards page at `/experiments/leaderboards` with staggered Jakub-style enter animations
- Hero section: two-line heading + subtitle in `--color-primary`, countdown pill with live timer
- Leaderboard rows: top 3 with colored backgrounds (`--color-toasty-amber`, `--color-alt-violet`, `--color-wired-lime`), rows 4+ with `--color-surface` bg and `--color-outline-variant` border
- Row 3 (lime) uses `darkText` prop for black text on light background
- Rank 4+ rows show rank number in a rounded circle with `color-mix(in srgb, var(--color-surface-variant) 50%, var(--color-surface))` fill
- Mascot images for top 3 rows updated to new `#1(2).png`, `#2(2).png`, `#3(2).png` assets at 208px intrinsic with quality={95}
- Inlined leaderboard logo SVG with `fill="currentColor"` and `color: var(--color-on-surface)` for theme reactivity
- ThemeProvider + theme toggle footer (Light/Dark/System) reused from Image Studio
- Font sizes use inline styles via `isMobile` ternary (Tailwind v4 arbitrary breakpoint values have specificity issues)
- Countdown timer initialized as `null` to prevent hydration mismatch, renders placeholder until mounted
- `isMobile` initialized as `null` with early return to prevent flash of desktop layout on mobile

### Leaderboards — Shared SubpageNavBar & SubpageFooter
- Extracted `SubpageNavBar` and `SubpageFooter` as shared components in `src/components/`
- `SubpageNavBar`: supports `logoSrc` (image) or `logoNode` (JSX) for the center logo, `variant` for light/dark styling, back arrow, charms/notification/avatar buttons
- `SubpageFooter`: disclaimer text + optional `rightContent` slot, `variant` for light/dark, mobile vertical stacking with centered text
- Image Studio's `ImageStudioNavBar` and `ImageStudioFooter` refactored to use these shared components

### Leaderboards — StaticMascot Component
- Created `StaticMascot.tsx`: lightweight mascot renderer with eye tracking, no physics
- Two-layer rendering: base image + eyes image with `transform: translate()` offset
- Uses `useEyeTracking` hook with `trackingRadius: 300`, `maxOffset: 5`, `lerpFactor: 0.15`
- RAF loop for smooth per-frame eye updates
- Random blinking: 2500–4500ms interval, 100ms blink duration
- `pointer-events-none` to avoid click interference

### Leaderboards — Mascot Placement
- 5 mascots placed "resting" on page elements with absolute positioning:
  - mascot-02 (ghost) on h1: `top: -55, left: -10` — desktop only
  - mascot-22 (orange) centered on countdown pill: `bottom: 100%` — visible on all sizes
  - mascot-11 (purple) on row 1 (lucille): `top: -55, left: 120` — desktop only
  - mascot-21 (yellow) on row 3 (gojo): `top: -55, right: 200` — desktop only
  - mascot-04 (green frog) on row 6 (dispatch): `top: -55, right: 160` — desktop only
- Only countdown pill mascot visible on mobile (others clipped or off-screen at mobile widths)
- Navbar and h1 mascot use `animate-enter` with stagger to prevent flash-before-animation

## Known Pitfalls — Do Not Repeat

### Do not modify the enter animation keyframes or fill mode
The Jakub-style enter animation uses `filter: blur(0px)` in the `to` frame and `animation-fill-mode: both`. This is intentional and working. **Do not** change `blur(0px)` to `filter: none`, do not change `both` to `forwards`, and do not change `ease-out` to a custom easing on this animation. Previous attempts to "fix" text blurriness by modifying these values made the problem worse. The original values are stable and tested — leave them alone.

## Session History (Feb 2, 2026)

### Leaderboards — Row Cleanup
- Removed colored backgrounds from top 3 rows (`color`, `darkText` props deleted from `LeaderboardEntry` and sample data)
- All rows now use theme-aware `--color-surface` bg, `--color-on-surface` text, `--color-outline-variant` border
- Changed row shadow from `shadow-md` → `shadow-xs`
- Changed h1/subtitle text color from `--color-primary` to `--color-on-surface`
- Commented out all 5 StaticMascot placements

### Leaderboards — Hero Carousel (Snap + Parallax)
- Replaced static image collage with auto-advancing snap carousel
- Side-by-side layout matching Figma comp (`3020:23266`): text left, carousel right on desktop; stacked on mobile
- Large circular images: 380px desktop / 240px mobile, `rounded-full overflow-hidden`
- One image fully visible + next peeking at right edge with gradient fade
- Two-track parallax system: image track slides immediately (600ms), pill track slides with 200ms delay — creates visible horizontal lag where pill trails behind image on enter and leads ahead on exit
- Each image has a colored PillTab at bottom-right (unique color per character)
- Auto-advance interval: 1600ms (1000ms pause + 600ms transition)
- Current images: Seraphix (`#df91f2`), Vampire Roommate (`#d90000`), Pink Blade (`#ff4dc9`)
- Cool Guy and Purple commented out temporarily

### Leaderboards — Brand Easing CSS Variables
- Added `:root` CSS custom properties for brand easing curves from Character.ai Brand Guidelines Figma:
  - `--ease-brand: cubic-bezier(0.93, 0.00, 0.07, 1.00)` — carousel slide + hover transitions
  - `--ease-brand-in: cubic-bezier(0.00, 0.00, 0.07, 1.00)` — element entrance
  - `--ease-brand-out: cubic-bezier(0.93, 0.00, 1.00, 1.00)` — element exit
  - `--ease-brand-bounce: cubic-bezier(0.00, 0.00, 0.07, 1.25)` — playful overshoot
- Applied `--ease-brand` to carousel transitions and LeaderboardRow hover states (via `transitionTimingFunction` longhand — `var()` doesn't work in `transition`/`animation` shorthand)
- Enter animation left on original `ease-out` (see Known Pitfalls above)

### Leaderboards — LeaderboardRow Hover Transitions
- Name link: `transitionProperty: "opacity"`, `transitionDuration: "200ms"`, `transitionTimingFunction: "var(--ease-brand)"`
- Username link: `transitionProperty: "all"`, same duration/easing, replaces Tailwind `transition-all`

### Leaderboards — Layout Updates
- Container changed from `max-w-6xl` to `max-w-5xl` (1024px)
- Consistent section spacing: `pt-16 / gap-16` mobile, `pt-32 / gap-32` desktop (128px)
- Hero text uses fluid `clamp()` sizing: `clamp(36px, 5vw, 72px)` heading, `clamp(20px, 3vw, 36px)` subtitle
- Re-imported `PillTab` from image-studio shared components
- Added `Image` import from next/image for carousel

## Session History (Feb 2, 2026 — continued)

### Leaderboards — Carousel Responsive Text Sizing
- Replaced fixed font sizes with `clamp()` for responsive scaling below 1000px viewports
- Heading: `clamp(48px, 7vw, 72px)` desktop, `36px` mobile
- Subtitle: `clamp(24px, 3.5vw, 36px)` desktop, `20px` mobile
- Removed `shrink-0` from text container to allow natural shrinking

### Leaderboards — Mobile Carousel Layout
- On mobile/tablet (stacked layout), carousel renders above text
- Full-bleed mobile carousel: `width: calc(100% + 40px)` with negative margins to break out of `px-5` padding
- Centered track: `left: 50%` + `translateX(calc(-offset - cardSize/2))`
- Both-side gradient fades (60px mobile, 94px desktop) using `var(--color-background)`
- Desktop uses CSS `order-2` to keep carousel on right despite being first in DOM

### Leaderboards — Infinite Carousel (No Loop-Back)
- Tripled image array (`extendedImages = [...images, ...images, ...images]`)
- `activeIndex` starts at `carouselImages.length` (middle set)
- Auto-advance increments without modulo
- Silent reset: when `activeIndex >= baseOffset + carouselImages.length`, disable transitions, subtract `carouselImages.length`, re-enable after double `requestAnimationFrame`
- Reset timeout: 650ms (after transition completes)

### Leaderboards — Parallax Refinement
- Reduced parallax gap from 200ms to 60ms — pill and image move mostly together with subtle offset
- Image track: 60ms delay (slightly trails pill)
- Pill track: 0ms delay (leads slightly on exit)
- Transition duration increased from 600ms to 900ms for smoother feel
- Easing: `--ease-brand` (tried `--ease-brand-out` but too abrupt)

### Leaderboards — Pill Exit Animation
- `isActive = i === activeIndex || i === activeIndex - 1` — keeps departing pill visible during slide-out
- Pill opacity transition: `transitionProperty: transitionEnabled ? "opacity" : "none"` prevents flicker during silent reset
- Pill horizontally centered: `left-1/2 -translate-x-1/2`, `bottom: 44px` desktop / `24px` mobile

### Leaderboards — Added Cool Guy & Neon Girl
- 5 carousel images: Vampire Roommate (`#d90000`), Pink Blade (`#ff4dc9`), Cool Guy (`#7db4ff`), Seraphix (`#df91f2`), Neon Girl (`#00d9d9`)
- `transparentBg` flag: `true` for Cool Guy and Neon Girl
- Transparent images use `object-contain` (no border), others use `object-cover` with `1px solid rgba(255,255,255,0.15)` border

### Leaderboards — Mobile Carousel Sizing
- Circle size: 224px mobile / 380px desktop
- Gap: 40px mobile / 80px desktop
- Mobile top padding: `pt-32`

### Leaderboards — Mobile Entry Animation
- Mobile carousel gets `--stagger: 1` (fades in first)
- Mobile text staggers offset by +1 (headings: `i + 2`, subtitle: `headingLines.length + 2 + i`)

### Leaderboards — Desktop Circular Mask Removed
- Removed `rounded-full` from desktop carousel container — images now slide behind rectangular `overflow-hidden` + gradient fades instead of circular mask
- Individual image circles retain their own `rounded-full overflow-hidden`

### Leaderboards — will-change on Carousel Tracks
- Added `willChange: "transform"` to both image track and pill track style objects
- Promotes tracks to GPU compositor layers — may fix sub-pixel 1px border seam artifact during transitions
- The 1px line only appears on bordered images (not transparent-bg ones like Cool Guy), suggesting it's a compositing artifact between border and gradient edge

### Leaderboards — Pushed to Branch
- Created and pushed `leaderboards-carousel-hero` branch

### Known Issue — 1px Border Seam During Carousel Transition
- A 1px line appears on the left edge of bordered carousel images during slide transitions
- Only affects images with `border: 1px solid rgba(255,255,255,0.15)` — not transparent-bg images
- Cause: sub-pixel compositing artifact between circle border and gradient's transparent edge
- Attempted fixes: box-shadow inset (no effect), `rounded-full` on container (clips pill), `color-mix` gradient (no effect), removing border (works but loses design intent)
- Current mitigation: `willChange: "transform"` on tracks — pending verification
- Gradient hierarchy is correct (gradients z-10, pill z-20, image z-auto) — not a stacking issue
