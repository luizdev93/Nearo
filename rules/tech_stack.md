# Tech Stack Rules — Nearo App

## Application Type

This project is a HYBRID MOBILE APPLICATION.

The app must run on:

- iOS
- Android

from a single shared codebase.

Web applications must NOT be generated.

---

## Required Framework

The application MUST use:

React Native with Expo.

Do not use:
- Flutter
- Native Swift
- Native Kotlin
- Web frameworks (Next.js, React Web)
- Electron

All development must target mobile devices only.

---

## Language

Use:

- TypeScript (mandatory)

JavaScript without types is not allowed.

---

## Navigation

Use:

Expo Router or React Navigation.

Navigation must support:
- stack navigation
- tab navigation
- deep linking ready structure

---

## UI System

Use:

- React Native components
- centralized theme system

Do NOT use web-only UI libraries.

Forbidden:
- HTML elements
- CSS files
- DOM APIs

---

## Platform Compatibility Rules

All features must work on both platforms:

- Android
- iOS

Avoid platform-specific code unless strictly necessary.

If platform-specific logic is required:

Use platform detection abstraction.

---

## Image Handling

Use Expo Image or optimized image component.

Images must:
- lazy load
- cache automatically
- support mobile performance constraints.

---

## Permissions

Use Expo APIs for:

- camera
- media library
- notifications
- location

Do not implement native permission handlers manually.

---

## Build System

Use Expo build system.

Project must be compatible with:

- EAS Build
- App Store deployment
- Google Play deployment

---

## Development Priority

Prefer:

- cross-platform compatibility
- simple implementation
- stable libraries

Avoid experimental dependencies.

---

## Forbidden Outputs

Cursor must NEVER generate:

- web-only layouts
- browser routing
- HTML rendering
- desktop application logic