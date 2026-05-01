# Design Guidelines – School Management System

## 🎯 Goal

Build a clean, modern, and professional interface optimized for daily use by administrators and teachers.
The UI must prioritize clarity, speed, and consistency over creativity.

---

## 🎨 Color System

### Core Colors

- **Primary**: `bg-primary`, `text-primary`
  Used for main actions (buttons, links, active states)

- **Primary Dark**: `bg-primaryDark`
  Used for hover states

- **Background**: `bg-background`
  Main page background (dark)

- **Surface**: `bg-surface`
  Cards, panels, containers

- **Surface Light**: `bg-surfaceLight`
  Hover states, secondary sections

---

### Text Colors

- **Primary Text**: `text-textPrimary`
- **Secondary Text**: `text-textSecondary`

---

### Status Colors

- **Success**: `bg-success` → validated actions
- **Warning**: `bg-warning` → pending / alerts
- **Danger**: `bg-danger` → errors / destructive actions

---

### Borders

- Always use: `border-border`
- Avoid default Tailwind borders

---

## ❌ Forbidden

- Do NOT use Tailwind default colors (`blue-500`, `red-600`, etc.)
- Do NOT use inline hex colors
- Do NOT mix different color systems

---

## 🔤 Typography

- Font: `font-sans` (Inter)
- Titles: `text-xl font-semibold`
- Section headers: `text-lg`
- Body text: `text-base`
- Small text: `text-sm`

Keep typography minimal and consistent.

---

## 📦 Layout Rules

### General

- Use a **sidebar layout** (left navigation + top bar)
- Keep spacing consistent
- Avoid clutter

---

### Spacing

- Use Tailwind spacing scale only

- Preferred paddings:
  - Cards: `p-4`
  - Sections: `p-6`
  - Small elements: `p-2`

- Use gaps instead of margins when possible:
  - `gap-4`, `gap-6`

---

## 🧱 Components

### Cards

```
bg-surface border border-border rounded-xl p-4 shadow-card
```

---

### Buttons

#### Primary

```
bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg
```

#### Secondary

```
border border-border text-textPrimary px-4 py-2 rounded-lg hover:bg-surfaceLight
```

#### Danger

```
bg-danger text-white px-4 py-2 rounded-lg
```

---

### Inputs

```
bg-surfaceLight border border-border rounded-lg px-3 py-2
focus:outline-none focus:ring-2 focus:ring-primary
```

---

### Tables

- Use clean rows with separators
- Add hover state

```
border-b border-border hover:bg-surfaceLight
```

---

### Badges

- Success → green
- Warning → yellow
- Danger → red

Use small rounded elements:

```
px-2 py-1 text-xs rounded-md
```

---

## 🧠 Design Principles

- Keep UI predictable
- Avoid unnecessary animations
- Prioritize readability
- Use contrast properly
- Every element must have a purpose

---

## 🤖 AI Instructions (Copilot / ChatGPT)

When generating UI code:

- Always use defined theme colors (primary, surface, etc.)
- Reuse component patterns from this file
- Do NOT invent new styles
- Do NOT introduce new colors
- Follow spacing and typography rules strictly
- Prefer consistency over creativity

---

## 📌 Summary

This system should feel:

- Modern
- Clean
- Structured
- Professional

Not flashy, not experimental.

Consistency is more important than design variety.
