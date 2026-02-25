# Project Summary — Local Marketplace App (MVP)

This project is a mobile-first local classifieds marketplace application.

The app allows users to:
- create listings
- browse listings
- chat with other users
- meet offline to complete transactions

The application DOES NOT process payments or deliveries.
It only connects buyers and sellers.

The product is currently in MVP stage and must remain simple,
fast, and scalable.

Supported languages:
- English
- Vietnamese

Core principles:
- mobile-first experience
- minimal friction
- fast listing creation
- image-focused browsing
- local discovery of items

Architecture principles:
- layered architecture (Service → Store → UI)
- reusable components
- strict separation of concerns
- no direct API calls from UI
- localization required for all text

Core features included in MVP:
- authentication via phone OTP
- listing creation and browsing
- search and filters
- chat between users
- favorites
- user ratings
- featured listings (promotion)

Out of scope (must NOT be implemented):
- payments
- delivery systems
- AI features
- social media features
- desktop/web platform
- advanced verification systems

Development priority:
stability, clarity, and maintainability over complexity.

All code generated must follow project rules located in:
.cursor/rules/