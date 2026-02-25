APP DEVELOPMENT RULES (MANDATORY)
Rule Priority Order (highest → lowest)

When generating or modifying code, always follow this order:

Screen Functional Rules

Data Models

Navigation Rules

UI Consistency Rules

Performance Constraints

Code Style Rules

If rules conflict, higher priority wins.

1. SCREEN OWNERSHIP RULE

Each screen must:

own only its UI and local state

never control global business logic

never directly access database services

Screens communicate only through:

Services → State → UI

❌ Screens must NOT call APIs directly.

2. SINGLE RESPONSIBILITY RULE

Each file must have ONE responsibility.

Examples:

✅ listing_service.ts → handles listings
✅ chat_service.ts → handles messages
❌ utils_everything.ts

3. DATA FLOW RULE (STRICT)

Allowed flow:

Backend
 ↓
Service Layer
 ↓
State Manager
 ↓
Screen UI

Never:

UI → Backend directly
4. STATE MANAGEMENT RULE

State must be centralized.

State stores allowed:

auth state

listings state

chat state

user state

Screens read state only.

5. REUSABLE COMPONENT RULE

If UI repeats twice → create component.

Examples:

ListingCard

UserAvatar

PriceLabel

ImageCarousel

Never duplicate UI code.

6. NAVIGATION RULE

Navigation must be centralized.

Use:

navigation/router

Screens cannot manually construct routes.

7. NETWORK SAFETY RULE

All network requests must:

include error handling

include loading state

include retry logic

Never assume success response.

8. PERFORMANCE RULES

Always:

lazy load images

paginate listings

avoid full screen re-renders

cache listing images

9. LOCALIZATION RULE (CRITICAL)

No hardcoded text allowed.

All text must use:

t("localization.key")

Example:

t("listing.price")
10. FEATURE LIMIT RULE

AI must NOT add features outside MVP scope.

Forbidden additions:

payments

AI features

delivery systems

social feeds

Only implement defined screens.

11. SAFE MODIFICATION RULE

When editing code:

preserve existing logic

avoid refactoring unrelated files

update only impacted modules

12. UI CONSISTENCY RULE

All screens must reuse:

spacing scale

typography

button styles

card layout

No custom styling per screen.

13. ERROR HANDLING STANDARD

Every async action must support:

loading

success

error

UI must never freeze.

14. CHAT REALTIME RULE

Chat updates must:

append messages incrementally

never reload entire conversation

15. LISTING IMAGE RULE

Images must:

upload compressed

display thumbnail first

load full image on demand