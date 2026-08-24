# 03 — Design System

Core components used throughout Books View. Built with **shadcn/ui** + **Tailwind CSS**.

---

## Component Inventory

### 1. **Button**

Used for all interactive actions.

**Variants:**
- `primary` (filled, accent background)
- `secondary` (outline, accent border)
- `ghost` (text only)
- `destructive` (red, for delete)

**Sizes:**
- `sm` (32px, icon only)
- `md` (40px, default)
- `lg` (48px, full-width CTA)

**States:**
- Normal, Hover, Active, Disabled, Loading

**Example Usage:**
```tsx
<Button variant="primary" size="md">
  Like This Photo ♥
</Button>
```

---

### 2. **Input**

Form fields for text, email, search.

**Variants:**
- Text input
- Search input
- Password input
- Textarea (multi-line)

**States:**
- Normal, Focus, Filled, Disabled, Error

**Placeholder:** Secondary text color, optional helper text below

**Example Usage:**
```tsx
<Input
  type="text"
  placeholder="Search photos..."
  error="Required field"
/>
```

---

### 3. **Card**

Container for content groups (albums, stats, photo info).

**Variants:**
- Default (white/dark background)
- Interactive (hover lift effect)
- Flat (no shadow)

**Structure:**
- Header (title + icon)
- Body (content)
- Footer (actions)

**Example Usage:**
```tsx
<Card>
  <Card.Header>Album Details</Card.Header>
  <Card.Body>200 photos</Card.Body>
  <Card.Footer>
    <Button>View Gallery</Button>
  </Card.Footer>
</Card>
```

---

### 4. **Modal**

Dialog for confirmations, forms, detailed views.

**Structure:**
- Overlay (semi-transparent)
- Modal box (content)
- Header (title + close button)
- Body (main content)
- Footer (action buttons)

**Sizes:**
- sm (400px max)
- md (500px max)
- lg (600px max)
- fullscreen (mobile)

**Example Usage:**
```tsx
<Modal open={isOpen} onClose={onClose} size="md">
  <Modal.Header>Confirm Delete</Modal.Header>
  <Modal.Body>Delete this album?</Modal.Body>
  <Modal.Footer>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="destructive" onClick={onDelete}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>
```

---

### 5. **Sidebar**

Navigation panel (admin dashboard).

**Features:**
- Collapsible on mobile
- Icons + labels
- Active state highlight
- Smooth collapse/expand

**Structure:**
- Logo/header
- Navigation items
- Footer (settings, logout)

---

### 6. **Toolbar**

Action bar for bulk operations (gallery view).

**Components:**
- Search box
- Filter dropdowns
- Bulk actions (select all, delete)
- View toggle (grid/list)

**Responsive:**
- Desktop: horizontal
- Mobile: sticky top or bottom

---

### 7. **Header**

Top navigation bar (all pages).

**Components:**
- Logo (left)
- Breadcrumb or title (center)
- Action buttons (right)
- Dark mode toggle (right)
- Mobile menu hamburger (right)

**Sticky:** Yes, on scroll

---

### 8. **Toast / Notification**

Temporary message alerts.

**Types:**
- `success` (green)
- `error` (red)
- `info` (blue)
- `warning` (yellow)

**Position:**
- Bottom-right (default)
- Top-center (fullscreen)

**Auto-close:** 4 seconds (customizable)

**Example Usage:**
```tsx
<Toast type="success" message="Photo liked!" />
```

---

### 9. **Dropdown**

Menu for actions or filtering.

**Trigger:** Button, link, or icon

**Items:**
- Text label
- Submenu (if nested)
- Separator
- Disabled state

**Positioning:** Auto (avoid cutoff)

---

### 10. **Loading**

Skeleton loaders & spinners.

**Skeleton:**
- Placeholder for image grid
- Placeholder for card content
- Pulse animation

**Spinner:**
- Circular progress (file upload)
- Linear progress (batch export)

---

### 11. **Empty State**

When no content (empty album, no selections).

**Components:**
- Icon (large, accent color)
- Title (H3)
- Description (small text)
- Action CTA (if applicable)

**Example:**
```
[folder icon]
No photos in this folder
Start uploading to see your photos here
[Upload button]
```

---

### 12. **Badge / Tag**

Small labels for status, categories.

**Variants:**
- Primary (accent background)
- Secondary (outline)
- Ghost (text only)

**Usage:**
- "New", "Featured"
- Status: "Liked", "Downloaded"
- Category tags

---

## Component Library Structure

```
components/
├── ui/
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── button.styles.ts
│   │   └── button.stories.tsx
│   ├── card/
│   │   ├── Card.tsx
│   │   └── card.styles.ts
│   ├── input/
│   ├── modal/
│   ├── sidebar/
│   ├── toolbar/
│   ├── header/
│   ├── toast/
│   ├── dropdown/
│   ├── loading/
│   ├── empty-state/
│   └── badge/
├── gallery/
│   ├── GalleryGrid.tsx
│   ├── Lightbox.tsx
│   └── ImageCard.tsx
├── album/
│   ├── AlbumCard.tsx
│   ├── AlbumList.tsx
│   └── AlbumForm.tsx
└── shared/
    ├── Pagination.tsx
    ├── SearchBox.tsx
    └── BreadcrumbNav.tsx
```

---

## Component Props Pattern

All components follow TypeScript interfaces:

```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
}
```

---

## Component Testing

Each component has:
- Unit tests (Jest)
- Visual regression tests (Storybook)
- Accessibility tests (axe-core)

**Run tests:**
```bash
npm run test
npm run storybook
```

---

## Component Usage Guide

### Button Example
```tsx
import Button from '@/components/ui/button'

export function SubmitForm() {
  return (
    <div>
      <Button variant="primary" size="lg" onClick={handleSubmit}>
        Submit Selections
      </Button>
      <Button variant="ghost" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  )
}
```

### Card Example
```tsx
import Card from '@/components/ui/card'

export function AlbumCard({ album }) {
  return (
    <Card>
      <Card.Header>{album.name}</Card.Header>
      <Card.Body>{album.photoCount} photos</Card.Body>
      <Card.Footer>
        <Button variant="secondary">View Gallery</Button>
      </Card.Footer>
    </Card>
  )
}
```

### Modal Example
```tsx
import Modal from '@/components/ui/modal'

export function DeleteAlbumModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Delete Album?</Modal.Header>
      <Modal.Body>This action cannot be undone.</Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
```

---

## Never

- ❌ Create custom component styles (use shadcn/ui)
- ❌ Bypass Tailwind classes (use design tokens)
- ❌ Hardcode spacing values (use `sm`, `md`, `lg`)
- ❌ Create new button variants (use existing)
- ❌ Mix component libraries (only shadcn/ui)

---

## Always

- ✅ Reuse existing components
- ✅ Follow TypeScript interfaces
- ✅ Test accessibility
- ✅ Support dark mode
- ✅ Write Storybook stories for new components
