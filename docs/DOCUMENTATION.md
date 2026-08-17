# BGM BJP Dakshin — Project Documentation

> **Project:** BJP Belagavi Dakshin ID Card Management System
> **Repository:** https://github.com/bgmbjpdakshin-wq/bgmbjpdakshin
> **Last Updated:** August 15, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema](#5-database-schema)
6. [Authentication](#6-authentication)
7. [Features & Pages](#7-features--pages)
8. [Changelog — What Was Added / Changed](#8-changelog--what-was-added--changed)
9. [Running Locally](#9-running-locally)

---

## 1. Project Overview

This is a **Next.js web application** for the BJP Belagavi Dakshin constituency. It allows authorised employees and admins to:

- **Create** digital ID cards for party members (with webcam photo capture)
- **View, search, and paginate** all generated ID cards
- **Print** ID cards in A4 format (3 per page — front + back layout)
- **Export** individual ID cards as JPEG images packaged inside a ZIP file
- **Manage** user accounts (admin-only)

---

## 2. Tech Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | Full-stack React framework (App Router) |
| **React** | 19.2.3 | UI rendering |
| **TypeScript** | ^5 | Type safety across the entire codebase |

### Database
| Technology | Version | Purpose |
|---|---|---|
| **PostgreSQL** (Neon) | — | Cloud-hosted serverless PostgreSQL database |
| **Prisma ORM** | ^7.4.2 | Type-safe database client and schema management |
| **@prisma/adapter-neon** | ^7.4.2 | Neon-specific Prisma driver adapter |
| **@neondatabase/serverless** | ^1.0.2 | Neon WebSocket-based serverless connector |

### Authentication
| Technology | Version | Purpose |
|---|---|---|
| **NextAuth v5** (beta) | ^5.0.0-beta.30 | Session management, credential-based login |
| **bcrypt** | ^6.0.0 | Password hashing |

### File & Image Storage
| Technology | Version | Purpose |
|---|---|---|
| **ImageKit** | ^6.0.0 | CDN image storage for member photos and QR code images |

### ID Card Export (newly added)
| Technology | Version | Purpose |
|---|---|---|
| **html2canvas** | latest | Renders HTML elements to `<canvas>` for JPEG capture |
| **JSZip** | latest | Assembles individual JPEG files into a ZIP archive in-browser |
| **file-saver** | latest | Triggers the browser download of the generated ZIP blob |

### Styling
| Technology | Purpose |
|---|---|
| **TailwindCSS v4** | Utility classes (minimal usage) |
| **Vanilla CSS-in-JS** | All component-specific styles written as template literals inside `<style>` tags in each component |
| **Google Fonts** | `IM Fell English` (headings), `Courier Prime` (body/monospace) |

### QR Codes
| Technology | Purpose |
|---|---|
| **qrcode** | Generates QR code PNG data URLs server-side, which are then uploaded to ImageKit |

### Other
| Technology | Purpose |
|---|---|
| **Zod** | Form validation schemas |
| **lucide-react** | Icon set |
| **react-webcam** | In-browser webcam access for capturing member photos |

---

## 3. Project Structure

```
bjp/
├── app/
│   ├── actions/
│   │   ├── admin.ts          # Server action: create new user
│   │   └── idcard.ts         # Server actions: create, update, delete ID cards
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard (user provisioning)
│   ├── api/
│   │   ├── auth/             # NextAuth API route handlers
│   │   └── idcards/
│   │       └── export/
│   │           └── route.ts  # [NEW] GET all ID cards for ZIP export (no pagination)
│   ├── employee/             # Employee dashboard
│   ├── idcards/
│   │   ├── new/              # Create / Edit ID card form
│   │   └── page.tsx          # ID cards list page (server component)
│   ├── login/                # Login page
│   ├── temp1/, temp2/        # Dev/staging temporary pages
│   ├── globals.css           # Global base styles
│   └── layout.tsx            # Root layout
├── components/
│   ├── DeleteButton.tsx      # Delete ID card button (server action form)
│   ├── IdCardsClient.tsx     # [MODIFIED] Main ID card list client component
│   ├── Navbar.tsx            # Navigation bar
│   └── PrintButton.tsx       # Legacy print trigger button
├── lib/
│   ├── exportCards.ts        # [NEW] Client-side ZIP export utility
│   ├── imagekit.ts           # ImageKit client instance
│   └── prisma.ts             # Prisma client singleton (with Neon adapter)
├── prisma/
│   └── schema.prisma         # Database schema (User, IdCard, QrCode models)
├── public/
│   └── ID_Card_Format/
│       ├── card-front.png    # ID card front template image
│       └── card-back.png     # ID card back template image
├── auth.ts                   # NextAuth config with Credentials provider
├── auth.config.ts            # Shared auth config (JWT/session callbacks, pages)
├── proxy.ts                  # Middleware: route protection & role-based redirects
├── next.config.ts            # Next.js config (ImageKit remote image patterns)
├── prisma.config.ts          # Prisma CLI config (points to schema, datasource URL)
├── .env                      # Environment variables (git-ignored)
└── package.json
```

---

## 4. Environment Variables

Create a `.env` file in the project root with these variables:

```env
# ── Database (Neon PostgreSQL) ──────────────────────────────────────────────
# Get from: https://neon.tech → your project → Connection Details
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&channel_binding=require"

# ── NextAuth ─────────────────────────────────────────────────────────────────
# Generate AUTH_SECRET with: npx auth secret
AUTH_SECRET="your-random-32-char-secret"
AUTH_URL="http://localhost:3000"

# ── ImageKit ─────────────────────────────────────────────────────────────────
# Get from: https://imagekit.io → Dashboard → Developer Options → API Keys
IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
```

---

## 5. Database Schema

Defined in [`prisma/schema.prisma`](../prisma/schema.prisma). Uses **PostgreSQL** via the Neon serverless adapter.

### Models

#### `User`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String? | Optional display name |
| `email` | String | Unique — used for login |
| `password` | String | bcrypt-hashed |
| `role` | Enum: `USER` / `ADMIN` | Default: `USER` |
| `idCards` | IdCard[] | Relation |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

#### `IdCard`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | Member name |
| `designation` | String? | Optional (e.g. President, Treasurer) |
| `address` | String | Full address |
| `area` | String | Local area/taluk |
| `mobileNo` | String | Contact number |
| `state` | String | State |
| `constituency` | String | Constituency (e.g. Belagavi Dakshin) |
| `membershipNo` | String | Unique membership number |
| `photoUrl` | String | ImageKit CDN URL |
| `qrCode` | QrCode? | One-to-one relation |
| `createdBy` | User | Relation to creator |
| `createdAt` | DateTime | Auto |

#### `QrCode`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `qrIdNo` | String | Unique — format: `BJPBGMDAK000001` |
| `qrImageUrl` | String | ImageKit CDN URL of the QR PNG |
| `idCard` | IdCard | One-to-one (cascade delete) |

---

## 6. Authentication

- **Provider:** Credentials (email + password)
- **Library:** NextAuth v5 (`next-auth@5.0.0-beta.30`)
- **Password:** bcrypt hashed with salt rounds of 10
- **Roles:** `ADMIN`, `USER`
- **Route Protection:** Handled in [`proxy.ts`](../proxy.ts) (Next.js middleware)

### Role-based Routing

| URL Pattern | Rule |
|---|---|
| `/admin/*` | Must be logged in **and** have `ADMIN` role; otherwise redirected to `/employee` |
| `/employee/*` | Must be logged in; otherwise redirected to `/login` |
| `/login` | If already logged in, redirected to `/admin` (ADMINs) or `/employee` (USERs) |

---

## 7. Features & Pages

### `/login`
Standard credential login form. On success, redirects based on role.

### `/admin`
Admin-only. Allows creating new user accounts (name, email, temp password).

### `/idcards` — ID Card Registry
- Searchable, paginated table of all ID cards
- Columns: Photo, Name & Membership No, Designation, Mobile, Area/State, Constituency
- Per-row checkboxes for selective print/export
- **Select All** checkbox in header
- Configurable items per page (10 / 20 / 50 / 100)

### `/idcards/new`
- Full member form: name, designation, address, area, mobile, state, constituency, membership no
- **Webcam photo capture** (react-webcam)
- On submit: uploads photo to ImageKit, generates QR code, uploads QR to ImageKit, saves to DB
- Supports edit mode via `?edit=<id>` query param

---

## 8. Changelog — What Was Added / Changed

---

### Session: August 15, 2026

#### 🟢 Added — Environment Setup
- Cloned repository to `d:\Eighty_eight\bjp`
- Created `.env` file with all required secrets
- Ran `npm install` (501 packages installed)
- Ran `npx prisma db push` to sync schema to Neon PostgreSQL database
- Seeded first admin user: `aryan@gmail.com` / `1111` with role `ADMIN`
- Started dev server on `http://localhost:3000`

---

#### 🟢 Added — ZIP Export Feature

**Motivation:** Previously, ID cards could only be exported via `window.print()` (browser print dialog), which rendered 3 cards per A4 page. The new feature exports each person's front and back card as individual JPEG files, bundled into a ZIP archive — one folder per person.

---

##### New File: [`app/api/idcards/export/route.ts`](../app/api/idcards/export/route.ts)

**What it does:**
A new Next.js App Router `GET` API route at `/api/idcards/export`.

- Checks the user's session (auth-gated — returns 401 if not logged in)
- Queries **all** `IdCard` records from the database, including their related `QrCode`
- Returns the full list as JSON — **no pagination** (unlike the regular `/idcards` page which paginates)

**Why a separate API route?**
`IdCardsClient` is a `"use client"` component and cannot call Prisma directly. A dedicated API route allows the client to fetch all cards on-demand when the user clicks Export, without changing the page's existing paginated rendering.

**Tech used:** Next.js App Router Route Handler, Prisma ORM, NextAuth session check

---

##### New File: [`lib/exportCards.ts`](../lib/exportCards.ts)

**What it does:**
The core client-side export engine. Exported function: `exportCardsAsZip(cards, withDesignation, onProgress)`.

**Step-by-step flow:**
1. Dynamically imports `html2canvas`, `jszip`, and `file-saver` (tree-shaken, never runs on server)
2. For each card:
   - **Front card:** Creates a `<div>` imperatively via DOM APIs with inline styles that replicate the print layout. The div contains: the `card-front.png` background image, the member's name, membership number, and photo (from ImageKit CDN). The element is appended off-screen (`position: fixed; left: -9999px`).
   - Waits for all `<img>` tags to fully load (`onload` promises)
   - Calls `html2canvas(element, { scale: 2, useCORS: true })` → captures as `<canvas>` → exports as JPEG (`toDataURL('image/jpeg', 0.92)`) → strips base64 header
   - Removes the element from DOM
   - Repeats the same process for the **back card** (uses `card-back.png`, shows name, optional designation, address, QR code image)
   - Adds both JPEGs to a JSZip folder named `{membershipNo}_{MemberName}/`
   - Updates the progress callback after each card
3. Calls `zip.generateAsync({ type: 'blob' })` to build the ZIP in memory
4. Calls `saveAs(blob, 'id-cards-export.zip')` to trigger browser download

**Card dimensions:** 325 × 204 px (equivalent to 86mm × 54mm at ~100 DPI). With `scale: 2` in html2canvas, output JPEGs are **650 × 408 px**.

**Folder naming:** `{membershipNo}_{Name_with_underscores}/` — supports Unicode/Devanagari characters.

**Tech used:** `html2canvas`, `JSZip`, `file-saver`, vanilla DOM APIs, dynamic `import()`

---

##### Modified File: [`components/IdCardsClient.tsx`](../components/IdCardsClient.tsx)

**What changed:**

| Area | Before | After |
|---|---|---|
| Imports | No export-related imports | Added `import { exportCardsAsZip } from "@/lib/exportCards"` |
| State | 4 state variables (print-only) | +3 state variables: `showExportChoice`, `isExporting`, `exportProgress` |
| Header buttons | Print + Create | **Export ZIP** + Print + Create (3 buttons) |
| Export modal | — | New modal: "Export Preference" — asks With/Without Designation |
| Progress overlay | — | New fixed overlay with animated progress bar: *"Processing card X of Y"* |
| `handleExport()` | — | Opens the export choice modal |
| `handleExportChoice(withDesignation)` | — | Fetches all cards from `/api/idcards/export`, respects checkbox selection, calls `exportCardsAsZip`, handles errors |
| CSS | Print choice modal styles only | + Export progress overlay styles (`.export-progress-*` classes) |

**Export scope logic:**
- If **no cards are selected** → exports **all cards** in the database (fetched fresh, not just current page)
- If **cards are selected via checkboxes** → exports only those selected cards (matched by ID against the full API response)

**Button styling:**
All three action buttons (`⬇ Export ZIP`, `Print ID Cards`, `+ Create New ID Card`) use the same `idlist-create-btn` class for visual consistency. They are differentiated only by background colour:

| Button | Background |
|---|---|
| ⬇ Export ZIP | `#4a6741` (forest green) |
| Print ID Cards | `#5a4a32` (medium brown) |
| + Create New ID Card | `#3a2e22` (dark brown) |

---

#### 🗑 Removed / Cleaned Up
- `seed.mjs` — temporary seeding script deleted after use
- `.export-zip-btn` CSS class — removed after refactoring button to use `idlist-create-btn`

---

### Session: August 15, 2026 (Part 2) — Production Card Image & Text Fixes

#### 🟢 Added & Modified — Background Image Visibility & Preloading
- **Image preloading on screen:** In [`components/IdCardsClient.tsx`](../components/IdCardsClient.tsx), changed print layout screen media hiding styling from `display: none` to an off-screen container (`position: absolute; left: -9999px; top: -9999px; width: 0; height: 0; overflow: hidden;`). This ensures the browser preloads and caches both background templates (`card-front.png`, `card-back.png`) and member photo images upon initial page load, preventing blank images in print previews and ZIP exports on production (Vercel).
- **CORS removal for local templates:** In [`lib/exportCards.ts`](../lib/exportCards.ts), removed the `crossOrigin = "anonymous"` attribute from the local template background images, which was failing CORS checks on Vercel since it serves local static files without CORS wildcard headers by default. Also converted absolute URL template paths using `${origin}` to absolute-looking relative paths.

#### 🟢 Added & Modified — ZIP Export Layout & Text Truncation
- **`inline-block` layout:** In [`lib/exportCards.ts`](../lib/exportCards.ts), changed all flexbox alignments (`display: flex; align-items: center;`) in the front and back card templates to inline-block positioning (`display: inline-block; vertical-align: top;`), as `html2canvas` has rendering bugs calculating bounding boxes and line-heights for flex items.
- **Removed `overflow: hidden` from canvas elements:** In [`lib/exportCards.ts`](../lib/exportCards.ts), removed `overflow: hidden; text-overflow: ellipsis;` from the export value elements. This completely prevents `html2canvas` from clipping the top halves of letters during canvas drawing.
- **JavaScript-based truncation:** Introduced a `truncateText` helper in [`lib/exportCards.ts`](../lib/exportCards.ts) to safely truncate long strings in JavaScript (Name, State, Constituency, Designation) before rendering, preventing horizontal overflow into adjacent card components.

---

## 9. Running Locally

```bash
# 1. Clone
git clone https://github.com/bgmbjpdakshin-wq/bgmbjpdakshin.git
cd bgmbjpdakshin

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.example (or create .env manually — see Section 4)

# 4. Sync database schema
npx prisma db push

# 5. Seed an admin user (one-time setup)
# Create a temporary seed.mjs, run it, then delete it
# OR use Prisma Studio: npx prisma studio

# 6. Start the dev server
npm run dev
# → http://localhost:3000
```

### Default Login (after seeding)
| Email | Password | Role |
|---|---|---|
| `aryan@gmail.com` | `1111` | ADMIN |

---

> [!NOTE]
> The `.env` file is git-ignored. Never commit secrets to the repository.

> [!TIP]
> If member photos don't appear in exported JPEGs, it may be a CORS issue with ImageKit. Ensure `useCORS: true` is set in html2canvas (it is, by default in this project) and that ImageKit's CORS settings allow your domain.
