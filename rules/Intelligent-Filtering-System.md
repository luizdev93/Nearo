# Nearo — Intelligent Filtering System (CORE FEATURE)

This document defines the MOST IMPORTANT system of the Nearo application.

The primary competitive advantage of Nearo over Facebook Marketplace is:

👉 **Advanced structured filtering and intelligent category-based search.**

The goal is to allow users to find EXACTLY what they want with minimal effort.

This system must be treated as a CORE ARCHITECTURE feature.

---

# GLOBAL PRINCIPLE

Nearo is NOT just a listing app.

Nearo is a **structured marketplace** where every listing belongs to a category tree that defines:

* which fields exist
* which filters exist
* which sorting options exist
* which search experience users receive

Filtering quality directly determines product success.

---

# 1. CATEGORY TREE SYSTEM

The app must implement a hierarchical taxonomy.

Structure:

Category
→ Subcategory
→ Item Type (optional deeper level)

Example:

Vehicles
→ Cars
→ Sedan
→ SUV
→ Motorcycles

Real Estate
→ Apartments
→ Houses
→ Rooms

Jobs
→ Full-time
→ Part-time

Electronics
→ Phones
→ Laptops

Clothing
→ Men
→ Women

RULES:

* Every listing MUST belong to one leaf category.
* Filters are dynamically generated from the selected category.
* Categories define attributes schema.

---

# 2. DYNAMIC ATTRIBUTE SYSTEM

Each category defines custom attributes.

Example:

## Cars Category Attributes

* brand (select)
* model (dependent select)
* year (number range)
* mileage (number)
* fuel type (select)
* transmission (select)
* condition (select)

## Apartment Attributes

* bedrooms
* bathrooms
* furnished
* area (m²)
* parking
* rent price

Attributes must support:

* select
* multi-select
* number
* number range
* boolean
* text
* enum lists

Attributes are NOT hardcoded in UI.

They must be schema-driven.

---

# 3. CASCADING SELECTION (SMART FORMS)

When creating listings:

IF category = Cars:

1. Show Brand selector
2. After brand selection → load Models of that brand
3. After model selection → enable year and specs

Example:
Toyota → show Corolla, Hilux, Camry

This reduces user input friction and increases structured data quality.

---

# 4. FILTER TYPES (REQUIRED)

The system must support:

### Select Filters

Brand, condition, fuel type

### Multi-select Filters

Features, amenities

### Range Filters

Price range
Year range
Mileage range

### Slider Filters

Distance
Mileage
Price

### Boolean Filters

Has parking
New item
Negotiable

---

# 5. DISTANCE FILTERING (CRITICAL FEATURE)

Nearo must use device geolocation.

Each listing stores:

* latitude
* longitude

System must calculate:

distance_km = distance(user_location, listing_location)

Listings display:

"3.2 km away"

Filters:

* within 1 km
* within 5 km
* within 10 km
* custom radius slider

Sorting option:

* nearest first

---

# 6. SORTING OPTIONS (GLOBAL)

All searchable categories must support:

* Newest
* Price: Low → High
* Price: High → Low
* Distance (nearest)
* Most relevant (default)

Sorting must work with filters simultaneously.

---

# 7. SEARCH EXPERIENCE

Search is FACETED SEARCH.

Meaning:

* filters update results instantly
* filter counts update dynamically
* results react to each selection

Users should narrow results step by step.

---

# 8. FILTER UI REQUIREMENTS

Filters open in bottom sheet.

Must include:

* category filters
* quick toggles
* range sliders
* apply button
* clear filters button

Show active filters as chips above results.

Example:
[ Toyota ] [ ≤ 50,000 km ] [ ≤ 10 km ]

---

# 9. PERFORMANCE REQUIREMENTS

Filtering must be scalable.

Requirements:

* server-side filtering
* indexed attributes
* pagination required
* avoid client-side filtering on large datasets

Queries must support combinations of filters efficiently.

---

# 10. DATABASE MODEL (CONCEPTUAL)

Listings table:

* id
* category_id
* price
* location
* created_at

Listing_attributes table:

* listing_id
* attribute_key
* attribute_value

Categories table:

* id
* parent_id
* name

Attributes table:

* category_id
* key
* type
* options

This allows infinite extensibility.

---

# 11. LISTING CREATION EXPERIENCE

Goal:
👉 The more structured the creation flow, the easier search becomes.

Rules:

* Show only relevant fields per category
* Use dropdowns whenever possible
* Avoid free text for structured data
* Guide user step-by-step

---

# 12. LOCALIZATION SUPPORT

Filters must support:

* English
* Vietnamese

Attribute labels must be translatable.

---

# 13. UX PRINCIPLE

Users must feel:

"I can finally find exactly what I want."

Filtering must feel:

* fast
* precise
* intelligent
* effortless

---

# 14. PLAN MODE INSTRUCTION

Create a plan to implement:

1. Category taxonomy system
2. Attribute schema engine
3. Dynamic listing form
4. Intelligent filter UI
5. Distance calculation system
6. Filter query builder
7. Sorting engine
8. Performance optimization strategy

Output must include:

* architecture proposal
* database strategy
* UI flow
* implementation order
* risk analysis

Do NOT implement yet. Only plan.

---

End of Intelligent Filtering System
