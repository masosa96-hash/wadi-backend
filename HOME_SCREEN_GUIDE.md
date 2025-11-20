# WADI Home Screen - Quick Start Guide

## 🚀 How to View the Home Screen

### Option 1: Start Development Server

```bash
# From root directory
pnpm --filter frontend dev
```

Then open: **http://localhost:5173**

### Option 2: Login & Navigate

1. Navigate to **http://localhost:5173/login**
2. Login with your credentials
3. You'll be redirected to **/home** automatically

---

## 📱 What You'll See

### On Desktop (1024px+)
- A centered "phone" container (max-width: 480px)
- Soft shadow creating a floating card effect
- Light bluish background (#F3F6FB) around the phone
- Rounded corners (36px border-radius)

### On Mobile
- Full-width layout
- Same components, optimized for touch
- Bottom navigation sticky at the screen bottom

---

## 🎨 Design Elements to Notice

### 1. **Header Bar**
- "WADI" logo in royal blue (#255FF5)
- Bell icon with red notification badge
- Circular avatar (shows first letter of email)

### 2. **Hero Card (Main Focus)**
- **Blue → Purple gradient background**
- Soft holographic orb (blurred circle)
- White prompt input field with glassmorphism
- Circular submit button (paper plane ✈️ icon)
- Subtle glow effect

### 3. **Workspaces Grid**
- 4 example workspaces (Research, Copywriting, Ideas, Finanzas)
- 2-column grid layout
- Circular icons with color-coded backgrounds
- Hover effect: scales up slightly
- Tap effect: scales down

### 4. **Quick Action Chips**
- Pill-shaped buttons
- "Historial", "Favoritos", "Plantillas rápidas"
- Hover: border turns blue
- Active state: filled with blue background

### 5. **Bottom Navigation**
- 4 items: Home, Workspaces, Historial, Perfil
- Active item (Home) has:
  - Blue text color
  - Glow effect on icon
  - Small dot indicator below

---

## 🎯 Y2K Elements (Subtle)

Look for these refined Y2K touches:

### ✨ Gradients
- **Hero card**: Blue (#255FF5) → Purple-blue (#7B8CFF)
- **Submit button**: Blue gradient
- **Workspace icons**: Soft color tints

### 🌈 Holographic Orbs
- **Top right corner**: Large blurred lavender orb
- **Inside hero**: Soft white radial gradient
- **Animation**: Gentle pulse (4-second loop)

### 💫 Glows
- **Submit button**: Blue shadow glow
- **Active nav icon**: Drop-shadow effect
- **Cards on hover**: Enhanced depth

### 🔮 Glassmorphism
- **Prompt input**: Blurred white background
- **Navigation bar**: Subtle blur effect

---

## 🧪 Testing the Design

### Responsive Testing
1. **Desktop**: Resize browser to 1920px wide
   - Should see centered phone container
   - Background visible around container

2. **Tablet**: Resize to 768px
   - Container should be slightly smaller
   - Still centered with rounded corners

3. **Mobile**: Resize to 375px
   - Full width layout
   - No visible background around container
   - Same component layout

### Interaction Testing
1. **Hover workspace cards** → Should scale up
2. **Click workspace** → Navigates to `/workspaces/:id`
3. **Hover quick action chips** → Border turns blue
4. **Click bottom nav items** → Navigates to respective pages
5. **Type in prompt input** → Should accept text
6. **Click submit button** → Logs prompt to console

---

## 🎨 Color Verification

Use browser DevTools to inspect elements:

### Background Colors
- Body: `#F3F6FB` (soft bluish white)
- Cards: `#FFFFFF` (pure white)
- Mobile frame: `#FAFBFD` (very light blue)

### Accent Colors
- Primary buttons: `#255FF5` (royal blue)
- Gradients: `#255FF5` → `#7B8CFF` → `#C5B3FF`
- Hover states: `#4A7BF7` (lighter blue)

### Text Colors
- Headers: `#0F172A` (deep blue-black)
- Body text: `#6B7280` (medium gray)
- Captions: `#9CA3AF` (light gray)

---

## 🔧 Troubleshooting

### Home page doesn't show
- Check you're logged in (visit `/login`)
- Check route is `/home` (not `/`)

### Gradients not showing
- Check browser supports `linear-gradient`
- Clear cache and reload

### Animations not smooth
- Ensure Framer Motion is installed: `pnpm --filter frontend add framer-motion`
- Check browser supports CSS transitions

### Mobile view broken
- Resize browser width below 768px
- Check responsive CSS is loading

---

## 📸 Expected Layout

```
Desktop View:
┌───────────────────────────────────────┐
│         (Light bluish bg)             │
│                                       │
│       ┌─────────────────┐            │
│       │ WADI    🔔 👤  │            │
│       ├─────────────────┤            │
│       │ [Gradient Hero] │            │
│       │  Prompt input   │            │
│       ├─────────────────┤            │
│       │  Workspaces     │            │
│       │  ┌──┬──┐       │            │
│       │  │  │  │       │            │
│       │  └──┴──┘       │            │
│       │  [Chips]        │            │
│       ├─────────────────┤            │
│       │ 🏠 💼 📜 👤    │            │
│       └─────────────────┘            │
│                                       │
└───────────────────────────────────────┘

Mobile View:
┌─────────────────┐
│ WADI    🔔 👤  │
├─────────────────┤
│ [Gradient Hero] │
│  Prompt input   │
├─────────────────┤
│  Workspaces     │
│  ┌────┬────┐   │
│  │    │    │   │
│  └────┴────┘   │
│  [Chips]        │
├─────────────────┤
│  🏠 💼 📜 👤   │
└─────────────────┘
```

---

## ✅ Success Criteria

Your Home screen is working correctly if you see:

- [x] Clean light theme (no dark backgrounds)
- [x] Centered "phone" container on desktop
- [x] Blue → Purple gradient on hero card
- [x] Soft holographic orb with blur
- [x] White glassmorphic prompt input
- [x] 2x2 grid of workspace cards
- [x] Pill-shaped quick action chips
- [x] Bottom navigation with 4 items
- [x] Smooth animations on interactions
- [x] Professional banking/fintech feel
- [x] Subtle Y2K touches (not overwhelming)

---

## 🎉 Next Steps

1. **Test on real mobile device**
   - Use ngrok or similar to expose localhost
   - Test touch interactions

2. **Integrate with real data**
   - Replace `mockWorkspaces` with API data
   - Connect prompt submission to backend

3. **Add more workspaces**
   - Create workspace management
   - Allow users to add/edit/delete

4. **Enhance animations**
   - Add loading states
   - Implement skeleton screens

---

**Need help?** Check `WADI_HOME_DESIGN.md` for full design documentation.
