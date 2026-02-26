📄 CURSOR RULES — APP MARKETPLACE (MVP)
App name: Nearo
Project: Local Marketplace App
Platforms: Mobile (iOS + Android)
Languages: English (default) + Vietnamese

All UI generation MUST follow:
- Nearo Design System & UX Guidelines
- Nearo UI Rules for Cursor

1. GLOBAL APP RULES
1.1 App Purpose

The application is a local classifieds marketplace where users can:

create listings

browse listings

chat with other users

meet offline to complete transactions

The app does not process payments.

1.2 Authentication Requirement

User must be authenticated to:

create listings

send messages

favorite listings

rate users

Browsing listings is allowed without login.

1.3 Core Entities
User

id

name

profile_photo

phone_number

verified (boolean)

member_since

rating_average

rating_count

Listing

id

title

description

category

price

negotiable (boolean)

condition (new/used)

images[]

location

owner_id

created_at

is_featured (boolean)

status (active/sold/removed)

Message

id

chat_id

sender_id

text

images[]

timestamp

Rating

id

rater_id

rated_user_id

value (1–5)

2. SCREEN STRUCTURE
2.1 Splash Screen
Purpose

App initialization.

Behavior

show logo

load user session

detect language

redirect:

logged user → Home

new user → Auth Screen

No interaction allowed.

2.2 Authentication Screen
Purpose

User login/signup via phone verification.

Components

phone input

country selector

continue button

OTP Screen

OTP input

resend code

confirm button

Result

Create or authenticate user.

2.3 Home Screen (Feed)
Purpose

Display marketplace listings.

Layout

Scrollable vertical feed.

Order

featured listings

nearby listings

recent listings

Listing Card Components

main image

price

title

location

featured badge (if applicable)

Actions

open listing details

favorite listing

open search

Bottom navigation visible.

2.4 Search Screen
Purpose

Search and filter listings.

Components

search text input

filters button

results grid/list

Filters

category

price range

location radius

condition

negotiable only

newest first

Results update dynamically.

2.5 Categories Screen
Purpose

Browse listings by category.

Categories

Vehicles

Real Estate

Jobs

Electronics

Home & Furniture

Fashion

Services

Others

Selecting category opens filtered listing feed.

2.6 Listing Details Screen
Purpose

Display full listing information.

Components

image gallery (swipeable)

title

price

negotiable label

description

location

seller preview card

Seller Preview

profile photo

name

rating

member since

Actions

chat with seller

favorite listing

report listing

2.7 Create Listing Screen
Purpose

Allow user to publish a listing.

Fields

title (required)

description (required)

category (required)

price (required)

negotiable toggle

condition selector (new/used)

location selector

image uploader (1–10 images)

Actions

publish listing

Validation required before submission.

2.8 Chat List Screen
Purpose

Display all conversations.

Components

conversation list

last message preview

timestamp

unread indicator

Tap → open chat conversation.

2.9 Chat Conversation Screen
Purpose

Negotiation between users.

Components

message list

text input

send button

image attachment

Quick Actions Buttons

“Still available?”

“Accept X price?”

Messages update in real-time.

2.10 Favorites Screen
Purpose

Show saved listings.

Components

list of favorited listings

User can:

open listing

remove favorite

2.11 User Profile Screen
Purpose

Display user information.

Components

profile photo

name

rating average

rating count

member since

Sections:

active listings

sold listings (optional status display)

2.12 Edit Profile Screen
Fields

name

profile photo

language selection

Save button required.

2.13 Ratings Screen
Purpose

Rate another user.

Components

star selector (1–5)

submit button

Only one rating per interaction allowed.

2.14 Notifications Screen
Displays

new messages

listing activity

Tap notification → opens related screen.

2.15 Promote Listing Screen
Purpose

Activate featured listing.

Components

listing preview

promotion explanation

purchase button

Result:

listing.is_featured = true

promotion duration = 24h

2.16 Report Screen
Purpose

Report listing or user.

Options

spam

scam

illegal content

other

Submit sends report to admin panel.

3. NAVIGATION STRUCTURE

Bottom Navigation Tabs:

Home

Search

Create Listing (+)

Chats

Profile

4. GLOBAL UI RULES

Mobile-first layout

No fullscreen ads

Minimal popups

Fast navigation

Large touch targets

Image-focused cards

5. LANGUAGE SYSTEM

All text must support:

English

Vietnamese

No hardcoded strings allowed.

Use localization keys.

6. PERMISSIONS

Required device permissions:

Camera (upload images)

Gallery access

Notifications

Location (optional but recommended)

7. ERROR HANDLING

Must handle:

network failure

image upload failure

message send retry

session expiration

Show non-blocking error messages.

8. MVP LIMITATIONS

The app must NOT include:

payment processing

delivery systems

AI features

desktop version

advanced verification