# 04 — Template System

Books View uses a **Single Engine, Multiple Templates** approach.

One codebase serves different photo album **styles** for different occasions & clients.

---

## Template Philosophy

Each template is a **preset** for:
- Color scheme
- Typography variations
- Layout spacing
- Header/footer styling
- Typography style

**Same core functionality**, different visual personality.

---

## Template Catalog (MVP)

### 1. **Classic** (Default)
Clean, timeless, professional.

**Color Scheme:**
- Primary: Black (#1A1A1A)
- Accent: Warm gold (#D4A574)
- Background: White (#FFFFFF)
- Secondary: Light gray (#F5F5F5)

**Typography:**
- Heading: Serif (Georgia or Playfair Display)
- Body: Sans-serif (Inter)

**Use Case:**
- Wedding, family, traditional events
- Formal, elegant presentation

---

### 2. **Premium**
Luxury, minimal, high-end.

**Color Scheme:**
- Primary: Deep navy (#0A1B2E)
- Accent: Soft silver (#C0C0C0)
- Background: Off-white (#FAFAF7)
- Secondary: Pale beige (#F0E8E0)

**Typography:**
- Heading: Serif (Bodoni or high-contrast)
- Body: Refined sans-serif (Poppins)

**Spacing:**
- Generous (more breathing room)
- 32px gutters, 48px section margins

**Use Case:**
- High-end wedding, luxury brand
- Premium client experience

---

### 3. **Wedding**
Romantic, soft, intimate.

**Color Scheme:**
- Primary: Rose gold (#D8A5A5)
- Accent: Blush pink (#FADADD)
- Background: Ivory (#FFFFF0)
- Secondary: Soft gray (#E8E8E8)

**Typography:**
- Heading: Script or soft serif
- Body: Elegant sans-serif (Lora)

**Decorative Elements:**
- Subtle floral borders
- Ornamental dividers

**Use Case:**
- Wedding album (bride/groom)
- Engagement sessions

---

### 4. **Family**
Warm, friendly, approachable.

**Color Scheme:**
- Primary: Warm brown (#8B6F47)
- Accent: Warm terracotta (#D97860)
- Background: Cream (#FFFBF0)
- Secondary: Light sage (#E8E8E0)

**Typography:**
- Heading: Friendly serif (Merriweather)
- Body: Warm sans-serif (Montserrat)

**Use Case:**
- Family portraits
- Children photography
- Casual events

---

### 5. **Editorial**
Modern, bold, magazine-style.

**Color Scheme:**
- Primary: Charcoal (#2D3436)
- Accent: Bold blue (#0984E3) or red (#FF7675)
- Background: White (#FFFFFF)
- Secondary: Light gray (#DFE6E9)

**Typography:**
- Heading: Bold sans-serif (Montserrat, Urbanist)
- Body: Clean sans-serif (Inter)

**Layout:**
- Grid-based, strict
- Asymmetrical balancing
- Full-width images

**Use Case:**
- Portfolio sessions
- Lifestyle photography
- Magazine-style galleries

---

### 6. **Minimal**
Ultra-clean, distraction-free.

**Color Scheme:**
- Primary: Black (#000000)
- Accent: Gray (#666666)
- Background: White (#FFFFFF)
- Secondary: Very light gray (#FAFAFA)

**Typography:**
- Heading: Minimal sans-serif (Helvetica Neue, Inter)
- Body: Minimal sans-serif (Inter)

**Spacing:**
- Tight, efficient (16px gutters)
- Minimal decoration

**Use Case:**
- Professional gallery
- Photographer portfolio
- Minimalist aesthetic

---

## Template Configuration

Each template is defined by a **theme config file**:

```typescript
// templates/classic.config.ts
export const classicTheme: TemplateConfig = {
  id: 'classic',
  name: 'Classic',
  description: 'Timeless and professional',
  colors: {
    primary: '#1A1A1A',
    accent: '#D4A574',
    background: '#FFFFFF',
    secondary: '#F5F5F5',
  },
  fonts: {
    heading: 'Georgia, serif',
    body: 'Inter, sans-serif',
  },
  spacing: {
    gutter: 24,
    sectionMargin: 32,
  },
  components: {
    header: {
      height: 80,
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E0E0E0',
    },
    gallery: {
      gridColumns: {
        mobile: 2,
        tablet: 3,
        desktop: 4,
      },
      gap: 16,
    },
  },
}
```

---

## Template Selection

### For Customers
1. Studio creates album → **selects template**
2. Generates link → Customer sees album in chosen template
3. Customer doesn't see other templates (one link = one template)

### For Admin
- Dashboard shows available templates
- Template preview before selection
- Can change template after creation (updates live)

---

## Template Switching (Admin)

Admin can change template without re-uploading images:

```
Album Settings → Template → Choose new template → Apply
```

**What changes:**
- ✅ Colors, fonts, spacing
- ✅ Header/footer styling

**What doesn't change:**
- ✅ Images, folder structure
- ✅ Customer selections (tim/sao)
- ✅ Export data

---

## Future Template Ideas

- **Modern** — Contemporary, vibrant colors
- **Boho** — Earthy, natural, organic
- **Neon** — Bold, trendy, Gen-Z vibe
- **Vintage** — Film-inspired, nostalgic
- **Custom** — Client provides colors/fonts (Pro feature)

---

## Technical Implementation

### Template Inheritance

All templates inherit from a **base theme**:

```
BaseTheme
├── Classic
├── Premium
├── Wedding
├── Family
├── Editorial
└── Minimal
```

### CSS Variables

Templates use CSS custom properties for theming:

```css
:root {
  --primary: #1A1A1A;
  --accent: #D4A574;
  --background: #FFFFFF;
  --spacing-gutter: 24px;
  --spacing-section: 32px;
  --font-heading: Georgia, serif;
  --font-body: Inter, sans-serif;
}
```

Components use these variables:

```tsx
<div style={{
  color: 'var(--primary)',
  gap: 'var(--spacing-gutter)',
  fontFamily: 'var(--font-body)',
}}>
  {/* Content */}
</div>
```

---

## Template API

### Get available templates
```
GET /api/templates
Response: [{ id, name, description, preview }]
```

### Get template config
```
GET /api/templates/:id
Response: { colors, fonts, spacing, ... }
```

### Apply template to album
```
POST /api/albums/:albumId/template
Body: { templateId: 'classic' }
Response: { success: true, album }
```

---

## Template Customization (Future)

*Phase 2+: Allow clients to customize templates*

- Custom colors (pick from palette)
- Custom fonts (Google Fonts integration)
- Custom layout (column count, spacing)
- Watermark customization
- Logo upload

---

## Best Practices

✅ **Do:**
- Keep templates visually distinct
- Test all templates in light + dark mode
- Ensure all templates are mobile-responsive
- Document color meanings (when/why each color)

❌ **Don't:**
- Create too many templates (confusing)
- Make templates too different (breaks consistency)
- Use low-contrast color combinations
- Rely on custom CSS per template (use theme config)

---

## Template Roadmap

| Phase | Work |
|-------|------|
| MVP | 3 templates: Classic, Wedding, Minimal |
| Phase 2 | +3 templates: Premium, Family, Editorial |
| Phase 3 | Template customization (colors, fonts) |
| Phase 4 | User-uploaded templates |
