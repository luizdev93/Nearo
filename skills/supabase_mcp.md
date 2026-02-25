# Skill — Supabase MCP Integration (Nearo)

## Role

You are integrating Supabase as the backend for the Nearo mobile application.

Supabase is accessed through MCP tooling.

You must treat Supabase as the single backend source of truth.

---

## Architecture Rule (CRITICAL)

UI must NEVER query Supabase directly.

Allowed flow:

Screen UI
↓
Store
↓
Service
↓
Supabase Client (MCP)

Forbidden:

UI → Supabase

---

## Database Responsibilities

Supabase handles:

- authentication
- database storage
- realtime subscriptions
- image storage
- row-level security (RLS)

---

## Table Design Principles

Tables must follow:

- snake_case naming
- singular table names
- UUID primary keys

Example:

users
listings
messages
ratings

---

## Required Base Tables

### users
- id (uuid, auth reference)
- name
- avatar_url
- rating_average
- rating_count
- created_at

---

### listings
- id
- owner_id
- title
- description
- price
- category
- condition
- negotiable
- location
- is_featured
- status
- created_at

---

### messages
- id
- chat_id
- sender_id
- content
- created_at

---

### chats
- id
- buyer_id
- seller_id
- listing_id
- created_at

---

### ratings
- id
- rater_id
- rated_user_id
- value
- created_at

---

## Supabase Client Rule

All Supabase access must be centralized:

/services/api/supabase_client.ts

Never create multiple clients.

---

## Query Standards

All queries must:

- be typed
- handle errors
- return structured responses
- avoid select *

Preferred:

.select("id,title,price")

---

## Realtime Rule

Realtime subscriptions allowed only for:

- chat messages
- notifications

Never subscribe entire listings table.

---

## Storage Rules

Buckets:

listing-images
profile-images

Images must:

- upload compressed
- use public URLs
- store URL reference in database

---

## Authentication Rule

Use Supabase Auth:

- phone OTP login
- session persistence
- auto refresh tokens

Auth state must sync with auth_store.

---

## Row Level Security (MANDATORY)

Assume RLS is enabled.

Queries must respect:

- users can edit own listings
- users can read public listings
- messages visible only to participants

Never bypass RLS logic.

---

## Data Mutation Rule

Insert/update/delete must happen via services only.

Always return updated object.

---

## Error Handling

Every database call must:

try/catch
return { data, error }

Never throw raw errors to UI.

---

## File Upload Flow

Image Upload:

UI → Store → Service → Supabase Storage

After upload:
return public URL
save URL into database record.

---

## MCP Behavior

When MCP is available:

- inspect schema before generating queries
- adapt types automatically
- do not invent columns
- use existing schema as authority