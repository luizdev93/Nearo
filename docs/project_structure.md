PROJECT FOLDER STRUCTURE
src/
│
├── app/
│   ├── navigation/
│   ├── providers/
│   └── theme/
│
├── features/
│   ├── auth/
│   ├── listings/
│   ├── chat/
│   ├── profile/
│   ├── search/
│   └── notifications/
│
├── components/
│   ├── common/
│   ├── cards/
│   ├── inputs/
│   └── modals/
│
├── services/
│   ├── api/
│   ├── auth_service.ts
│   ├── listing_service.ts
│   ├── chat_service.ts
│   └── user_service.ts
│
├── state/
│   ├── auth_store.ts
│   ├── listing_store.ts
│   ├── chat_store.ts
│   └── user_store.ts
│
├── models/
│   ├── user.ts
│   ├── listing.ts
│   ├── message.ts
│   └── rating.ts
│
├── localization/
│   ├── en.json
│   └── vi.json
│
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
│
└── screens/
    ├── Splash/
    ├── Auth/
    ├── Home/
    ├── Search/
    ├── ListingDetails/
    ├── CreateListing/
    ├── Chat/
    ├── Profile/
    └── Favorites/
NAMING CONVENTION RULES
Files

Use:

feature_action.type.ts

Examples:

create_listing.screen.tsx
listing_card.component.tsx
chat_service.ts
auth_store.ts
Components

PascalCase:

ListingCard
UserAvatar
ChatMessageBubble
Variables

camelCase:

listingPrice
userRating
chatMessages
Database Fields

snake_case:

created_at
owner_id
is_featured
Localization Keys

Structure:

section.element.action

Example:

listing.create.title
chat.message.placeholder
auth.login.button
COMPONENT ORGANIZATION RULE

If component is used:

1 screen → keep inside feature folder

2+ screens → move to /components/common

SERVICE RULE

Services must:

contain API logic only

return typed models

never contain UI logic

STORE RULE

Stores must:

manage state

call services

expose clean data to UI

SCREEN RULE

Screens must:

assemble components

read state

trigger actions

Screens must NOT:

format API responses

handle persistence logic

FINAL DEVELOPMENT PRINCIPLE

Features live inside /features, not inside /screens.

Screens are only visual containers.