# Nearo — UI Rules for Cursor (MANDATORY)

This document defines strict UI rules that MUST be followed when generating any screen, component, or layout for the Nearo mobile app.

The goal is visual consistency and a professional identity aligned with the Nearo Design System.

---

## 1. General Rules (ALWAYS APPLY)

- The app is MOBILE FIRST.
- Target platform: Hybrid mobile (React Native + Expo).
- All UI must feel modern, lightweight, and friendly.
- Prefer cards over dense lists.
- Avoid visual clutter.
- Every screen must respect spacing and hierarchy.

Never generate default UI styles.
Always apply the Nearo design tokens.

---

## 2. Design Tokens (REQUIRED)

### Brand Gradient (Primary Actions)
Gradient:
- #7A5CFF → #5A6BFF → #47C2FF

Use for:
- Primary buttons
- Active tab icons
- Highlights
- CTA areas

### Colors
- Background: #F7F8FC
- Card: #FFFFFF
- Text Primary: #1A1D29
- Text Secondary: #6B7280
- Border: #E5E7EB

Status:
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

---

## 3. Layout Rules

Screen padding: 16px
Grid spacing: 4px base scale

Spacing scale:
4, 8, 12, 16, 20, 24, 32, 40

Sections must be visually separated using spacing, not borders.

---

## 4. Typography

Font: Inter

Hierarchy:
- H1: 28 Bold
- H2: 22 SemiBold
- H3: 18 SemiBold
- Body: 16 Regular
- Caption: 13 Regular

Text color must never be pure black.

---

## 5. Buttons

### Primary Button
- Gradient background
- White text
- Height: 52px
- Radius: 14px
- Full width unless inline action

### Secondary Button
- White background
- 1px border (#E5E7EB)

### Icon Button
- Circular
- Soft background (#F1F3FF)

---

## 6. Cards

All content must be inside cards when possible.

Card rules:
- Radius: 18px
- Shadow: soft only
- Padding: 12–16px
- Image corners rounded

ListingCard must include:
- Image
- Title
- Price emphasis
- Location + time muted

---

## 7. Inputs

- Height: 48px
- Radius: 12px
- White background
- Subtle border
- Focus state uses gradient outline

---

## 8. Navigation

### Bottom Tab Bar
- Floating style
- Rounded container
- Active icon uses gradient

### Header
- Minimal
- Large titles
- No heavy backgrounds

---

## 9. Chat UI Rules

My messages:
- Gradient bubble
- White text

Other messages:
- Light gray bubble

Bubble radius: 20px

---

## 10. Icons

- Rounded line icons
- Default size: 24px
- Active state may use gradient

---

## 11. Motion

Durations:
- Fast: 120ms
- Normal: 200ms
- Modal: 280ms

Allowed animations:
- Fade
- Slide up
- Subtle scale

No complex motion.

---

## 12. Image Rules

- Use skeleton loaders
- Rounded corners
- Lazy loading

---

## 13. Accessibility

- Minimum touch size: 44px
- Maintain readable contrast

---

## 14. Localization Rules

UI must support English and Vietnamese.

Requirements:
- Avoid fixed text width
- Support longer Vietnamese strings
- Buttons must allow flexible width

---

## 15. Forbidden Patterns

DO NOT:
- Use fullscreen blocking modals
- Use pure black backgrounds
- Use inconsistent corner radius
- Use multiple button styles on same screen
- Use dense tables

---

## 16. Generation Instruction (CRITICAL)

Whenever generating UI:
1. Apply design tokens first
2. Use card-based layout
3. Respect spacing scale
4. Use gradient for primary action
5. Ensure touch-friendly layout

If unsure, prefer simplicity.

---

End of UI Rules

