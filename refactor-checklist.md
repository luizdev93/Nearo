# Nearo Design System Migration — Refactor Checklist

**Phase 1 Audit Deliverable.** Use this checklist to track migration progress.

---

## 1. Screens — ScreenContainer / 16px / Official Buttons / Official Inputs

| Screen | ScreenContainer | 16px padding | Official buttons | Official inputs |
|--------|-----------------|--------------|------------------|-----------------|
| app/(tabs)/index.tsx | N | Mixed | N | N/A |
| app/(tabs)/search.tsx | N | Mixed | N | N |
| app/(tabs)/create.tsx | N | Mixed | N | N |
| app/(tabs)/chats.tsx | N | Mixed | N | N/A |
| app/(tabs)/profile.tsx | N | Mixed | N | N/A |
| app/(auth)/login.tsx | N | Mixed | N | N |
| app/(auth)/otp.tsx | N | Mixed | N | N |
| app/listing/[id].tsx | N | Mixed | N | N/A |
| app/user/[id].tsx | N | Mixed | N/A | N/A |
| app/chat/[id].tsx | N | Mixed | N | N |
| app/favorites.tsx | N | Mixed | N/A | N/A |
| app/notifications.tsx | N | Mixed | N/A | N/A |
| app/edit-profile.tsx | N | Mixed | N | N |
| app/promote/[id].tsx | N | Mixed | N | N/A |
| app/report/[id].tsx | N | Mixed | N | N/A |
| app/+not-found.tsx | N | Mixed | N | N/A |
| app/(tabs)/_layout.tsx | N/A | N/A | N/A | N/A |
| app/(auth)/_layout.tsx | N/A | N/A | N/A | N/A |
| app/_layout.tsx | N/A | N/A | N/A | N/A |

---

## 2. Theme Tokens — Current → Target

| Token | Current | Target |
|-------|---------|--------|
| primary | #2563EB | #6A64FF + gradient #7A5CFF→#5A6BFF→#47C2FF |
| background | #FFFFFF | #F7F8FC (app), card #FFFFFF |
| text | #111827 | #1A1D29 |
| textSecondary | #6B7280 | #6B7280 (keep) |
| placeholder | textTertiary #9CA3AF | #9CA3AF (keep) |
| secondary accent | #F59E0B | #47C2FF |
| button height | Various | 52px |
| button radius | 12 (borderRadius.lg) | 14px |
| card radius | 12–16 | 18px |
| input radius | 12 | 12px (keep) |
| caption fontSize | 12 | 13 |
| shadows | None | card + floating |

---

## 3. Component Map — Status

| Component | Status | Notes |
|-----------|--------|-------|
| GradientButton | Missing | Create src/components/ui/GradientButton.tsx |
| SecondaryButton | Missing | Create src/components/ui/SecondaryButton.tsx |
| IconButton | Missing | Create src/components/ui/IconButton.tsx |
| TextInputField | Exists (wrong path) | inputs/TextInput.tsx — align height 48, radius 12 |
| ScreenContainer | Missing | Create src/components/layout/ScreenContainer.tsx |
| SectionHeader | Missing | Create src/components/layout/SectionHeader.tsx |
| Card | Missing | Create src/components/ui/Card.tsx |
| ListingCard | Exists | cards/ListingCard.tsx — add radius 18, shadow, PriceTag |
| ListingImageCarousel | Missing | Create src/components/listings/ListingImageCarousel.tsx |
| PriceTag | Missing | Create src/components/listings/PriceTag.tsx |
| ChatBubble | Missing | Create src/components/chat/ChatBubble.tsx |
| ChatInputBar | Missing | Create src/components/chat/ChatInputBar.tsx |
| ConversationItem | Missing | Create src/components/chat/ConversationItem.tsx |
| Avatar | Exists | common/Avatar.tsx — path optional |
| RatingStars | Missing | Create or use in RatingModal |
| FloatingTabBar | Missing | Create src/components/navigation/FloatingTabBar.tsx |
| LoadingSkeleton | Partial | SkeletonCard exists — add feedback/LoadingSkeleton variants |
| EmptyState | Exists | Add description, actionLabel, onActionPress |
| ErrorState | Exists | ErrorView — align message, retryLabel, onRetry |
| GradientView | Missing | Create src/components/ui/GradientView.tsx |

---

## 4. Inline / Hardcoded Values

| File | Line/area | Value | Action |
|------|-----------|-------|--------|
| app/chat/[id].tsx | styles | fontSize: 10, borderRadius: 20 | Use theme tokens |
| app/notifications.tsx | styles | borderRadius: 20, 4 | Use theme tokens |
| app/(tabs)/index.tsx | featuredOverlay | rgba(0,0,0,0.45) | Theme overlay |
| app/listing/[id].tsx | styles | borderRadius: 24 | Theme modal radius |
| app/(auth)/otp.tsx | styles | fontSize: 24 | Typography token |

---

## 5. Duplicated Patterns

| Pattern | Files | Action |
|---------|-------|--------|
| Primary button | All screens using Button variant="primary" | Replace with GradientButton |
| Secondary/outline | login, otp, search, report, etc. | Replace with SecondaryButton |
| Icon-only actions | listing/[id], profile, edit-profile, search, create | Replace with IconButton |
| Message bubble | app/chat/[id].tsx | Replace with ChatBubble |
| Conversation row | app/(tabs)/chats.tsx | Replace with ConversationItem |
| Tab bar | app/(tabs)/_layout.tsx | Replace with FloatingTabBar |

---

*Check off items as phases 2–7 are completed.*
