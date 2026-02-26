# Nearo — Dynamic Category Engine Specification

This document defines the architecture responsible for enabling Nearo's core competitive advantage:

👉 Dynamic structured categories and intelligent filtering WITHOUT requiring app updates.

The mobile application must NEVER hardcode category fields or filters.

All category behavior must be driven by backend configuration.

---

# 1. CORE PRINCIPLE

Nearo is a schema-driven marketplace.

The app renders:

* listing forms
* filters
* search behavior

based entirely on category templates received from the backend.

The app does not know what a "car", "house", or "job" is.

It only understands schemas.

---

# 2. SYSTEM OBJECTIVE

Enable:

* unlimited categories
* dynamic attributes
* cascading selections
* automatic filter generation
* country customization
* zero app update for category changes

---

# 3. ARCHITECTURE OVERVIEW

Flow:

Database
↓
Category Engine API
↓
Category Template
↓
Dynamic Form Renderer
↓
Dynamic Filter Renderer
↓
Search Query Builder

---

# 4. CATEGORY HIERARCHY MODEL

Categories must be hierarchical.

Structure:

Category
→ Subcategory
→ Leaf Category

Rules:

* Only leaf categories allow listings.
* Parent categories organize navigation.
* Unlimited depth allowed.

Example:

Vehicles
Cars
SUV
Sedan

---

# 5. ATTRIBUTE TEMPLATE MODEL

Each leaf category has an attribute schema.

Attributes define:

* input type
* validation
* filter behavior
* display order

Attribute fields:

* key
* label
* type
* required
* filterable
* sortable
* unit (optional)
* depends_on (optional)
* options_source

Supported Types:

* select
* multiselect
* number
* number_range
* boolean
* text
* enum
* location

---

# 6. CASCADING ATTRIBUTES

Attributes may depend on previous selections.

Example:

brand → model

Rules:

* dependent fields remain disabled until parent selected
* options fetched dynamically

Example:

Toyota selected
→ load Toyota models

---

# 7. TEMPLATE API CONTRACT

Endpoint:

GET /category/{id}/template

Response example:

[
{
"key": "brand",
"type": "select",
"required": true,
"filterable": true
},
{
"key": "model",
"type": "select",
"depends_on": "brand"
},
{
"key": "mileage",
"type": "number",
"filterable": true,
"unit": "km"
}
]

---

# 8. DYNAMIC LISTING FORM ENGINE

The mobile app must include:

DynamicListingForm component.

Responsibilities:

* fetch template
* render inputs dynamically
* validate required fields
* store structured attributes

No category-specific forms allowed.

---

# 9. DYNAMIC FILTER ENGINE

Filters must be auto-generated from attributes where:

filterable = true

Filter types derived from attribute type.

Example:

number → range slider
select → dropdown filter
boolean → toggle

---

# 10. DATABASE DESIGN (CONCEPT)

Tables:

categories

* id
* parent_id
* name
* icon

attributes

* id
* category_id
* key
* type
* filterable
* sortable
* required

attribute_options

* attribute_id
* value
* label

listings

* id
* category_id
* price
* latitude
* longitude

listing_attributes

* listing_id
* attribute_id
* value

---

# 11. SEARCH QUERY BUILDER

Filters selected by user must generate dynamic queries.

Example:

category=cars
brand=Toyota
mileage<=50000
distance<=10km

Queries must be composable.

---

# 12. LOCALIZATION SUPPORT

Attribute labels must be multilingual:

label_en
label_vi

The app displays based on user language.

---

# 13. PERFORMANCE REQUIREMENTS

* filtering executed server-side
* indexed attributes
* pagination mandatory
* geo-index for distance queries

---

# 14. ADMIN EXTENSIBILITY (FUTURE SAFE)

New categories must be creatable without code deployment.

Admin panel must allow:

* create category
* add attributes
* define filters
* upload options

---

# 15. MOBILE APP RULES

The app must:

* never hardcode fields
* never assume category structure
* always render from schema
* cache templates locally

---

# 16. PLAN MODE INSTRUCTION

Create a technical plan for:

1. Category engine backend structure
2. Template API
3. Dynamic form renderer
4. Dynamic filter renderer
5. Query builder system
6. Supabase schema strategy
7. Indexing strategy
8. Migration strategy from static UI

Output:

* architecture plan
* data flow diagram (textual)
* implementation phases
* risk analysis

Do NOT implement yet.

---

End of Dynamic Category Engine Specification
