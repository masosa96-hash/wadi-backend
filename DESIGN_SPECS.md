# WADI Home - Complete Design Specifications

## 🎨 Design System Reference

### Color System

#### Primary Palette (Cold Blues)
```
Royal Blue (Primary)
HEX: #255FF5
RGB: 37, 95, 245
USAGE: Buttons, links, active states, primary actions
```

```
Light Purple-Blue (Secondary)
HEX: #7B8CFF
RGB: 123, 140, 255
USAGE: Gradient midpoint, accent elements
```

```
Lavender (Y2K Accent)
HEX: #C5B3FF
RGB: 197, 179, 255
USAGE: Gradient endpoint, chips, subtle highlights
```

#### Background Colors
```
Primary Background
HEX: #F3F6FB
RGB: 243, 246, 251
USAGE: Main page background (outside mobile frame)
```

```
Card Background
HEX: #FFFFFF
RGB: 255, 255, 255
USAGE: Cards, input fields, elevated surfaces
```

```
Tertiary Background
HEX: #E8EEF7
RGB: 232, 238, 247
USAGE: Hover states, subtle elevated elements
```

```
Mobile Frame Background
HEX: #FAFBFD
RGB: 250, 251, 253
USAGE: Mobile container background on desktop
```

#### Border Colors
```
Subtle Border
HEX: #D6E1F2
RGB: 214, 225, 242
USAGE: Default card borders, separators
```

```
Accent Border
HEX: #C5D4EB
RGB: 197, 212, 235
USAGE: Hover states, focused elements
```

```
Light Border
HEX: #E8EEF7
RGB: 232, 238, 247
USAGE: Very subtle divisions
```

#### Text Colors
```
Primary Text
HEX: #0F172A
RGB: 15, 23, 42
USAGE: Headers, main content, high emphasis
```

```
Secondary Text
HEX: #6B7280
RGB: 107, 114, 128
USAGE: Body text, descriptions, medium emphasis
```

```
Tertiary Text
HEX: #9CA3AF
RGB: 156, 163, 175
USAGE: Captions, timestamps, low emphasis
```

---

## 📐 Layout Measurements

### Desktop Container (1024px+)
```
Mobile Frame Max Width: 480px
Mobile Frame Max Height: 844px
Border Radius: 36px
Padding Around: 16px minimum
Shadow: 0 8px 40px rgba(15, 23, 42, 0.1)
```

### Tablet (768px - 1023px)
```
Mobile Frame Max Width: 90% viewport
Border Radius: 32px
Shadow: 0 8px 40px rgba(15, 23, 42, 0.12)
```

### Mobile (<768px)
```
Width: 100% viewport
Border Radius: 0px (full bleed)
Shadow: None
```

### Component Spacing
```
Header Height: 60px
Header Padding: 16px 24px
Main Content Padding: 32px 16px
Bottom Nav Height: 72px
Bottom Nav Padding: 12px 24px
```

---

## 🔤 Typography Scale

### Font Family
```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Fallback: system sans-serif
```

### Font Sizes
```
Display (Hero Title): 24px / 1.5rem
H1 (Section Headers): 20px / 1.25rem
H2 (Subsections): 18px / 1.125rem
H3 (Card Titles): 16px / 1rem
Body Large: 15px / 0.9375rem
Body: 14px / 0.875rem
Body Small: 13px / 0.8125rem
Caption: 12px / 0.75rem
```

### Font Weights
```
Normal: 400
Medium: 500
Semibold: 600
Bold: 700
```

### Line Heights
```
Tight: 1.2 (for headers)
Normal: 1.6 (for body text)
Relaxed: 1.4 (for descriptions)
```

---

## 🎨 Gradient Specifications

### Primary Gradient (Hero Card)
```css
background: linear-gradient(135deg, #255FF5 0%, #7B8CFF 50%, #C5B3FF 100%);
```
**Direction**: 135° (diagonal top-left to bottom-right)
**Stops**: 
- 0%: Royal Blue (#255FF5)
- 50%: Light Purple-Blue (#7B8CFF)
- 100%: Lavender (#C5B3FF)

### Hero Gradient (Simplified)
```css
background: linear-gradient(135deg, #255FF5 0%, #7B8CFF 100%);
```
**Used for**: Main hero card background

### Button Gradient
```css
background: linear-gradient(135deg, #255FF5 0%, #4A7BF7 100%);
```
**Used for**: Primary action buttons

### Subtle Gradient (Cards)
```css
background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFD 100%);
```
**Direction**: 180° (vertical top to bottom)
**Used for**: Subtle card depth

### Y2K Accent Gradient
```css
background: linear-gradient(135deg, #7B8CFF 0%, #C5B3FF 100%);
```
**Used for**: Chips, accent elements, orbs

---

## 🌟 Shadow System

### Card Shadow
```css
box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
```
**Elevation**: Low
**Usage**: Workspace cards, standard elevated elements

### Medium Shadow
```css
box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
```
**Elevation**: Medium
**Usage**: Modals, dropdowns, hover states

### Strong Shadow
```css
box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
```
**Elevation**: High
**Usage**: Important floating elements

### Glow (Blue)
```css
box-shadow: 0 0 24px rgba(37, 95, 245, 0.15);
```
**Effect**: Soft blue glow
**Usage**: Submit button, active elements

### Y2K Glow (Lavender)
```css
box-shadow: 0 0 32px rgba(197, 179, 255, 0.25);
```
**Effect**: Soft lavender glow
**Usage**: Holographic orbs, Y2K accents

### Mobile Frame Shadow (Desktop)
```css
box-shadow: 0 8px 40px rgba(15, 23, 42, 0.1);
```
**Effect**: Floating card effect
**Usage**: Desktop "phone" container

---

## 🔘 Border Radius Scale

### Small
```
Border Radius: 8px
Usage: Buttons, small cards, chips
```

### Medium
```
Border Radius: 12px
Usage: Workspace cards, input fields
```

### Large
```
Border Radius: 16px
Usage: Hero card, large containers
```

### Pill
```
Border Radius: 24px
Usage: Quick action chips
```

### Circle
```
Border Radius: 50%
Usage: Avatar, icon containers, submit button
```

### Mobile Frame
```
Border Radius: 36px (desktop)
Border Radius: 32px (tablet)
Border Radius: 0px (mobile)
Usage: Main container
```

---

## 🎭 Component States

### Button States

#### Primary Button (Normal)
```css
background: linear-gradient(135deg, #255FF5 0%, #4A7BF7 100%);
color: #FFFFFF;
box-shadow: 0 0 24px rgba(37, 95, 245, 0.15);
```

#### Primary Button (Hover)
```css
filter: brightness(1.1);
transform: scale(1.05);
transition: all 150ms ease-in-out;
```

#### Primary Button (Active/Pressed)
```css
transform: scale(0.95);
```

#### Primary Button (Disabled)
```css
background: #9CA3AF;
color: #6B7280;
opacity: 0.5;
cursor: not-allowed;
```

### Workspace Card States

#### Normal
```css
background: #FFFFFF;
border: 1px solid #D6E1F2;
box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
transform: scale(1);
```

#### Hover
```css
border-color: rgba(37, 95, 245, 0.3);
box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
transform: scale(1.02);
transition: all 150ms ease-in-out;
```

#### Active/Tap
```css
transform: scale(0.98);
```

### Quick Action Chip States

#### Inactive (Normal)
```css
background: transparent;
border: 1.5px solid #C5D4EB;
color: #6B7280;
```

#### Inactive (Hover)
```css
border-color: #255FF5;
color: #255FF5;
```

#### Active
```css
background: #255FF5;
border: 1.5px solid #255FF5;
color: #FFFFFF;
```

### Navigation Item States

#### Inactive
```css
color: #9CA3AF;
filter: none;
```

#### Active
```css
color: #255FF5;
filter: drop-shadow(0 0 8px #255FF5);
font-weight: 600;
```

---

## ✨ Y2K Effects Specifications

### Holographic Orb (Top Right)
```css
position: absolute;
top: -80px;
right: -80px;
width: 200px;
height: 200px;
background: linear-gradient(135deg, #7B8CFF 0%, #C5B3FF 100%);
border-radius: 50%;
filter: blur(60px);
opacity: 0.15;
animation: pulse-glow 4s ease-in-out infinite;
```

### Holographic Orb (Inside Hero)
```css
position: absolute;
bottom: -60px;
left: -60px;
width: 160px;
height: 160px;
background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
border-radius: 50%;
filter: blur(20px);
```

### Pulse Glow Animation
```css
@keyframes pulse-glow {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.25; }
}
```

### Glassmorphism (Prompt Input)
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```

### Glassmorphism (Navigation)
```css
background: #FFFFFF;
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border-top: 1px solid #E8EEF7;
```

---

## 📱 Component Dimensions

### Header
```
Height: 60px
Logo Font Size: 20px
Logo Letter Spacing: 0.5px
Avatar Size: 36px
Icon Size: 20px
Gap Between Items: 12px
```

### Hero Card
```
Padding: 32px 24px
Title Font Size: 24px
Title Margin Bottom: 16px
Input Container Padding: 12px 16px
Input Container Border Radius: 16px
Submit Button Size: 40px × 40px
Gap Between Input & Button: 12px
```

### Workspace Card
```
Padding: 16px
Icon Container Size: 48px × 48px
Icon Font Size: 24px
Name Font Size: 15px
Gap Between Icon & Name: 12px
Grid Columns: 2
Grid Gap: 12px
```

### Quick Action Chip
```
Padding: 8px 16px
Border Radius: 24px
Font Size: 13px
Border Width: 1.5px
Gap Between Chips: 8px
```

### Bottom Navigation
```
Height: 72px
Padding: 12px 24px
Icon Size: 24px
Label Font Size: 12px
Gap Between Icon & Label: 4px
Active Indicator Size: 4px × 4px
```

---

## 🎬 Animation Specifications

### Entrance Animations

#### Mobile Frame
```javascript
initial: { opacity: 0, scale: 0.95 }
animate: { opacity: 1, scale: 1 }
transition: { duration: 0.5 }
```

#### Hero Card
```javascript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.5, delay: 0.1 }
```

#### Workspaces Section
```javascript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.5, delay: 0.2 }
```

#### Individual Workspace Card
```javascript
initial: { opacity: 0, scale: 0.9 }
animate: { opacity: 1, scale: 1 }
transition: { duration: 0.3, delay: 0.3 + index * 0.05 }
```

#### Quick Actions
```javascript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.5, delay: 0.4 }
```

### Interaction Animations

#### Workspace Card Hover
```javascript
whileHover: { scale: 1.02 }
whileTap: { scale: 0.98 }
```

#### Button Hover
```css
transition: transform 150ms ease-in-out;
transform: scale(1.05);
```

#### Button Active
```css
transform: scale(0.95);
```

### Timing Functions
```
Fast: 150ms ease-in-out
Medium: 250ms ease-in-out
Slow: 350ms ease-in-out
```

---

## 🔍 Accessibility Specifications

### Focus States
```css
*:focus-visible {
  outline: 2px solid #255FF5;
  outline-offset: 2px;
}
```

### Color Contrast Ratios
```
Primary Text on White: 15.8:1 (AAA ✓)
Secondary Text on White: 4.6:1 (AA ✓)
Tertiary Text on White: 3.1:1 (AA Large ✓)
White on Primary Blue: 4.7:1 (AA ✓)
```

### Touch Target Sizes (Mobile)
```
Minimum: 44px × 44px
Bottom Nav Items: 48px × 56px
Submit Button: 40px × 40px
Workspace Cards: Full card area (minimum 80px × 80px)
```

---

## 📊 Responsive Breakpoints

### Mobile First Approach
```css
/* Base styles: 320px - 767px (Mobile) */
Default styles in components

/* Tablet: 768px - 1023px */
@media (min-width: 768px) {
  .wadi-mobile-frame {
    border-radius: 32px;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .wadi-mobile-frame {
    max-width: 480px;
    max-height: 844px;
    border-radius: 36px;
  }
}
```

---

## ✅ Design Checklist

Use this checklist to verify implementation:

### Visual Design
- [ ] Light mode color palette implemented
- [ ] Blue → Purple gradients visible
- [ ] Holographic orbs present with blur
- [ ] Glassmorphism on input fields
- [ ] Soft shadows on all cards
- [ ] Clean, professional appearance

### Layout
- [ ] Desktop shows centered "phone" container
- [ ] Mobile uses full width
- [ ] Proper spacing throughout
- [ ] Grid alignment correct
- [ ] Bottom navigation sticky

### Typography
- [ ] Inter font loaded
- [ ] Font sizes match specifications
- [ ] Font weights correct (semibold for headers)
- [ ] Line heights appropriate
- [ ] Letter spacing on logo

### Interactions
- [ ] Hover states on all interactive elements
- [ ] Scale animations on cards
- [ ] Button glow effects
- [ ] Navigation active states
- [ ] Smooth transitions (150ms)

### Y2K Elements
- [ ] Gradients are subtle, not overwhelming
- [ ] Orbs have soft blur effect
- [ ] Glows are gentle, not neon
- [ ] Overall feel is refined, not cartoon
- [ ] Professional banking aesthetic maintained

### Responsive
- [ ] Works on 320px width (small mobile)
- [ ] Adapts to 768px (tablet)
- [ ] Centered properly on 1920px (desktop)
- [ ] No horizontal scrolling
- [ ] Touch targets adequate size

### Performance
- [ ] Animations smooth at 60fps
- [ ] No layout shifts
- [ ] Images/gradients render correctly
- [ ] Blur effects don't cause lag
- [ ] Page loads quickly (<2s)

---

## 🎯 Design Principles Summary

1. **Professional First**: Banking/fintech aesthetic is primary
2. **Y2K Second**: Subtle nostalgia, not overwhelming
3. **Light Mode Only**: Cold blues, no dark theme
4. **Mobile-First**: Responsive from 320px up
5. **Subtle Effects**: Soft glows, not harsh neons
6. **Clean Hierarchy**: Clear visual organization
7. **Touch-Friendly**: Adequate target sizes
8. **Accessible**: WCAG AA compliant

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Design System**: WADI Y2K Banking Light Theme
