# Nearo — Component Map (Official)

This document defines the reusable UI components that MUST be used across the Nearo app. All screens must be composed using these components to ensure visual and behavioral consistency.

---

## 1. Core Primitives

### GradientButton
**Purpose:** Primary CTA button

Props:
- label: string
- onPress: () => void
- loading?: boolean
- disabled?: boolean
- iconLeft?: ReactNode
- fullWidth?: boolean

Rules:
- Uses brand gradient
- Height 52px
- Radius 14px

Path:
/components/ui/GradientButton.tsx

---

### SecondaryButton
**Purpose:** Secondary actions

Props:
- label
- onPress
- iconLeft?

Path:
/components/ui/SecondaryButton.tsx

---

### IconButton
**Purpose:** Small actions

Props:
- icon
- onPress
- size?: number

Path:
/components/ui/IconButton.tsx

---

### TextInputField
**Purpose:** Standard input

Props:
- value
- onChangeText
- placeholder
- iconLeft?
- secureTextEntry?
- error?

Path:
/components/form/TextInputField.tsx

---

## 2. Layout Components

### ScreenContainer
**Purpose:** Base wrapper for every screen

Responsibilities:
- SafeArea
- Background color
- Padding 16px

Path:
/components/layout/ScreenContainer.tsx

---

### SectionHeader
**Purpose:** Section titles with optional action

Props:
- title
- actionLabel?
- onActionPress?

Path:
/components/layout/SectionHeader.tsx

---

### Card
**Purpose:** Generic card container

Props:
- children
- padding?: number

Path:
/components/ui/Card.tsx

---

## 3. Marketplace Components

### ListingCard
**Purpose:** Display listing preview

Props:
- id
- title
- price
- imageUrl
- location
- createdAt
- isFavorite?
- onPress
- onToggleFavorite

Path:
/components/listings/ListingCard.tsx

---

### ListingImageCarousel
**Purpose:** Listing image gallery

Props:
- images: string[]

Path:
/components/listings/ListingImageCarousel.tsx

---

### PriceTag
**Purpose:** Highlight price

Props:
- price
- currency

Path:
/components/listings/PriceTag.tsx

---

## 4. Chat Components

### ChatBubble
**Purpose:** Message bubble

Props:
- message
- isMine
- timestamp

Path:
/components/chat/ChatBubble.tsx

---

### ChatInputBar
**Purpose:** Message composer

Props:
- value
- onChange
- onSend

Path:
/components/chat/ChatInputBar.tsx

---

### ConversationItem
**Purpose:** Chat list row

Props:
- avatar
- name
- lastMessage
- time
- unreadCount

Path:
/components/chat/ConversationItem.tsx

---

## 5. Profile Components

### Avatar
**Purpose:** User avatar

Props:
- uri?
- size?: number

Path:
/components/profile/Avatar.tsx

---

### RatingStars
**Purpose:** Rating display

Props:
- rating
- size?

Path:
/components/profile/RatingStars.tsx

---

## 6. Navigation Components

### FloatingTabBar
**Purpose:** Custom bottom tab bar

Rules:
- Rounded container
- Gradient active state

Path:
/components/navigation/FloatingTabBar.tsx

---

## 7. Feedback Components

### LoadingSkeleton
**Purpose:** Placeholder loading

Props:
- variant: 'card' | 'list' | 'avatar'

Path:
/components/feedback/LoadingSkeleton.tsx

---

### EmptyState
**Purpose:** No-content screens

Props:
- title
- description
- actionLabel?
- onActionPress?

Path:
/components/feedback/EmptyState.tsx

---

### ErrorState
**Purpose:** Error handling UI

Props:
- message
- retryLabel?
- onRetry?

Path:
/components/feedback/ErrorState.tsx

---

## 8. Utilities

### GradientView
**Purpose:** Reusable gradient container

Props:
- children

Path:
/components/ui/GradientView.tsx

---

## 9. Composition Rules

- All screens must use ScreenContainer
- Listings must use ListingCard
- Primary actions must use GradientButton
- Inputs must use TextInputField
- Messages must use ChatBubble
- No custom buttons unless approved

---

## 10. Naming Convention

- PascalCase for components
- Feature folders by domain
- Avoid duplicated components

---

End of Component Map

