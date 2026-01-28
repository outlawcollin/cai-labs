# Session History

## January 28, 2026 - Image Studio UI Polish

### Icon Updates
- Updated all icons in OptionsDropdown to use actual SVG files from `/public/image-studio/icons/`
- Made icons use `currentColor` for dynamic coloring
- Icon mappings:
  - shot -> camera.svg
  - outfit -> shirt icon.svg
  - expression -> smile, emoji.svg
  - gesture -> shaka, call me, hang ten.svg
  - pose -> accessibility, a11y.svg
  - scene -> images 5, photos, pictures, shot.svg
  - style -> colors, palette, colours.svg
  - effects -> Focus, Camera, exposure, magic, auto, ai, sparkles, effects.svg
  - chevron -> chevron-down-small.svg
- Updated Tooltip.tsx to use info circle icon

### Checkmark Updates
- Updated all checkmarks to use Subtract-2.svg with dynamic colors across:
  - OptionsDropdown.tsx
  - SelectionModal.tsx
  - CharacterPicker.tsx
  - PersonaPicker.tsx
  - ModeSelector.tsx

### Bug Fixes
- Fixed ModeSelector.tsx syntax error (missing closing `</div>`)
- Fixed single-select bug in useImageStudio.ts - changed from multi-select to single-select by replacing `[...categoryOptions, option]` with `[option]`
- Fixed image shift on selection by making both selected and unselected borders 1px

### CharacterPicker & PersonaPicker Updates
- Changed browse button from `rounded-full` to `rounded-2xl` to match character squares
- Updated browse icon to grid/search icon
- Made all labels lowercase and font-medium
- Updated borders to `1px solid var(--color-outline-variant)`

### ModeSelector Redesign
- Added actual images from `/public/image-studio/mode/`
- Reordered options: solo, self-portrait, together, duo (Solo first)
- Styled like CharacterPicker with rounded-2xl images
- Added subtitles back
- Changed mobile layout from 2x2 grid to 4 items in a row
- Added background color (`var(--color-surface-variant)`) to mode images

### Label Consistency
- Made all section labels same style: `text-base font-medium`, lowercase
- Labels updated: "who's in the image", "details", "select persona", "select character"
- Made all names and "browse" text lowercase and font-medium

### Border & Styling Updates
- Added low opacity border to all image containers
- Changed borders to `1px solid var(--color-outline-variant)`
- Made selected and unselected borders both 1px to prevent movement
- Added top stroke to button container
- Changed OptionsDropdown thumbnails from `rounded-lg` to `rounded-2xl`

### Sidebar Updates
- Fixed sidebar width back to `w-[420px]`
- Added `overflow-hidden` to fix text clipping on scroll
- Removed `mb-3` from details header to match other sections

### OptionsDropdown Updates
- Removed icon color change on dropdown expand
- Added `hideBorder` prop to conditionally hide bottom border
- Removed bottom border under "effects" (last dropdown)

### PillTab Updates
- Increased pill font sizes (xs: 10->11, sm: 11->12, md: 12->13)
- Then increased again by 1 step (xs: 12px, sm: 13px, md: 14px)
- Removed star icon (set `showIcon` default to `false`)
- Added black text color for light-colored pills (green: `#00d973`, `#1ebe53`, cyan: `#00d9d9`)

### Background Image
- Updated EmptyState component to use cat mascot image from `/image-studio/background/bg_image.png`

### Files Modified
- `src/app/experiments/image-studio/components/Sidebar/OptionsDropdown.tsx`
- `src/app/experiments/image-studio/components/Sidebar/ModeSelector.tsx`
- `src/app/experiments/image-studio/components/Sidebar/CharacterPicker.tsx`
- `src/app/experiments/image-studio/components/Sidebar/PersonaPicker.tsx`
- `src/app/experiments/image-studio/components/Sidebar/index.tsx`
- `src/app/experiments/image-studio/components/shared/PillTab.tsx`
- `src/app/experiments/image-studio/components/shared/Tooltip.tsx`
- `src/app/experiments/image-studio/components/shared/SelectionModal.tsx`
- `src/app/experiments/image-studio/components/OutputArea/EmptyState.tsx`
- `src/hooks/useImageStudio.ts`

---

## January 28, 2026 - Image Studio Navbar, Footer & Theme Toggle

### Navbar Redesign
- Complete navbar rewrite with new layout:
  - Left: Back arrow button (48px round, links to "/")
  - Center: Logo (24px height, centered absolutely)
  - Right: Credits button, Notification button, Avatar (all 48px)
- Added hover states: `hover:bg-black/10 dark:hover:bg-white/10` for theme-aware hover
- Avatar uses helmet profile image with 1.5px low-opacity border
- Logo switches colors based on theme (invert filter in dark mode)
- Removed `isMobile` conditional from notification button (now shows on mobile too)

### Footer with Theme Toggle
- Created new `ImageStudioFooter.tsx` component
- Left side: Disclaimer text "Disclaimer: AI outputs may sometimes be offensive or inaccurate"
- Right side: Light / Dark / System theme toggle
- Active state uses `--color-on-surface`, inactive uses `--color-on-surface-variant`
- Font: 12px mono

### Theme System Implementation
- Created `ThemeContext.tsx` with ThemeProvider
- Supports three modes: 'light', 'dark', 'system'
- Persists preference to localStorage (`image-studio-theme`)
- Applies `.dark` class to document.documentElement for manual control
- Added `.dark` class CSS rules to `globals.css` alongside media query

### Page Layout Updates
- Changed page from `min-h-screen` to `h-screen overflow-hidden` (100vh, no scroll)
- Navbar padding: `p-4` (16px all around)
- Content area: `px-4 gap-4` (horizontal padding, gap between sidebar and output)
- Removed hardcoded height from sidebar, let flex handle it
- Footer only shows on desktop

### MobileDrawer Theme Fix
- Changed hardcoded `backgroundColor: "#1e1e1e"` to `var(--color-surface)`
- Simplified box shadow for both themes

### Component Updates
- **Tooltip**: Reduced drop shadow from heavy two-layer to subtle `0px 4px 12px rgba(0,0,0,0.15)`
- **SelectionModal**: Added "Select" button that appears on hover (pill-shaped with outline-variant bg)
- **OptionsDropdown**: Selected border and checkmark now use category's `pillColor` instead of hardcoded blue
- **CharacterPicker/PersonaPicker**: Changed "browse" text color to match other labels (`--color-on-surface`)
- **CreateButton**: Replaced clock icon with credits SVG (`Frame 2147230992.svg`), 14px size

### Styling Consistency
- ModeSelector: Labels changed to "character", "u", "char + u", "char + char"
- Section titles: 18px medium
- Description labels: 16px regular
- PillTab sizes increased by 1px each (xs: 13px, sm: 14px, md: 15px)
- Borders standardized to 1.5px with 8% on-brand opacity

### Files Created
- `src/app/experiments/image-studio/context/ThemeContext.tsx`
- `src/app/experiments/image-studio/components/ImageStudioFooter.tsx`

### Files Modified
- `src/app/experiments/image-studio/page.tsx`
- `src/app/experiments/image-studio/components/ImageStudioNavBar.tsx`
- `src/app/experiments/image-studio/components/MobileDrawer.tsx`
- `src/app/experiments/image-studio/components/Sidebar/index.tsx`
- `src/app/experiments/image-studio/components/Sidebar/ModeSelector.tsx`
- `src/app/experiments/image-studio/components/Sidebar/CharacterPicker.tsx`
- `src/app/experiments/image-studio/components/Sidebar/PersonaPicker.tsx`
- `src/app/experiments/image-studio/components/Sidebar/OptionsDropdown.tsx`
- `src/app/experiments/image-studio/components/Sidebar/CreateButton.tsx`
- `src/app/experiments/image-studio/components/shared/Tooltip.tsx`
- `src/app/experiments/image-studio/components/shared/SelectionModal.tsx`
- `src/app/experiments/image-studio/components/shared/PillTab.tsx`
- `src/app/globals.css`
