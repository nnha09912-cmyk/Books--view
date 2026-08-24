# 02 — UI/UX Guideline

## Design System Foundation

Books View dùng **shadcn/ui** + **Tailwind CSS** làm base → Consistent, professional, reusable.

---

## Typography

### Font Stack
```
Heading: "Inter" (sans-serif)
Body: "Inter" (sans-serif)
Mono: "JetBrains Mono" (code blocks)
```

### Scale

| Role | Size | Weight | Line-Height | Usage |
|------|------|--------|------------|-------|
| H1 | 32px | 700 | 1.2 | Page title |
| H2 | 24px | 600 | 1.3 | Section title |
| H3 | 18px | 600 | 1.4 | Subsection |
| Body | 14px | 400 | 1.6 | Default text |
| Small | 12px | 400 | 1.5 | Helper text, captions |
| Button | 14px | 500 | 1.4 | Button labels |

---

## Color Palette

### Light Mode (Default)
```
Background:    #FFFFFF
Surface:       #F5F5F5
Border:        #E0E0E0
Text Primary:  #1A1A1A (90% opacity)
Text Secondary: #666666 (60% opacity)
Accent:        #FF6B6B (Red for like/favorite)
Success:       #51CF66 (Green for confirmation)
Warning:       #FFD700 (Yellow for star)
```

### Dark Mode
```
Background:    #0F0F0F
Surface:       #1A1A1A
Border:        #333333
Text Primary:  #FFFFFF (90% opacity)
Text Secondary: #AAAAAA (60% opacity)
Accent:        #FF8787
Success:       #69DB7C
Warning:       #FFE066
```

### Usage
- **Accent (#FF6B6B)** → Like button, selected state
- **Warning (#FFD700)** → Star button, highlight
- **Success (#51CF66)** → Confirmation, success messages
- **Neutral (#E0E0E0 / #333333)** → Borders, dividers, inactive

---

## Spacing

Dùng **8px base unit** (Tailwind default).

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Small gaps, micro-spacing |
| sm | 8px | Between elements |
| md | 16px | Section spacing |
| lg | 24px | Between sections |
| xl | 32px | Page margins |
| 2xl | 48px | Large spacing, top-level |

**Grid**: 8px, 12 column (mobile), 24 column (desktop).

---

## Navigation

### Structure
```
Dashboard (Admin)
├── Create Album
├── My Albums
│   ├── Album name
│   │   ├── View Gallery
│   │   ├── Export
│   │   └── Settings
│   └── Album statistics
└── Settings

Gallery (Customer)
├── Folder/Album
│   ├── Grid View
│   ├── Lightbox View
│   └── Selection Summary
└── Submit Selections
```

### Header (All Pages)
- Logo / Studio Name (top-left)
- Breadcrumb (if nested)
- Action button (right)
- Dark mode toggle (right)

### Sidebar (Admin Only)
- Collapsible on mobile
- Icons + labels
- Active state highlight

---

## Components

### Buttons

**Variants:**
1. **Primary** (Filled) — Main action
   - Background: Accent
   - Text: White
   - Hover: Darker shade
   - Disabled: 50% opacity

2. **Secondary** (Outline) — Alternative action
   - Border: Accent
   - Text: Accent
   - Background: Transparent
   - Hover: Accent + 10% fill

3. **Ghost** (Text only) — Tertiary action
   - Text: Accent
   - No background/border
   - Hover: Light fill (10%)

**Sizes:**
- sm: 32px height (icon buttons)
- md: 40px height (default)
- lg: 48px height (full-width CTAs)

**States:**
- Normal, Hover, Active, Disabled

---

### Cards

- Background: Surface
- Border: 1px solid Border
- Rounded: 8px (default), 12px (large)
- Padding: 16px (md), 24px (lg)
- Shadow: subtle (elevation on hover)
- Hover: slight lift, border color change

---

### Input Fields

- Border: 1px solid Border
- Rounded: 6px
- Padding: 8px 12px (height 36px)
- Focus: Outline accent, border accent
- Placeholder: Secondary text
- Error state: Red border + error message

---

### Modal / Dialog

- Overlay: 50% black (dark mode: 70% black)
- Modal: Surface background, 12px rounded
- Close button: (X) top-right
- Padding: 24px
- Max-width: 500px (mobile: full - 32px)
- Animation: Fade-in + scale (300ms)

---

### Toast / Notification

**Positions:**
- Bottom-right (default)
- Top-center (fullscreen)

**Types:**
- Success (green bg, green icon)
- Error (red bg, red icon)
- Info (blue bg, info icon)
- Warning (yellow bg, warning icon)

**Duration:**
- Auto-close: 4 seconds
- Dismissable: (X) button always visible

---

### Gallery Grid

- **Desktop:** 4 columns, gap 16px, padding 24px
- **Tablet:** 2-3 columns, gap 12px, padding 16px
- **Mobile:** 1-2 columns, gap 8px, padding 12px
- Aspect ratio: 1:1 (square)
- Lazy load: Skeleton placeholder
- Hover: 10% darken, overlay with action buttons

---

### Lightbox (Full Screen)

- Full viewport, centered
- Close button: Top-left (X)
- Navigation: ← → buttons (sides) or arrow keys
- Info: Image count, title, timestamp (top or bottom)
- Actions: Like/Star buttons (bottom-right)
- Swipe: Left/right on touch (next/prev)
- Zoom: Pinch-to-zoom on mobile
- Animation: Fade-in (200ms)

---

## Design Principles

### 1. **Hierarchy**
- Size, weight, color guide eye to important elements
- Primary action largest/brightest
- Secondary action smaller/muted

### 2. **Consistency**
- All buttons same height (40px default)
- All cards same border radius (8px)
- All spacing multiples of 8px
- All text uses defined scale

### 3. **Contrast**
- Text always legible (WCAG AA minimum)
- Enough space between interactive elements
- Dark/light mode both support this

### 4. **Accessibility**
- Color not only way to communicate (use icons + text)
- All buttons/inputs keyboard navigable
- Focus state visible
- Alt text for all images

### 5. **Feedback**
- Every action → clear response (loading state, success message, etc.)
- Hover/active states on all interactive elements
- Smooth transitions (300ms ease-out)

---

## Animations

### Timing
- Micro-interactions: 200ms
- Transitions: 300ms
- Dialogs: 300ms
- Page load: 400ms

### Easing
- Default: `ease-out` (cubic-bezier(0.2, 0, 0.38, 0.9))
- Bounce: `ease-out-bounce` (playful, not overused)

### Rules
- ✅ Only animate when value changes
- ✅ Use GPU-accelerated properties (transform, opacity)
- ✅ Keep it under 400ms (snappy)
- ❌ Don't animate layout (causes jank)
- ❌ Don't use multiple animation simultaneously

---

## Responsive Breakpoints

```
Mobile:    320px - 640px (1 column)
Tablet:    641px - 1024px (2-3 columns)
Desktop:   1025px+ (4+ columns)
```

---

## Dark Mode

- **Automatic**: Based on system preference or toggle
- **Color shift**: All colors darken, contrast maintained
- **Image display**: Slight brightness boost to prevent washing out

---

## Accessibility Checklist

- [ ] Color contrast ≥ 4.5:1 for text
- [ ] All buttons/inputs keyboard navigable
- [ ] Focus ring visible (2px, accent color)
- [ ] Images have alt text
- [ ] Form errors clearly marked
- [ ] No motion-triggering on load (respect prefers-reduced-motion)
- [ ] Touch targets ≥ 44px
