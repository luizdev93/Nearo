# App Identity — Nearo

App Name: Nearo

Application Type:
Hybrid mobile marketplace application (iOS + Android)

Primary Language:
English

Secondary Language:
Vietnamese

---

## Bundle Identifier (iOS)

com.nearo.app

Rules:
- lowercase only
- reverse domain format
- never change after App Store release

---

## Android Package Name

com.nearo.app

Must match iOS bundle identifier structure.

---

## Expo Project Slug

nearo

---

## Display Name (User Visible)

Nearo

---

## Internal App Name

nearo-mobile

Used for:
- repository name
- CI/CD
- internal configs

---

## Deep Link Scheme

nearo://

Examples:
nearo://listing/123
nearo://chat/456

---

## Environment Names

development
staging
production

---

## Versioning Strategy

MAJOR.MINOR.PATCH

Example:
1.0.0 → first public release
1.1.0 → new feature
1.1.1 → bug fix

---

## App Store Category

Primary:
Shopping

Secondary:
Lifestyle

---

## Supported Platforms

- iOS 14+
- Android 8+

---

## Timezone Handling

All backend timestamps stored in UTC.

Client converts to local time.

---

## Image Standards

Listing images:
- JPEG
- compressed upload
- max 10 images per listing

Profile images:
- square ratio (1:1)