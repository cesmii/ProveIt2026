# ProveIT Presentation - Developer Context

## Project Overview

This is an HTML/CSS/JavaScript presentation for CESMII (The Smart Manufacturing Institute) for the ProveIT 2026 event. It features **35 slides** with custom animations, video backgrounds, and interactive elements.

## File Structure

```
ProveIT/
├── index.html              # Main presentation HTML (35 slides, 35 nav dots)
├── sw.js                   # Service worker for offline support (auto-generated)
├── build.sh                # Build script - scans assets, updates versions
├── cleanup-assets.sh       # Find and delete unreferenced assets
├── css/
│   └── presentation.css    # All styles, animations, and media queries
├── js/
│   ├── preloader.js        # Asset preloading and service worker registration
│   ├── slide-config.js     # Transition configuration (edit this for transitions)
│   └── presentation.js     # Navigation, transitions, and interactivity
├── assets/
│   ├── images/             # All images (camelCase filenames, no spaces)
│   └── video/              # Background videos (camelCase filenames)
└── CLAUDE.md               # This file
```

## Key Technical Details

### Resolution & Scaling
- Designed for **1920x1080** (16:9 aspect ratio)
- Viewport forces `width=1920` — mobile devices scale the full design down
- `.slides-container` locks to 16:9 using `max-width: 177.78vh` and `max-height: 56.25vw`
- Responsive font scaling via media queries (12px-18px base)
- **Slide 10 (Simpsons, #slide-10)** has special scaling via `scaleSlide4()` function

### Slide Indexing (1-INDEXED)
Slides use **1-based IDs** that match their position AND the URL hash bookmark number:
- Slide 1 = `#slide-1` (CESMII Title) → URL: `#1`
- Slide 10 = `#slide-10` (Simpsons TV) → URL: `#10`
- Slide 15 = `#slide-15` (Mr. Rogers) → URL: `#15`

**IMPORTANT**: The slide `id` attribute number matches the URL bookmark number exactly.
- Bookmark `#17` → element `id="slide-17"`
- This makes navigation predictable for users

### URL Hash Navigation
- URL updates when navigating (e.g., `http://localhost:8000/#17`)
- Refreshing the page starts on the slide in the hash
- Hash number directly matches the slide ID

## All 35 Slides

| # | ID | Type | Content |
|---|-----|------|---------|
| 1 | `#slide-1` | Title | CESMII Title with hero logo |
| 2 | `#slide-2` | Speakers | Featuring Speakers |
| 3 | `#slide-3` | Title | CESMII Title (repeated) |
| 4 | `#slide-4` | Laptop | Laptop display |
| 5 | `#slide-5` | Question | Question slide (purple bg) |
| 6 | `#slide-6` | Wonderware | i3X Connect with video |
| 7 | `#slide-7` | Question | Constraining Innovation |
| 8 | `#slide-8` | Timeline | ProveIT Timeline |
| 9 | `#slide-9` | Benefits | SM Platform Benefits |
| 10 | `#slide-10` | Simpsons | Simpsons TV clip |
| 11 | `#slide-11` | Bridge | Interoperability Bridge |
| 12 | `#slide-12` | Imperatives | SM Imperatives (click-reveal rows) |
| 13 | `#slide-13` | CMAPI | Working Group (WorkingGroup.png) |
| 14 | `#slide-14` | Speaker | Matthew Parris (Matthew.png) |
| 15 | `#slide-15` | Mr. Rogers | Mr. Rogers Intro (MrRogers_LR.jpg) |
| 16 | `#slide-16` | Seuss | Seuss Book cover |
| 17 | `#slide-17` | Seuss | Seuss Page 1 |
| 18 | `#slide-18` | Seuss | Seuss Page 2 |
| 19 | `#slide-19` | Seuss | Seuss Page 3 |
| 20 | `#slide-20` | Seuss | Seuss Page 4 |
| 21 | `#slide-21` | Seuss | Seuss Page 5 |
| 22 | `#slide-22` | Seuss | Seuss Page 6 |
| 23 | `#slide-23` | Seuss | Seuss Pages 8-9 (merged) |
| 24 | `#slide-24` | Seuss | Seuss Page 10 |
| 25 | `#slide-25` | Seuss | Seuss Page 11 |
| 26 | `#slide-26` | Sphere | Energy Sphere |
| 27 | `#slide-27` | Panel | 7-Speaker Panel |
| 28 | `#slide-28` | i3X | i3X Connect (static image in monitor frame) |
| 29 | `#slide-29` | Speaker | Anthony Huffman (Anthony.png) |
| 30 | `#slide-30` | Georgia-Pacific | Logo (GeorgiaPacific_Logo.png, 40% centered) |
| 31 | `#slide-31` | Georgia-Pacific | Content (GP_1.png, black bg) |
| 32 | `#slide-32` | Georgia-Pacific | Content (GP_2.png, black bg) |
| 33 | `#slide-33` | Georgia-Pacific | Summary (GP_Summary.png, 85% size) |
| 34 | `#slide-34` | Engage | All Three Audiences (3-column auto-animated) |
| 35 | `#slide-35` | Engage | QR Code |

## Transition System (REFACTORED)

Transitions are now configured in **`js/slide-config.js`** instead of hardcoded in the JS. This makes adding/removing slides much easier.

### slide-config.js Structure

```javascript
const SlideConfig = {
    transitions: {
        // Use slide IDs, not indices
        'slide-1→slide-2': 'logoShrink',      // One-way transition
        'slide-9↔slide-10': 'alvaro',         // Bidirectional
        'slide-11→slide-12': 'wipe',
        'slide-12→slide-13': 'crossfade',
        'slide-13→slide-14': 'crossfade',
        'slide-14→slide-15': 'misterRogers',   // Musical transition with audio
        'slide-15→slide-16': 'crossfade',
        'slide-16→slide-17': 'wipe',
        'slide-25→slide-26': 'crossfade',      // Seuss to Energy Sphere
        'slide-29→slide-30': 'crossfade',      // Georgia-Pacific slides
        'slide-30→slide-31': 'crossfade',
        'slide-31→slide-32': 'crossfade',
        'slide-32→slide-33': 'crossfade',
        'slide-33↔slide-34': 'hartzet',        // To Engage slides
    },
    groups: {
        engage: ['slide-34', 'slide-35'],
        seuss: ['slide-17', 'slide-18', ... 'slide-25'],  // Page turn group
    },
    groupTransitions: {
        engage: 'engageBox',
        seuss: 'pageTurn',
    },
    slideLinks: {
        'slide-4': 'https://fred.stlouisfed.org/...',   // Opens URL on click
        'slide-28': 'https://connect.cesmii.org/i3x',
    },
};
```

### Available Transition Handlers

| Handler | Effect |
|---------|--------|
| `logoShrink` | Hero logo shrinks to corner |
| `logoExpand` | Corner logo expands to hero |
| `alvaro` | Futuristic diagonal panels close/open |
| `wipe` | Left-to-right clip-path wipe |
| `cube` | 3D cube rotation |
| `misterRogers` | i3X circle expand + audio (Web Animations API) |
| `crossfade` | Fade out current to reveal next (z-index layered) |
| `dissolve` | Opacity dissolve |
| `hartzet` | Slide-in from right with bounce |
| `engageBox` | Vertical slide on content box only |
| `pageTurn` | 3D page turn with fold/shadow |

### Adding a New Transition

1. Add entry in `slide-config.js`:
   ```javascript
   'slide-X→slide-Y': 'myTransition',
   ```

2. Add handler in `presentation.js` transitionHandlers object:
   ```javascript
   myTransition: (index) => playMyTransition(index),
   ```

3. Create `playMyTransition(index)` function that calls `performSlideChange(index)` at the right moment.

## Slide ID Helpers (INSERTION-SAFE)

The code now uses helper functions instead of hardcoded indices, making it safe to insert/remove slides:

```javascript
// Check if current slide matches an ID
if (isCurrentSlide('slide-7')) { ... }

// Check if target slide matches an ID
if (isTargetSlide(index, 'slide-8')) { ... }

// Get slide ID for any index
const id = getSlideId(index);
```

All transition functions are now generic — they use `slides[currentSlide]` and `slides[index]` instead of `getElementById('slide-N')`.

## Nav Dots

- **Hidden by default**, fade in when mouse is near (within ~4rem)
- Reduced opacity (25% normal, 50% active)
- **Tooltips** show "Slide N" on hover (generated dynamically)
- Located in right sidebar, 2-column grid layout

## Slide-Specific Behaviors

### Slide 10 (Simpsons TV, #slide-9)
- Fixed 1920x1080 content scaled via `scaleSlide4()` function
- Click TV image to play/pause video (always muted)

### Slide 12 (SM Imperatives, #slide-12)
- Rows reveal on click (reverse order: row 3, row 2, row 1)
- Navigation advances only after all 3 rows are revealed

### Slides 14 & 29 (Speaker Slides)
- Simplified to single PNG foregrounds (`Matthew.png`, `Anthony.png`)
- Use `.speaker-full-image` class with `object-fit: contain`

### Slide 4 (Laptop/FRED)
- Content scaled to 60% (`transform: scale(0.6)`)
- Clicking foreground opens FRED website in new tab

### Slide 15 (Mr. Rogers Intro)
- Full-screen image (`MrRogers_LR.jpg`)
- `misterRogers` transition from Matthew Parris (plays audio with i3X circle expand)
- Audio fades out over 2 seconds when leaving slide
- Crossfade transition to Seuss book

### Slides 16-25 (Seuss Book)
- Slide 16 is the book cover
- Slides 17-25 are pages with page-turn animation
- Slide 16→17 uses wipe (not page turn)
- Click anywhere triggers page turn for slides in seuss group

### Slide 26 (Energy Sphere)
- Video scaled to 85% (`transform: translate(-50%, -50%) scale(0.85)`)

### Slide 28 (i3X Connect)
- Static screenshot (`i3Xscreen.png`) inside computer monitor frame
- Content scaled to 60% (`transform: scale(0.6)`)
- Clicking foreground opens i3X Connect website in new tab
- CSS: `.Computer-i3x .monitor-website` positions image inside monitor frame

### Georgia-Pacific Slides (30-33)
- Slide 30: Logo centered at 40% with video background
- Slides 31-32: Black background with fullscreen images
- Slide 33: Video background with 85% size image
- All use crossfade transitions between them

### Engage Slides (34-35)
- Slide 34: Three-column layout with auto-animated persona columns (Platform Providers, Domain Experts, Everyone)
- Columns stagger in with fade-up animation (0.5s, 1.5s, 2.5s delays)
- Animation resets when leaving and replays on re-entry
- Slide 35: QR code with engageBox transition from slide 34

## Navigation

Supported inputs:
- **Keyboard**: Arrow keys, Space, PageUp/PageDown, Home/End
- **Slide number jump**: Type slide number + Enter (within 3 seconds)
- **Mouse wheel**: Scroll to navigate
- **Click**: Left third = previous, right two-thirds = next
- **Touch**: Swipe up/down
- **Nav dots**: Hover to reveal, click to jump
- **URL hash**: Direct link to any slide (e.g., `#27`)

### Slide Links (Click to Open URL)

Some slides open a URL in a new tab when clicking on foreground content:
- Configured in `slide-config.js` under `slideLinks`
- Only triggers on `.slide-content` clicks (not background)
- Automatically advances to next slide after opening
- Example: Slide 4 opens FRED website, Slide 28 opens i3X Connect

## Adding/Removing Slides (REQUIRES RENUMBERING)

When adding or removing slides, **you MUST renumber all subsequent slide IDs** to maintain the 1-indexed system where `id="slide-N"` matches bookmark `#N`.

### Adding a Slide

1. **Insert the slide HTML** in `index.html` at the desired position
2. **Renumber all subsequent slide IDs** — if inserting at position 15:
   - Old slide-15 → slide-16
   - Old slide-16 → slide-17
   - ... and so on for ALL slides after the insertion point
3. **Add a nav dot** in `.slide-nav` (keep sequential `data-slide` values 0-based internally)
4. **Update `slide-config.js`**:
   - Renumber all transition keys that reference affected slides
   - Update `groups` arrays with new slide IDs
5. **Update CSS selectors** if any use `#slide-N` for affected slides

### Removing a Slide

1. **Remove the slide HTML** from `index.html`
2. **Renumber all subsequent slide IDs** — if removing position 12:
   - Old slide-13 → slide-12
   - Old slide-14 → slide-13
   - ... and so on
3. **Remove the corresponding nav dot**
4. **Update `slide-config.js`** — renumber affected transitions and groups
5. **Update CSS selectors** if any use `#slide-N` for affected slides

### CRITICAL: Use Word-Boundary-Safe Patterns

When renumbering with sed or search/replace, **avoid patterns that match partial numbers**:
- ❌ `s/slide-1/slide-2/` — also matches `slide-10`, `slide-11`, etc.
- ✅ `s/slide-1"/slide-2"/` — only matches exact `slide-1"`
- ✅ `s/id="slide-1"/id="slide-2"/` — explicit attribute match

The safest approach is to manually edit each affected slide ID or use precise patterns like `slide-N"` or `'slide-N'`.

### Example: Inserting a slide at position 15

Files to update:
- `index.html`: Insert new slide with `id="slide-15"`, renumber slide-15→16, slide-16→17, etc.
- `index.html`: Add nav dot, update `data-slide` values and `aria-label` numbers
- `slide-config.js`: Update all transitions like `slide-15→slide-16` to `slide-16→slide-17`
- `slide-config.js`: Update group arrays (e.g., seuss group slide IDs)
- `css/presentation.css`: Update any `#slide-N` selectors

## CSS Architecture

### Brand Colors (CSS Variables)
```css
--primary-blue: #4084ef;
--cyan: #00aeef;
--blue: #2b47da;
--purple: #5438d4;
--magenta: #c41ead;
```

### Key Classes
- `.slide` - Base slide container
- `.slide.active` - Currently visible slide
- `.slide-background` - Video/image background layer
- `.slide-content` - Foreground content layer
- `.video-bg` - Full-cover video backgrounds
- `.speaker-full-image` - Full-slide speaker PNG
- `.slide.wiping` / `.slide.wiping-in` - Generic wipe transition classes

## External Dependencies

- Google Fonts: Bitter, Open Sans (loaded via CSS)
- No JavaScript frameworks - vanilla JS only
- Videos must be MP4 format for cross-browser support

## Browser Support

Tested for modern browsers (Chrome, Firefox, Safari, Edge). Uses:
- CSS Grid/Flexbox
- CSS Custom Properties
- CSS Transforms (3D)
- CSS `clip-path` (polygon animations)
- Viewport units

## Recent Changes (Feb 2026)

1. **Converted to 1-indexed slide IDs** — `id="slide-N"` now matches bookmark `#N`
2. **Added Mr. Rogers slide** — position 15 (`MrRogers_LR.jpg`)
3. **Merged Seuss pages 8-9** — combined into single slide with `page8-9.png`
4. **Now 35 slides total** — renumbered all IDs sequentially
5. **Created `slide-config.js`** — transition configuration is separate
6. **Refactored all transitions** — generic functions using `slides[]` array
7. **Added slide ID helpers** — `isCurrentSlide()`, `isTargetSlide()`, `getSlideId()`
8. **Removed flag wave transitions** — replaced with simple wipe
9. **Simplified speaker slides** — single PNG foregrounds
10. **Added URL hash navigation** — deep linking to slides
11. **Improved nav dots** — hidden until hover, tooltips on hover
12. **Fixed page turn double-press issue** — slide 16-17 now uses wipe, not page turn
13. **Added slide number keyboard navigation** — type number + Enter to jump
14. **Added slide links feature** — click foreground to open URL in new tab (slides 4, 28)
15. **Mr. Rogers musical transition** — slide 14→15 plays audio with 2-second fade out
16. **Fixed mobile viewport** — forces 1920px width scaling on mobile devices
17. **Removed scale transforms** — `.slide.prev`/`.slide.next` no longer scale (fixes size glitches)
18. **Updated slide 13** — replaced with single WorkingGroup.png image
19. **Scaled down slides 4 & 28** — content at 60% to allow background clicks
20. **Added Georgia-Pacific slides (30-33)** — logo, content, and summary slides with crossfade transitions
21. **Renumbered Engage slides** — now slides 34-35 (were 34-37, consolidated 3 audience slides into one)
22. **Added cache-busting** — CSS/JS links include `?v=N` query string to prevent browser/CDN caching issues
23. **Added preloader** — shows loading progress, waits for all assets before starting presentation
24. **Added service worker** — caches all assets for offline capability
25. **Renamed all assets to camelCase** — removed spaces from all filenames
26. **Added cleanup-assets.sh** — script to find and delete unreferenced assets
27. **Deleted 114 unused assets** — reduced from ~185 to ~78 assets (~50MB saved)
28. **Reversed wipe transition direction** — now wipes left-to-right
29. **Replaced iframe on slide 28** — now uses static image `i3Xscreen.png` in monitor frame
30. **Added crossfade transitions** — slides 13→14 and 25→26 now use crossfade
31. **Mr. Rogers transition uses Web Animations API** — replaced CSS `@keyframes` with `logo.animate()` for reliable cross-browser performance (see below)
32. **Fixed crossfade transition** — uses z-index layering (next slide behind, current fades out) instead of dual independent fades that flashed black

## Web Animations API (Mr. Rogers Transition)

The i3X circle transition (slide 14→15) uses the **Web Animations API** (`element.animate()`) instead of CSS `@keyframes`. This was necessary because:

1. **Firefox defers rendering for `visibility: hidden` elements** — CSS animations on elements transitioning from `visibility: hidden` to `visible` would skip initial frames on "stale" first runs
2. **CSS animation warm-up tricks don't work reliably** — running invisible dry-runs, forcing reflows, `will-change`, and `img.decode()` were all insufficient for Firefox
3. **`setTimeout` coordination with CSS animations is unreliable** — JS timers and CSS animation progress aren't synchronized, causing 1-in-5 failures

**How it works now:**
- Animation keyframes defined in JS (`i3xKeyframes` array in `presentation.js`)
- Overlay shown via inline styles (not CSS class toggle) for instant visibility
- `logo.animate(keyframes, timing)` starts rendering on the very next frame
- `anim.onfinish` callback handles cleanup reliably
- Slide crossfade starts at 1.3s via `setTimeout` (safe because circle covers screen by then)
- `performSlideChange()` called only at the end for bookkeeping (classes, nav dots, URL hash)

**Key lesson:** When CSS animations need to be reliable on first run across browsers, prefer the Web Animations API. It bypasses CSS class transition delays and compositor layer promotion issues.

## Crossfade Transition

The `playBackgroundCrossfade()` function uses z-index layering instead of dual independent opacity fades:
- Next slide is shown at **full opacity behind** the current slide (z-index: 1 vs 2)
- Only the current slide fades out, revealing the next slide underneath
- This eliminates the flash-to-black that occurred when both slides were semi-transparent simultaneously

## Preloader

The presentation shows a loading screen while preloading all images and videos. This ensures smooth playback even on slow connections.

**How it works:**
1. `js/preloader.js` runs first, scans DOM for all `<img>` and `<video>` elements
2. Shows progress bar as each asset loads
3. Hides preloader and reveals presentation when 100% complete
4. Video timeout: 10 seconds per video (won't block forever on slow connections)

**Files:**
- `js/preloader.js` — preloading logic and progress tracking
- CSS in `presentation.css` — `.preloader` styles

## Offline Support (Service Worker)

The presentation can work completely offline after the first load.

**How it works:**
1. `sw.js` is registered on page load
2. On install, caches all assets (images, videos, CSS, JS)
3. On fetch, serves from cache first, falls back to network
4. New versions are cached automatically

**Files:**
- `sw.js` — service worker with asset list
- Registered in `js/preloader.js`

**Updating the cache:**
When adding new assets, update the `ASSETS_TO_CACHE` array in `sw.js` and increment the `CACHE_NAME` version (e.g., `'proveit-v3'`).

**Testing offline:**
1. Load the presentation once with internet
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Refresh — should still work

## Asset Naming Convention

**All asset filenames must use camelCase with NO SPACES.**

Examples:
- ✅ `arrowRight.png`, `page1.png`, `misterRogersThemeAudio.mp3`
- ❌ `Arrow Right.png`, `Page 1.png`, `Mister Rogers Theme Audio.mp3`

This ensures compatibility across all systems and avoids URL encoding issues.

## Cleanup Script

Run `./cleanup-assets.sh` to find unreferenced assets:

```bash
./cleanup-assets.sh           # List unused assets
./cleanup-assets.sh --delete  # Delete unused assets
```

The script:
1. Scans all files in `assets/images/` and `assets/video/`
2. Checks for references in HTML, CSS, JS, and MD files
3. Reports unused files with sizes
4. Optionally deletes them (with `--delete` flag)

**After deleting assets, run `./build.sh` to update the service worker.**

## Build Script

Run `./build.sh` before deploying to:
1. Scan all assets (images, videos, audio)
2. Update `sw.js` with complete asset list
3. Bump version numbers in `index.html`

```bash
./build.sh
```

Output:
- Detects current version, increments by 1
- Finds all files in `assets/images/`, `assets/video/`
- Regenerates `sw.js` with `ASSETS_TO_CACHE` array
- Updates `?v=N` query strings in `index.html`

**Always run this script after adding/removing assets.**

## Cache Busting

When deploying updates, browser and CDN caching can cause the deployed version to show old CSS/JS. The asset links in `index.html` include version query strings:

```html
<link rel="stylesheet" href="css/presentation.css?v=2">
<script src="js/slide-config.js?v=2"></script>
<script src="js/presentation.js?v=2"></script>
```

**When making significant changes, increment the version number** (e.g., `?v=3`) to force browsers to fetch fresh files. This is especially important after changing:
- CSS transforms or sizing
- Transition configurations
- Navigation behavior
