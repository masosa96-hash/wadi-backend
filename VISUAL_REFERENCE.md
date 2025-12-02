# WADI Home - Visual Component Reference

## 🎨 Quick Visual Guide

This document shows the exact layout and styling of each component on the Home screen.

---

## 📱 Full Layout (Mobile View)

```
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║ WADI              🔔●   👤   ║  │ ← Header (60px)
│  ╠═══════════════════════════════╣  │
│  ║                               ║  │
│  ║   ╔═══════════════════════╗   ║  │
│  ║   ║  🌈 Gradient Hero     ║   ║  │
│  ║   ║                       ║   ║  │
│  ║   ║ ¿En qué te ayudo hoy? ║   ║  │ ← Hero Card
│  ║   ║                       ║   ║  │   (Gradient bg)
│  ║   ║ ┌───────────────────┐ ║   ║  │
│  ║   ║ │ Escribí prompt... │✈️║   ║  │
│  ║   ║ └───────────────────┘ ║   ║  │
│  ║   ╚═══════════════════════╝   ║  │
│  ║                               ║  │
│  ║   Mis Workspaces              ║  │
│  ║                               ║  │
│  ║   ┌─────────┬─────────────┐   ║  │
│  ║   │  🔍     │    ✍️      │   ║  │ ← Workspace Grid
│  ║   │Research │ Copywriting │   ║  │   (2 columns)
│  ║   ├─────────┼─────────────┤   ║  │
│  ║   │  💡     │    💰       │   ║  │
│  ║   │ Ideas   │  Finanzas   │   ║  │
│  ║   └─────────┴─────────────┘   ║  │
│  ║                               ║  │
│  ║   ┌──────────┐┌──────────┐    ║  │
│  ║   │Historial ││ Favoritos│    ║  │ ← Quick Actions
│  ║   └──────────┘└──────────┘    ║  │   (Chips)
│  ║   ┌──────────────────────┐    ║  │
│  ║   │Plantillas rápidas    │    ║  │
│  ║   └──────────────────────┘    ║  │
│  ║                               ║  │
│  ╠═══════════════════════════════╣  │
│  ║   🏠     💼     📜     👤   ║  │ ← Bottom Nav
│  ║  Home  Spaces  Hist   Perfil ║  │   (Sticky, 72px)
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘
```

---

## 🖥️ Desktop View (Centered "Phone")

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                  (Light bluish background)               │
│                         #F3F6FB                          │
│                                                          │
│              ┌────────────────────────┐                  │
│              │ ╔══════════════════╗  │                  │
│              │ ║ WADI      🔔  👤║  │ ← 480px wide      │
│              │ ╠══════════════════╣  │   "phone"        │
│              │ ║                  ║  │   container      │
│              │ ║  🌈 Hero Card    ║  │   36px radius    │
│              │ ║  [Gradient bg]   ║  │                  │
│              │ ║  ┌────────────┐  ║  │                  │
│              │ ║  │ Prompt...  │  ║  │                  │
│              │ ║  └────────────┘  ║  │                  │
│              │ ║                  ║  │                  │
│              │ ║  Workspaces      ║  │                  │
│              │ ║  ┌────┬────┐    ║  │                  │
│              │ ║  │ 🔍 │ ✍️ │    ║  │                  │
│              │ ║  ├────┼────┤    ║  │                  │
│              │ ║  │ 💡 │ 💰 │    ║  │                  │
│              │ ║  └────┴────┘    ║  │                  │
│              │ ║                  ║  │                  │
│              │ ║  [Chips]         ║  │                  │
│              │ ╠══════════════════╣  │                  │
│              │ ║ 🏠 💼 📜 👤    ║  │                  │
│              │ ╚══════════════════╝  │                  │
│              └────────────────────────┘                  │
│                     ↑                                    │
│              Soft shadow (depth)                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Details

### 1️⃣ Header Bar

```
┌─────────────────────────────────────────┐
│  WADI                     🔔●     👤   │
│  ▲                         ▲       ▲    │
│  │                         │       │    │
│  Logo                   Bell    Avatar  │
│  (Royal blue)          (Red dot) (36px) │
│  20px, uppercase                        │
└─────────────────────────────────────────┘

Styling:
- Background: #FFFFFF
- Height: 60px
- Padding: 16px 24px
- Border bottom: 1px solid #E8EEF7
```

### 2️⃣ Hero Card (Main Prompt)

```
┌─────────────────────────────────────────┐
│  ╔═════════════════════════════════╗    │
│  ║  🌈 GRADIENT BACKGROUND         ║    │
│  ║  (Blue #255FF5 → Purple #7B8CFF)║    │
│  ║                                 ║    │
│  ║     ¿En qué te ayudo hoy?       ║    │
│  ║                                 ║    │
│  ║  ┌──────────────────────────┐   ║    │
│  ║  │ Escribí tu prompt...    ✈️│   ║    │
│  ║  └──────────────────────────┘   ║    │
│  ║      ▲                      ▲   ║    │
│  ║      Input field         Submit ║    │
│  ║   (White, blurred bg)    (40px) ║    │
│  ║                                 ║    │
│  ║  • Holographic orb (blurred)    ║    │
│  ╚═════════════════════════════════╝    │
└─────────────────────────────────────────┘

Styling:
- Background: linear-gradient(135deg, #255FF5, #7B8CFF)
- Border radius: 16px
- Padding: 32px 24px
- Shadow: 0 0 24px rgba(37, 95, 245, 0.15)
- Orb: 160px, blur(20px), bottom-left
```

### 3️⃣ Workspace Card

```
┌──────────────────┐
│   ┌────────┐     │
│   │   🔍   │     │ ← Icon (48px circle)
│   └────────┘     │   Background: #255FF515
│                  │   Border: 2px #255FF530
│   Research       │ ← Name (15px, semibold)
│                  │
└──────────────────┘

Styling:
- Background: #FFFFFF
- Border: 1px solid #D6E1F2
- Border radius: 12px
- Padding: 16px
- Shadow: 0 2px 8px rgba(15, 23, 42, 0.06)
- Hover: scale(1.02), enhanced shadow
```

### 4️⃣ Quick Action Chip

```
┌──────────────┐
│  Historial   │ ← Inactive (transparent bg, blue border)
└──────────────┘

┌──────────────┐
│  Favoritos   │ ← Active (blue bg #255FF5, white text)
└──────────────┘

Styling:
- Border radius: 24px (pill)
- Padding: 8px 16px
- Font size: 13px, medium weight
- Border: 1.5px solid
- Inactive: border #C5D4EB, text #6B7280
- Active: bg #255FF5, text #FFFFFF
- Hover: border → #255FF5, text → #255FF5
```

### 5️⃣ Bottom Navigation Item

```
   🏠        💼        📜        👤
  Home    Workspaces Historial Perfil
   ●
  ▲
Active indicator (4px dot)

Active Item:
- Icon: filter: drop-shadow(0 0 8px #255FF5)
- Text: color #255FF5, weight 600
- Indicator: background #255FF5, shadow

Inactive Item:
- Icon: no filter
- Text: color #9CA3AF, weight 400
- No indicator
```

---

## 🎨 Color Applications

### Background Colors in Layout

```
Desktop Page Background:    #F3F6FB (soft bluish)
Mobile Frame Background:    #FAFBFD (very light)
Card Backgrounds:           #FFFFFF (pure white)
Hero Card:                  Gradient (blue → purple)
Input Field:                rgba(255,255,255,0.95) (white glass)
```

### Text Colors in Use

```
"WADI" Logo:                #255FF5 (royal blue)
"¿En qué te ayudo hoy?":    #FFFFFF (white on gradient)
"Mis Workspaces":           #0F172A (primary text)
Workspace Names:            #0F172A (primary text)
Quick Actions (inactive):   #6B7280 (secondary text)
Quick Actions (active):     #FFFFFF (white on blue)
Nav Labels (active):        #255FF5 (royal blue)
Nav Labels (inactive):      #9CA3AF (tertiary text)
```

### Border Colors in Use

```
Header Border:              #E8EEF7 (light)
Card Borders:               #D6E1F2 (subtle)
Card Borders (hover):       rgba(37, 95, 245, 0.3) (blue tint)
Chip Borders (inactive):    #C5D4EB (accent)
Chip Borders (hover):       #255FF5 (primary)
Chip Borders (active):      #255FF5 (primary)
```

---

## ✨ Y2K Effects Visualization

### Holographic Orb (Top Right)

```
        🌈●
       ●  ●
      ●    ● ← 200px circle
     ●  🌈  ●   Gradient: #7B8CFF → #C5B3FF
      ●    ●    Blur: 60px
       ●  ●     Opacity: 0.15 (pulsing)
        ●

Position: top: -80px, right: -80px (partially off-screen)
Animation: pulse-glow 4s ease-in-out infinite
```

### Gradient Flow (Hero Card)

```
#255FF5 ────────────→ #7B8CFF
(Royal Blue)      (Light Purple-Blue)

Direction: 135° diagonal (top-left to bottom-right)
Effect: Smooth color transition
Orb overlay: Soft white radial gradient (blurred)
```

### Glow Effect (Submit Button)

```
        ✈️  ← Paper plane icon
       ╱  ╲
      │ ✈️ │ ← 40px circle
      ╲    ╱
       ╲  ╱
     ~ ~ ~ ~ ← Glow
   ~         ~   Shadow: 0 0 24px rgba(37, 95, 245, 0.15)
  ~           ~  Color: Blue with 15% opacity
   ~         ~
     ~ ~ ~ ~

Hover: scale(1.05), enhanced glow
Active: scale(0.95)
```

### Glassmorphism (Input Field)

```
┌─────────────────────────────────┐
│ Escribí tu prompt...           ✈️│
└─────────────────────────────────┘
     ▲
Background: rgba(255, 255, 255, 0.95)
Backdrop filter: blur(10px)
Effect: See-through white with blur
```

---

## 📏 Spacing Reference

### Gaps Between Elements

```
Header to Hero Card:        32px
Hero Card to Workspaces:    32px
Section title to Grid:      16px
Between Workspace Cards:    12px
Workspaces to Quick Actions: 24px
Quick Actions to Bottom Nav: 64px (auto-push)
```

### Padding Inside Elements

```
Header:                     16px 24px
Hero Card:                  32px 24px
Workspace Card:             16px
Quick Action Chip:          8px 16px
Bottom Nav:                 12px 24px
Input Field Container:      12px 16px
```

---

## 🎬 Animation Sequences

### Page Load Animation (0-2 seconds)

```
0.0s: Mobile frame appears (fade + scale up)
0.1s: Header visible
0.2s: Hero card slides up
0.3s: Workspace 1 scales in
0.35s: Workspace 2 scales in
0.4s: Workspace 3 scales in
0.45s: Workspace 4 scales in
0.5s: Quick actions slide up
∞: Orb pulse continues (4s loop)
```

### Hover Animations

```
Workspace Card Hover:
  transform: scale(1) → scale(1.02)
  duration: 150ms ease-in-out

Submit Button Hover:
  transform: scale(1) → scale(1.05)
  glow: enhanced
  duration: 150ms ease-in-out

Quick Action Chip Hover:
  border-color: #C5D4EB → #255FF5
  color: #6B7280 → #255FF5
  duration: 150ms ease-in-out
```

---

## 🎯 Comparison: Desktop vs Mobile

### Desktop (1024px+)

```
Container:     Centered, 480px max-width
Border Radius: 36px (phone-like)
Shadow:        Visible depth effect
Background:    #F3F6FB visible around
Height:        Max 844px (scrollable)
```

### Mobile (<768px)

```
Container:     Full width (100%)
Border Radius: 0px (edge-to-edge)
Shadow:        None
Background:    Not visible
Height:        100vh (full screen)
```

### Same Across All Sizes

```
✓ Header layout
✓ Hero card design
✓ Workspace grid (2 columns)
✓ Bottom navigation
✓ All interactions
✓ Color scheme
✓ Typography
```

---

## ✅ Visual Checklist

Use this to verify your implementation:

### Colors & Gradients

- [ ] Page background is soft bluish (#F3F6FB)
- [ ] Cards are pure white (#FFFFFF)
- [ ] Hero card has blue→purple gradient
- [ ] Text is dark on light backgrounds
- [ ] Borders are soft blue-gray
- [ ] Gradients are smooth, not banded

### Layout & Spacing

- [ ] Desktop shows centered "phone" (480px)
- [ ] Mobile is full-width
- [ ] Consistent spacing throughout
- [ ] Grid is 2 columns
- [ ] Bottom nav is sticky

### Typography

- [ ] Font is Inter (sans-serif)
- [ ] Logo is uppercase
- [ ] Headers are semibold/bold
- [ ] Text is legible on all backgrounds

### Y2K Elements

- [ ] Holographic orb visible (blurred)
- [ ] Orb is pulsing gently
- [ ] Gradients are subtle, not harsh
- [ ] Glows are soft, not neon
- [ ] Overall feel is refined

### Interactions

- [ ] Cards scale on hover
- [ ] Button has glow effect
- [ ] Chips change on hover
- [ ] Navigation shows active state
- [ ] All animations are smooth

---

**This guide shows exactly what was built.**  
Compare your implementation against these visuals to ensure accuracy.
