# c.ai Labs - Project Context

## Overview
A Next.js brand landing page for c.ai Labs featuring an animated parallax hero section with multiple depth layers.

## Tech Stack
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- React hooks for animations

## Key Components

### ParallaxHero (`src/components/ParallaxHero/`)
The main hero section with 5 depth layers (L1-L5) plus background.

**Files:**
- `index.tsx` - Main component orchestrating layers, intro animation, and responsive scaling
- `useParallax.ts` - Mouse tracking (desktop) and device tilt (mobile) parallax
- `useIntroAnimation.ts` - Choreographed intro animation timeline
- `useScrollSnap.ts` - Weighted scroll snapping between sections
- `useHitMap.ts` - Pixel-perfect hover detection using alpha channels
- `ShuffleText.tsx` - Animated text scramble effect
- `layers.ts` - Layer configuration (positions, speeds, z-indices)

**Layer System:**
- Base container: 1920x1080px
- Background: Static, fills viewport
- L5 (furthest): speed 0.02, z-index 1
- L4: speed 0.04, z-index 2
- L3: speed 0.06, z-index 3
- L2: speed 0.10, z-index 4
- L1 (closest): speed 0.15, z-index 5 (renders above text)

**Dynamic Viewport Scaling:**
- Desktop: Elements spread/contract with 30% dampened scaling based on viewport size
- Mobile (<768px): Fixed 0.75 scale with tilt-based parallax via DeviceOrientationEvent
- Background always fills viewport (scales up for larger screens)

**Intro Animation Timeline:**
1. Logo shuffle on black (0-2.3s)
2. Background reveal (2.3-3.1s)
3. Layers fall in sequence L5→L1 (3.2-4.4s)
4. Logo shrinks, text fades in with upward motion (4.2-5.4s)

**Scroll Snap:**
- Threshold-based with damping/resistance
- Rubber-band effect at boundaries
- 3 sections total

## Images
Hero images stored in `public/images/hero/`:
- `hero-bg.png` - Background
- `img-1.png` to `img-13.png` - Character layers

## Development
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Run ESLint
```

## Notes
- Reduced motion preference respected throughout
- iOS 13+ requires permission for device orientation (requested on first tap)
- Hit detection uses morphological dilation for smoother edges
- Press Shift+R to replay intro animation (dev only)
- Press ESC or click to skip intro
