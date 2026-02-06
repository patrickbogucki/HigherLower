# Opus-5 Dark Luxury Design Guide

This document serves as the definitive reference for the Higher/Lower application's visual design system. Use this guide to maintain design consistency across all future development.

---

## Design Philosophy

The Opus-5 "Dark Luxury" design embodies sophistication, refinement, and premium quality. It creates an elegant, immersive experience that feels exclusive and high-end while remaining accessible and usable.

### Core Principles
- **Premium Feel**: Luxurious aesthetics through gold accents and elegant typography
- **Refined Simplicity**: Clean, uncluttered interfaces with purposeful elements
- **Subtle Motion**: Smooth, sophisticated animations that enhance without distracting
- **Visual Hierarchy**: Clear focus on primary actions and content
- **Accessibility**: Maintains readability and usability for all users

---

## Color Palette

### Primary Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Deep Black** | `#0c0c0f` | Primary background color, button text |
| **Champagne Gold** | `#d4af37` | Primary accent color, headings, interactive elements |
| **Light Gold** | `#f4d675` | Gradient highlights, shine effects |
| **Dark Gold** | `#c9a430` | Gradient shadows, button gradients |
| **Warm Cream** | `#e8e4dd` | Body text, primary content text |

### Opacity Variations

The design uses strategic opacity to create depth and hierarchy:

```css
/* Text opacities */
Primary text: #e8e4dd (100%)
Secondary text: rgba(232, 228, 221, 0.4)
Tertiary text: rgba(232, 228, 221, 0.35)
Subtle text: rgba(232, 228, 221, 0.25)
Very subtle text: rgba(232, 228, 221, 0.15)

/* Gold accent opacities */
Full accent: #d4af37 (100%)
Border subtle: rgba(212, 175, 55, 0.2)
Border hover: rgba(212, 175, 55, 0.4)
Background tint: rgba(212, 175, 55, 0.04)
Border very subtle: rgba(212, 175, 55, 0.15)
Gradient overlay: rgba(212, 175, 55, 0.06)
Decorative lines: rgba(212, 175, 55, 0.03)

/* White overlays */
Subtle overlay: rgba(255, 255, 255, 0.02)
Hover overlay: rgba(255, 255, 255, 0.04)
Border overlay: rgba(255, 255, 255, 0.03)
Shine effect: rgba(255, 255, 255, 0.15)
```

### Color Usage Guidelines

1. **Background**: Always use `#0c0c0f` as the primary background
2. **Accents**: Use gold (`#d4af37`) sparingly for emphasis and hierarchy
3. **Text**: Primary content uses `#e8e4dd`, secondary uses reduced opacity
4. **Interactive Elements**: Gold for primary actions, translucent gold for secondary
5. **Decorative Elements**: Use very low opacity gold for subtle texture

---

## Typography

### Font Families

**Primary Display Font: Playfair Display**
- Serif typeface used for headings, logo, and emphasis
- Weights: 400, 500, 600, 700, 800, 900
- Import: `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900`

**Body Font: Inter**
- Sans-serif typeface used for body text, UI elements
- Weights: 300, 400, 500, 600
- Import: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600`

### Typography Scale

```css
/* Hero Title */
font-family: 'Playfair Display', serif
font-size: 72px (desktop) / 48px (mobile)
font-weight: 800
line-height: 1
letter-spacing: -2px
color: white / gold gradient

/* Navigation Logo */
font-family: 'Playfair Display', serif
font-size: 16px
font-weight: 700
letter-spacing: 3px
text-transform: uppercase
color: #d4af37

/* Stats Values */
font-family: 'Playfair Display', serif
font-size: 28px
font-weight: 700
color: #d4af37

/* Input (Game Code) */
font-family: 'Playfair Display', serif
font-size: 20px
font-weight: 600
letter-spacing: 8px

/* Body Text / Subtitle */
font-family: 'Inter', sans-serif
font-size: 16px
font-weight: 400
line-height: 1.6
letter-spacing: 0.5px
color: rgba(232, 228, 221, 0.4)

/* Primary Button */
font-family: 'Inter', sans-serif
font-size: 13px
font-weight: 600
letter-spacing: 3px
text-transform: uppercase

/* Navigation Links */
font-family: 'Inter', sans-serif
font-size: 12px
font-weight: 500
letter-spacing: 2px
text-transform: uppercase

/* Secondary Button / Toggle */
font-family: 'Inter', sans-serif
font-size: 12px
font-weight: 600
letter-spacing: 2px
text-transform: uppercase

/* Stats Labels */
font-family: 'Inter', sans-serif
font-size: 10px
font-weight: 500
letter-spacing: 2px
text-transform: uppercase

/* Corner Marks */
font-family: 'Inter', sans-serif
font-size: 10px
font-weight: 400
letter-spacing: 2px
text-transform: uppercase
```

### Typography Guidelines

1. **Playfair Display** for emphasis, luxury, and display purposes
2. **Inter** for readability, UI elements, and body text
3. **Generous letter-spacing** on uppercase text for readability and elegance
4. **Tight letter-spacing** on large display text for impact
5. **Uppercase transformation** for labels, buttons, and UI elements

---

## Layout Structure

### Z-Index Layers

```
z-index: 0  - Background effects (noise, gradient, lines)
z-index: 1  - Main content container
z-index: 10 - Navigation
```

### Background Effects (Fixed Layers)

1. **Gold Noise Texture**
   - Fixed position overlay
   - Very subtle opacity (0.015)
   - SVG fractal noise pattern
   - Adds premium texture

2. **Gold Gradient Glow**
   - Fixed radial gradient
   - Centered at top
   - Subtle gold emanation (opacity 0.06)
   - Creates soft ambient light

3. **Vertical Lines**
   - 5 vertical lines spanning viewport height
   - Ultra-subtle gold color (opacity 0.03)
   - Spaced across 80% of viewport width
   - Creates architectural structure

4. **Bottom Decoration**
   - Horizontal gradient line at bottom
   - Gold center fading to transparent edges
   - Anchors the design

### Container Structure

```
Root Container (.opus5-body)
  ├── Fixed Background Effects
  │   ├── Gold Noise
  │   ├── Gold Gradient
  │   └── Vertical Lines
  ├── Fixed Navigation (.top-nav)
  │   ├── Logo
  │   └── Nav Links
  ├── Main Content Container (.main-container-5)
  │   └── Hero Content (.hero-content)
  │       ├── Crown Icon
  │       ├── Title
  │       ├── Subtitle
  │       ├── Actions
  │       │   ├── Primary Button
  │       │   ├── Join Toggle
  │       │   └── Join Panel (collapsible)
  │       └── Stats Bar
  └── Fixed Decorative Elements
      ├── Bottom Line
      ├── Corner Mark (BL)
      └── Corner Mark (BR)
```

### Spacing System

```css
/* Container padding */
Main container: 60px vertical, 20px horizontal
Navigation: 24px all sides (desktop) / 16px 24px (mobile)
Hero content: max-width 640px

/* Element spacing */
Crown to title: 32px
Title to subtitle: 8px
Subtitle to actions: 56px
Actions internal gap: 20px
Actions to stats: 64px

/* Stats spacing */
Stat items: 28px 24px padding
Gap between items: 1px

/* Button spacing */
Primary button: 20px 56px padding
Secondary button: 16px 24px padding
Join toggle: 8px 16px padding

/* Input spacing */
Input field: 16px 20px padding
Join panel internal gap: 10px
Join panel top padding: 8px
```

---

## Component Specifications

### Navigation

**Top Navigation Bar**
- Fixed position at top
- Full width
- Flex layout with space-between
- Fade-in animation on mount (0.8s delay)

```css
.top-nav {
  position: fixed;
  top: 0;
  padding: 24px 48px;
  opacity: 0 → 1 (animated)
  transition: opacity 0.8s ease 0.3s;
}
```

**Logo**
- Playfair Display, 16px, weight 700
- Gold color (#d4af37)
- Letter-spacing: 3px
- Text: "H / L"
- Uppercase

**Navigation Links**
- Inter, 12px, weight 500
- Subtle text color (opacity 0.35)
- Hover: Gold color
- Letter-spacing: 2px
- Uppercase
- Gap: 32px between items
- Hidden on mobile

### Hero Section

**Crown Icon**
- 56px × 56px circle
- 1px gold border (opacity 0.2)
- 24px emoji
- Margin-bottom: 32px

**Hero Title**
- Two-line layout
- Line 1: "Higher" (white)
- Line 2: "or Lower" (gold gradient + italic)
- 72px (desktop) / 48px (mobile)
- Weight: 800
- Letter-spacing: -2px

**Gradient Effect**
```css
background: linear-gradient(135deg, #d4af37 0%, #f4d675 50%, #d4af37 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**Subtitle**
- Two-line centered text
- Inter, 16px, weight 400
- Subtle color (opacity 0.4)
- Line-height: 1.6
- Letter-spacing: 0.5px

### Buttons

**Primary Button (.btn-gold)**
- Gold gradient background
- Dark text (#0c0c0f)
- 8px border-radius
- Padding: 20px 56px
- Inter, 13px, weight 600
- Letter-spacing: 3px
- Uppercase
- Shine animation on hover (shimmer effect)
- Lift on hover: translateY(-2px)
- Shadow on hover: 0 8px 32px rgba(212, 175, 55, 0.3)

**Shimmer Effect**
```css
.btn-gold::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%);
  transform: translateX(-100%) → translateX(100%);
  transition: transform 0.6s ease;
}
```

**Secondary Button (.join-toggle)**
- Transparent background
- Subtle text color (opacity 0.35)
- No border
- Hover: Gold color
- Inter, 12px, weight 600
- Letter-spacing: 2px
- Uppercase

**Tertiary Button (.btn-join-gold)**
- Transparent background
- Gold border (opacity 0.2)
- Gold text
- 8px border-radius
- Padding: 16px 24px
- Hover: Background tint (opacity 0.1), stronger border (opacity 0.4)

### Input Field

**Game Code Input (.input-gold)**
- Gold tinted background (opacity 0.04)
- Gold border (opacity 0.15)
- 8px border-radius
- Padding: 16px 20px
- Playfair Display, 20px, weight 600
- Center-aligned text
- Letter-spacing: 8px (for code entry)
- Gold text color
- Focus: Stronger border (opacity 0.4), gold glow shadow

**Placeholder Styling**
- Inter (different from input text)
- 11px, uppercase
- Letter-spacing: 2px
- Very subtle gold (opacity 0.2)

### Join Panel

**Collapsible Panel**
- Max-height animation: 0 → 120px
- Smooth cubic-bezier easing: (0.16, 1, 0.3, 1)
- Duration: 0.5s
- Contains input + button in flex row
- Max-width: 360px

### Stats Bar

**Container**
- Flex row layout
- 1px gap between items
- Very subtle background (white opacity 0.03)
- 12px border-radius
- Max-width: 520px
- Fade-in animation: opacity 0 → 1
- Transition: 0.8s delay 0.5s

**Stat Item**
- Flex: 1 (equal width)
- Padding: 28px 24px
- Subtle background (white opacity 0.02)
- Hover: Slightly stronger background (opacity 0.04)

**Stat Value**
- Playfair Display, 28px, weight 700
- Gold color
- Margin-bottom: 4px

**Stat Label**
- Inter, 10px, weight 500
- Very subtle color (opacity 0.25)
- Uppercase
- Letter-spacing: 2px

### Corner Marks

**Positioning**
- Fixed position
- Bottom: 24px
- Left/Right: 48px
- Hidden on mobile

**Styling**
- Inter, 10px, weight 400
- Very subtle color (opacity 0.15)
- Letter-spacing: 2px
- Uppercase
- Content: "Est. 2025" (left), "v1.0" (right)

---

## Animation & Interaction

### Mount Animations

**Navigation**
```css
Initial: opacity: 0
Final: opacity: 1
Duration: 0.8s
Delay: 0.3s
Easing: ease
```

**Hero Content**
```css
Initial: opacity: 0, translateY(30px)
Final: opacity: 1, translateY(0)
Duration: 1s
Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

**Stats Bar**
```css
Initial: opacity: 0
Final: opacity: 1
Duration: 0.8s
Delay: 0.5s
Easing: ease
```

### Hover Interactions

**Navigation Links**
- Color transition: 0.3s ease
- From subtle (opacity 0.35) to gold

**Primary Button**
- Transform: translateY(-2px)
- Shadow: 0 8px 32px rgba(212, 175, 55, 0.3)
- Shimmer: translateX(100%)
- All transitions: 0.4s ease (0.6s for shimmer)

**Secondary Button**
- Color transition: 0.3s ease
- From subtle to gold

**Tertiary Button**
- Background fade-in: 0.3s ease
- Border color transition: 0.3s ease

**Input Focus**
- Border color transition: 0.3s ease
- Shadow fade-in: 0.3s ease

**Stat Items**
- Background transition: 0.3s ease

### Panel Transitions

**Join Panel**
- Max-height: 0 ↔ 120px
- Duration: 0.5s
- Easing: cubic-bezier(0.16, 1, 0.3, 1) (smooth, slightly bouncy)

### Animation Principles

1. **Subtle & Purposeful**: Animations enhance without distracting
2. **Consistent Timing**: Most transitions use 0.3s - 0.4s
3. **Elegant Easing**: Cubic-bezier for organic motion
4. **Staged Reveals**: Sequential fade-ins create hierarchy
5. **Tactile Feedback**: Lift and shadow on interactive elements

---

## Responsive Design

### Breakpoints

```css
Mobile: max-width: 640px
Desktop: > 640px
```

### Mobile Adaptations

**Typography**
```css
.hero-title: 72px → 48px
```

**Navigation**
```css
.top-nav padding: 24px 48px → 16px 24px
.nav-links: display: none
```

**Decorative Elements**
```css
.corner-bl, .corner-br: display: none
```

### Responsive Strategy

1. **Fluid Typography**: Font sizes scale proportionally
2. **Flexible Containers**: Max-widths and percentages
3. **Hide Secondary Elements**: Navigation links and corner marks on mobile
4. **Maintain Hierarchy**: Core content remains prioritized
5. **Touch-Friendly Targets**: Button sizes remain adequate

---

## Accessibility

### Color Contrast

- **Primary Text on Dark Background**: #e8e4dd on #0c0c0f meets WCAG AA
- **Gold Text on Dark Background**: #d4af37 on #0c0c0f meets WCAG AA
- **Button Text**: #0c0c0f on #d4af37 gradient exceeds WCAG AAA

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .hero-content, .stats-bar, .top-nav {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .btn-gold::before {
    transition: none;
  }
}
```

Users who prefer reduced motion see:
- No fade-in animations
- No slide-in animations
- No shimmer effects
- Instant state changes

### Focus States

- **Input Fields**: Clear visual feedback with border and shadow
- **Buttons**: Cursor pointer indicates interactivity
- **Navigation Links**: Cursor pointer indicates interactivity

### Semantic HTML

- Proper heading hierarchy (h1)
- Semantic button elements
- Proper input labeling (aria-label)
- Semantic navigation structure

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows visual hierarchy
- Focus states provide clear indication

---

## Technical Implementation

### CSS Architecture

**Approach**: Component-scoped CSS-in-JS using React style tags

**Benefits**:
1. Scoped styles prevent conflicts
2. Dynamic values (mounted state)
3. Single-file components
4. Easy to maintain and modify

### State Management

**Mount State**
```javascript
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);
```
Used for entrance animations via opacity and transform

**Join Panel State**
```javascript
const [showJoin, setShowJoin] = useState(false);
```
Controls collapsible join panel max-height

**Code Input State**
```javascript
const [codeValue, setCodeValue] = useState("");
```
Manages game code input with uppercase transformation

### Performance Considerations

1. **Fixed Position Backgrounds**: GPU-accelerated, smooth scrolling
2. **Transform Animations**: Use transform instead of position changes
3. **Opacity Animations**: Hardware-accelerated
4. **Will-Change**: Consider adding for animated elements
5. **Font Loading**: Uses system font stack as fallback

### External Dependencies

**Google Fonts**
```
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap
```

**Font Loading Strategy**: `display=swap` prevents FOIT (Flash of Invisible Text)

---

## Design System Usage

### Creating New Components

When adding new components to the design:

1. **Follow Color Palette**: Use defined colors and opacity values
2. **Match Typography**: Use established font families, sizes, and weights
3. **Consistent Spacing**: Use the spacing system values
4. **Elegant Animations**: Follow animation timing and easing conventions
5. **Maintain Hierarchy**: Gold for primary, subtle for secondary
6. **Test Accessibility**: Ensure contrast and reduced motion support

### Example: Adding a New Button Style

```css
.btn-secondary-luxury {
  /* Follow established patterns */
  padding: 20px 56px; /* Match primary button */
  border: 1px solid rgba(212, 175, 55, 0.2); /* Subtle gold border */
  border-radius: 8px; /* Consistent radius */
  background: transparent;
  color: #d4af37; /* Gold text */
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.4s ease; /* Consistent timing */
}

.btn-secondary-luxury:hover {
  background: rgba(212, 175, 55, 0.1); /* Subtle gold tint */
  border-color: rgba(212, 175, 55, 0.4); /* Stronger border */
  transform: translateY(-2px); /* Consistent lift */
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2); /* Subtle shadow */
}
```

### Example: Adding a New Text Style

```css
.luxury-caption {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(232, 228, 221, 0.35); /* Tertiary text */
  line-height: 1.5;
}
```

---

## Future Considerations

### Potential Enhancements

1. **Dark Mode Toggle**: Already dark, but could offer lighter alternative
2. **Theme Customization**: Allow gold color customization
3. **Animation Intensity**: User preference for animation amount
4. **Enhanced Micro-interactions**: Sound effects, haptics
5. **Loading States**: Skeleton screens matching aesthetic
6. **Error States**: Gold-tinted error messages
7. **Success States**: Celebratory gold animations
8. **Transition Pages**: Fade transitions between routes

### Scalability

The design system is built to scale:

1. **Consistent Patterns**: Easy to replicate across pages
2. **Component-Based**: Modular, reusable components
3. **Design Tokens**: Colors and values easily adjustable
4. **Documentation**: This guide ensures consistency
5. **Accessibility-First**: Built-in considerations

### Maintenance

To maintain design quality:

1. **Reference This Guide**: Always consult before adding new elements
2. **Test Across Devices**: Verify on mobile and desktop
3. **Check Accessibility**: Use automated tools and manual testing
4. **Update Documentation**: Keep this guide current with changes
5. **Review Regularly**: Ensure consistency across codebase

---

## Quick Reference

### Essential Colors
```
Background: #0c0c0f
Gold: #d4af37
Text: #e8e4dd
```

### Primary Fonts
```
Display: Playfair Display
Body: Inter
```

### Key Spacing
```
Section gap: 56-64px
Element gap: 20-32px
Button padding: 20px 56px
```

### Animation Timing
```
Quick: 0.3s
Standard: 0.4s
Slow: 0.8s - 1s
Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

### Border Radius
```
Standard: 8px
Stats bar: 12px
Crown icon: 50% (circle)
```

---

## Conclusion

The Opus-5 Dark Luxury design represents a premium, sophisticated aesthetic that balances elegance with usability. By following this guide, future development can maintain the refined, cohesive experience that defines the Higher/Lower application.

**Remember**: Luxury is in the details. Every color choice, animation timing, and spacing value contributes to the overall premium feel.
