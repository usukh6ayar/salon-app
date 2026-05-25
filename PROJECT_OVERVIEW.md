# Salon Booking App — Technical Project Overview

> Generated from codebase inspection (May 2026). Repository: `salon-app` — monorepo with `server/` (API) and `client/` (mobile).

---

## 1. Project Summary

### What the application does

**Salon Booking App** is a full-stack salon appointment platform aimed at users in **Ulaanbaatar, Mongolia**. Customers can discover salons, browse stylists and services, check stylist availability, book appointments, and pay (simulated). The backend exposes a REST API; the mobile client is an Expo/React Native scaffold wired for the full booking flow.

### Main features

| Area | Status |
|------|--------|
| User registration & login (JWT) | **Implemented** (backend) |
| Salon listing & detail (with stylists/services) | **Implemented** (backend) |
| Stylists & services per salon | **Implemented** (backend) |
| Stylist availability (30-min slots, 09:00–18:00) | **Implemented** (backend) |
| Create / list / cancel bookings | **Implemented** (backend) |
| Simulated payments (card, qpay, socialpay) | **Implemented** (backend) |
| Saved payment cards | **Implemented** (backend) |
| Seed data (5 UB salons, stylists, services, test user) | **Implemented** |
| Mobile UI & API integration | **Scaffold only** (placeholder screens) |
| User roles (admin/salon owner) | **Not implemented** |
| Push/email notifications | **Not implemented** |
| Docker / production deployment config | **Not implemented** |

### Tech stack

| Layer | Technologies |
|-------|----------------|
| **Mobile** | React Native 0.81, Expo ~54, React 19 |
| **Navigation** | React Navigation 7 (stack + bottom tabs) |
| **Client state** | Zustand 5, AsyncStorage |
| **HTTP client** | Axios |
| **Backend** | Node.js, Express 4 |
| **Database** | PostgreSQL (`pg` connection pool) |
| **Auth** | bcryptjs, jsonwebtoken (7-day JWT) |
| **Logging** | morgan |
| **Dev** | nodemon (server), Expo CLI (client) |

**Declared but unused in application code:** `express-validator` (listed in `server/package.json`, no imports in `server/src/`).

---

## 2. Folder Structure

```
salon-app/
├── PROJECT_OVERVIEW.md          # This document
├── UI UX (1)/                   # Design mockups (PNG screens, not wired to code)
├── server/                      # Node.js + Express API
│   ├── .env.example             # Environment template
│   ├── .env                     # Local secrets (not committed)
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── app.js               # Express entry, middleware, route mounting
│       ├── controllers/         # Request handlers (business logic + SQL)
│       ├── routes/              # Express routers
│       ├── middleware/          # JWT auth middleware
│       └── db/
│           ├── index.js         # pg Pool + query helper
│           ├── migrate.js       # CREATE TABLE migrations
│           └── seed.js          # Sample UB salon data
└── client/                      # Expo React Native app
    ├── App.js                   # Root: SafeAreaProvider + NavigationContainer
    ├── app.json                 # Expo config
    ├── babel.config.js
    ├── package.json
    └── src/
        ├── api/client.js        # Axios instance + interceptors
        ├── components/          # Empty (.gitkeep only)
        ├── navigation/          # AppNavigator, AuthNavigator, MainNavigator
        ├── screens/
        │   ├── auth/            # Login, Register (placeholders)
        │   └── main/            # Booking flow + Profile (placeholders)
        └── store/               # Zustand: authStore, bookingStore
```

### Frontend folders (`client/`)

| Path | Purpose |
|------|---------|
| `App.js` | App root; imports `react-native-gesture-handler`; wraps navigators |
| `app.json` | Expo app name, slug, orientation |
| `babel.config.js` | `babel-preset-expo` |
| `src/api/client.js` | Shared Axios client, JWT attach, 401 → logout |
| `src/navigation/` | Auth vs main routing, booking stack inside Home tab |
| `src/screens/auth/` | Login / Register placeholder UIs |
| `src/screens/main/` | Home → SearchLocation → … → PaymentStatus + Profile |
| `src/store/` | Global auth and in-progress booking selection state |
| `src/components/` | Reserved for reusable UI (empty) |

### Backend folders (`server/`)

| Path | Purpose |
|------|---------|
| `src/app.js` | Express setup, `/health`, mounts all `/api/*` routes |
| `src/routes/` | URL mapping to controllers |
| `src/controllers/` | Handlers; direct `query()` calls (no separate service layer) |
| `src/middleware/auth.js` | `verifyToken` — JWT Bearer validation |
| `src/db/index.js` | PostgreSQL pool, `query()`, startup connection test |
| `src/db/migrate.js` | Schema creation script |
| `src/db/seed.js` | Idempotent sample data for development |

### Database-related files

| File | Role |
|------|------|
| `server/src/db/migrate.js` | Creates 7 tables via `CREATE TABLE IF NOT EXISTS` |
| `server/src/db/seed.js` | Inserts salons, stylists, services, test user |
| `server/src/db/index.js` | Runtime DB access |
| `server/.env.example` | `PORT`, `DATABASE_URL`, `JWT_SECRET` |

**Not present:** migration versioning tool (e.g. Knex/Flyway), separate SQL files, ORM models.

---

## 3. Development Phases

Phases reflect **git history** and implemented scope (May 19–20, 2026).

### Phase 1: Project setup and architecture — **Complete (backend + client scaffold)**

- Express scaffold: `server/src/app.js`, folder layout, `GET /health`
- PostgreSQL pool: `server/src/db/index.js`
- Expo client scaffold: navigation, stores, API client shell
- Commits: `6ae6f5e`, `c5acddf`

### Phase 2: Authentication — **Complete (backend); Not implemented (frontend UI)**

- Register/login, bcrypt hashing, JWT (`authController.js`, `middleware/auth.js`)
- Client: `authStore.js`, interceptors; screens are placeholders only
- Commit: `8a8e5f6`

### Phase 3: User roles — **Not implemented**

- No `role` column on `users`
- No admin/salon-owner routes or authorization checks

### Phase 4: Salon and stylist management — **Read-only API complete**

- Migrations + seed (`27ceb92`, `84110df`)
- Salons list/detail; stylists & services by salon; availability endpoint
- Commits: `353eb0a`, `a02aaa0`
- No CRUD for salon owners to manage their own data

### Phase 5: Booking system — **Complete (backend)**

- Create, list (my bookings), cancel pending bookings
- Conflict check on stylist + date + time
- Commit: `c347fe7`

### Phase 6: Payment integration — **Simulated only**

- Random 90% success; updates booking to `confirmed` on success
- Saved cards CRUD (metadata only, no real PSP)
- Commit: `bd993c0`
- **Not implemented:** QPay/SocialPay/Stripe real integration

### Phase 7: Notifications — **Not implemented**

- No notification tables, services, or push/email logic

### Phase 8: Deployment and Docker — **Not implemented**

- No `Dockerfile`, `docker-compose.yml`, CI/CD, or deployment manifests in repo

---

## 4. Frontend Architecture

### Navigation structure

```
App.js
└── NavigationContainer
    └── AppNavigator.js
        ├── [not logged in] AuthNavigator (Stack)
        │   ├── Login
        │   └── Register
        └── [logged in] MainNavigator (Bottom Tabs)
            ├── HomeTab → HomeStackNavigator (Stack)
            │   ├── Home
            │   ├── SearchLocation
            │   ├── SalonDetail
            │   ├── StylistSelect
            │   ├── DateTime
            │   ├── Checkout
            │   ├── Payment
            │   └── PaymentStatus
            └── Profile
```

Files: `client/src/navigation/AppNavigator.js`, `AuthNavigator.js`, `MainNavigator.js`.

### Screens

| Screen file | Route name | Implementation |
|-------------|------------|----------------|
| `screens/auth/LoginScreen.js` | Login | Placeholder text only |
| `screens/auth/RegisterScreen.js` | Register | Placeholder text only |
| `screens/main/HomeScreen.js` | Home | Placeholder |
| `screens/main/SearchLocationScreen.js` | SearchLocation | Placeholder |
| `screens/main/SalonDetailScreen.js` | SalonDetail | Placeholder |
| `screens/main/StylistSelectScreen.js` | StylistSelect | Placeholder |
| `screens/main/DateTimeScreen.js` | DateTime | Placeholder |
| `screens/main/CheckoutScreen.js` | Checkout | Placeholder |
| `screens/main/PaymentScreen.js` | Payment | Placeholder |
| `screens/main/PaymentStatusScreen.js` | PaymentStatus | Placeholder |
| `screens/main/ProfileScreen.js` | Profile | Placeholder |

### Components

**Not implemented.** `client/src/components/` contains only `.gitkeep`.

### Hooks

**Not implemented.** No `src/hooks/` directory; screens do not use custom hooks.

### Context providers

**Not implemented.** State uses **Zustand** instead of React Context.

### API service layer

| File | Role |
|------|------|
| `client/src/api/client.js` | Single Axios instance |

**Not implemented:** per-domain modules (e.g. `authApi.js`, `salonApi.js`). No screen imports `apiClient` yet.

```javascript
// client/src/api/client.js (summary)
baseURL: 'http://localhost:3000'
request: attach Bearer token from AsyncStorage
response: 401 → authStore.logout()
```

**Note:** On physical devices/emulators, `localhost` must be replaced with the machine LAN IP.

### State management

**Zustand** stores:

| Store | File | State | Actions |
|-------|------|-------|---------|
| Auth | `store/authStore.js` | `user`, `token`, `isLoggedIn` | `login`, `logout`, `loadFromStorage` |
| Booking | `store/bookingStore.js` | `selectedSalon`, `selectedStylist`, `selectedService`, `selectedDate`, `selectedTime` | `setSalon`, `setStylist`, `setService`, `setDateTime`, `clearBooking` |

`AppNavigator` calls `loadFromStorage()` on mount before choosing Auth vs Main.

---

## 5. Backend Architecture

### Express server structure

```
Request → cors → morgan → express.json() → route → [verifyToken?] → controller → pg query → JSON response
```

Entry: `server/src/app.js` — listens on `PORT` (default 3000), runs `testConnection()` on startup.

### Routes

| Mount path | File | Auth |
|------------|------|------|
| `/health` | inline in `app.js` | No |
| `/api/auth` | `routes/auth.js` | No |
| `/api/salons` | `routes/salons.js` | No |
| `/api/stylists` | `routes/stylists.js` | No |
| `/api/bookings` | `routes/bookings.js` | Yes (all routes) |
| `/api/payments` | `routes/payments.js` | Yes (all routes) |

### Controllers

| Controller | File | Responsibilities |
|------------|------|------------------|
| Auth | `controllers/authController.js` | register, login |
| Salon | `controllers/salonController.js` | list/filter salons, salon detail + nested data |
| Stylist | `controllers/stylistController.js` | stylists/services by salon, availability slots |
| Booking | `controllers/bookingController.js` | create, my list, cancel |
| Payment | `controllers/paymentController.js` | pay, get payment, saved cards |

### Services

**Not implemented.** Controllers call `query()` from `db/index.js` directly.

### Middleware

| Middleware | File | Behavior |
|------------|------|----------|
| `verifyToken` | `middleware/auth.js` | Parses `Authorization: Bearer <token>`, verifies JWT, sets `req.user = { id, email }` |

Global: `cors()`, `morgan('dev')`, `express.json()`.

### Validation

- **Manual** null/empty checks in controllers
- **`express-validator`:** dependency present, **not used** in source

### Error handling

- Per-controller `try/catch` with `console.error` and generic JSON errors
- **Not implemented:** centralized error middleware, custom `AppError` class, validation error formatter

---

## 6. Database Design

### Tables and relationships

| Table | Description |
|-------|-------------|
| `users` | Customer accounts |
| `salons` | Salon locations (UB seed data) |
| `stylists` | Belongs to `salons` |
| `services` | Belongs to `salons` |
| `bookings` | Links user, salon, stylist, service, date/time |
| `payments` | Payment attempts per booking |
| `saved_cards` | Card metadata per user (no PAN storage) |

### Primary and foreign keys

- All tables use `id SERIAL PRIMARY KEY`
- FKs defined inline in `migrate.js` (no explicit `ON DELETE` behavior — PostgreSQL defaults apply)

### Important indexes

**Not implemented.** Migrations do not create secondary indexes beyond PK/UNIQUE:

- `users.email` — `UNIQUE` constraint only
- No indexes on `bookings(stylist_id, booking_date, booking_time)` (used heavily for conflicts/availability)

### Constraints

| Constraint | Location |
|------------|----------|
| `users.email` UNIQUE | migrate |
| FK references | salons ← stylists, services; users/salons/stylists/services ← bookings |
| Default `bookings.status` | `'pending'` |
| Default `salons.rating` | `0` |

### Booking status values (application-level)

- `pending` — created, awaiting payment
- `confirmed` — payment succeeded
- `cancelled` — user cancelled (pending only)

### Payment status values

- `completed`, `failed`

### Text ERD

```
users (1) ──────< bookings >────── (1) salons
  │                  │                    │
  │                  ├────── (1) stylists │
  │                  └────── (1) services │
  │                                       │
  ├──────< payments >────── bookings      │
  └──────< saved_cards                    │
                                          │
salons (1) ──────< stylists               │
         └──────< services                │
```

---

## 7. API Documentation

Base URL: `http://localhost:3000` (unless `PORT` overridden).

### Health

#### `GET /health`

| | |
|---|---|
| **Description** | Server liveness check |
| **Auth** | No |
| **Body** | — |
| **Response** | `{ "status": "ok" }` |

---

### Auth

#### `POST /api/auth/register`

| | |
|---|---|
| **Description** | Create account; returns JWT + user |
| **Auth** | No |
| **Body** | `{ "name", "email", "password", "phone" }` (all required) |
| **Success** | `201` — `{ "token", "user" }` (no `password_hash`) |
| **Errors** | `400` missing fields; `409` email exists; `500` |

**Example response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Болд",
    "email": "bold@example.com",
    "phone": "88112233",
    "avatar_url": null,
    "created_at": "2026-05-20T12:00:00.000Z"
  }
}
```

#### `POST /api/auth/login`

| | |
|---|---|
| **Description** | Authenticate; returns JWT + user |
| **Auth** | No |
| **Body** | `{ "email", "password" }` |
| **Success** | `200` — `{ "token", "user" }` |
| **Errors** | `400`, `401` invalid credentials, `500` |

**Test user (after seed):** `test@salon.com` / `test1234`

---

### Users

**Not implemented.** No `/api/users` routes (profile update, avatar, etc.).

---

### Salons

#### `GET /api/salons`

| | |
|---|---|
| **Description** | List salons, optional filters |
| **Auth** | No |
| **Query** | `city` (string), `minRating` (number) |
| **Success** | `200` — array of salon rows, ordered by `rating DESC` |

#### `GET /api/salons/:id`

| | |
|---|---|
| **Description** | Salon detail with nested `stylists` and `services` |
| **Auth** | No |
| **Success** | `200` — salon object + arrays |
| **Errors** | `404` |

**Example (abbreviated):**

```json
{
  "id": 1,
  "name": "Алтан Салаан",
  "city": "Улаанбаатар",
  "rating": "4.8",
  "stylists": [{ "id": 1, "name": "Болортуяа", "salon_id": 1 }],
  "services": [{ "id": 1, "name": "Үс тайрах", "price": "45000" }]
}
```

#### `GET /api/salons/:id/stylists`

| | |
|---|---|
| **Description** | Stylists for salon |
| **Auth** | No |
| **Success** | `200` — array |

#### `GET /api/salons/:id/services`

| | |
|---|---|
| **Description** | Services for salon |
| **Auth** | No |
| **Success** | `200` — array |

---

### Stylists

#### `GET /api/stylists/:id/availability?date=YYYY-MM-DD`

| | |
|---|---|
| **Description** | 30-minute slots 09:00–18:00 with availability flags |
| **Auth** | No |
| **Query** | `date` required (`YYYY-MM-DD`) |
| **Success** | `200` — array of `{ "time", "available" }` |
| **Errors** | `400`, `404` stylist not found |

**Example:**

```json
[
  { "time": "09:00", "available": true },
  { "time": "09:30", "available": false },
  { "time": "10:00", "available": true }
]
```

---

### Services

Services are exposed **via salon routes** (`/api/salons/:id/services`). No standalone `/api/services` router.

---

### Bookings

All routes require header: `Authorization: Bearer <token>`.

#### `POST /api/bookings`

| | |
|---|---|
| **Description** | Create booking (`status: pending`) |
| **Auth** | Yes |
| **Body** | `{ "salon_id", "stylist_id", "service_id", "booking_date", "booking_time" }` |
| **Success** | `201` — booking row |
| **Errors** | `400` validation/conflict/service not found; `500` |

#### `GET /api/bookings/my`

| | |
|---|---|
| **Description** | Current user's bookings with joined names |
| **Auth** | Yes |
| **Success** | `200` — array (`salon_name`, `stylist_name`, `service_name` included) |

#### `PATCH /api/bookings/:id/cancel`

| | |
|---|---|
| **Description** | Cancel own pending booking |
| **Auth** | Yes |
| **Success** | `200` — updated booking (`status: cancelled`) |
| **Errors** | `404`, `400` if not pending |

---

### Payments

All routes require JWT.

#### `POST /api/payments`

| | |
|---|---|
| **Description** | Simulated payment for pending booking |
| **Auth** | Yes |
| **Body** | `{ "booking_id", "amount", "method" }` — `method`: `card` \| `qpay` \| `socialpay` |
| **Success** | `201` — `{ "success", "payment", "booking" }` |
| **Logic** | ~90% `success: true` → payment `completed`, booking `confirmed` |

**Example:**

```json
{
  "success": true,
  "payment": {
    "id": 1,
    "booking_id": 2,
    "amount": "45000",
    "method": "qpay",
    "status": "completed"
  },
  "booking": {
    "id": 2,
    "status": "confirmed"
  }
}
```

#### `GET /api/payments/:bookingId`

| | |
|---|---|
| **Description** | Latest payment for booking (must belong to user) |
| **Auth** | Yes |
| **Errors** | `404` |

#### `GET /api/payments/cards`

| | |
|---|---|
| **Description** | List saved cards for user |
| **Auth** | Yes |

#### `POST /api/payments/cards`

| | |
|---|---|
| **Description** | Save card metadata |
| **Auth** | Yes |
| **Body** | `{ "last4", "brand", "exp_month", "exp_year" }` |

---

### Notifications

**Not implemented.** No notification endpoints.

---

## 8. Authentication Flow

### Register

1. Client `POST /api/auth/register` with name, email, password, phone.
2. Server validates required fields; checks duplicate email.
3. Password hashed with **bcrypt** (10 salt rounds).
4. User inserted; JWT signed with payload `{ id, email }`, expiry **7 days**.
5. Returns `token` + public user fields.

### Login

1. `POST /api/auth/login` with email/password.
2. Load user including `password_hash`; `bcrypt.compare`.
3. On success, same JWT + user response.

### JWT token generation

```javascript
// server/src/controllers/authController.js
jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
```

### Protected routes

`verifyToken` in `server/src/middleware/auth.js`:

- Expects `Authorization: Bearer <token>`
- Sets `req.user` to decoded payload (`id`, `email`)
- Used on all `/api/bookings` and `/api/payments` routes via `router.use(verifyToken)`

### Role-based authorization

**Not implemented.** Any authenticated user can access their own bookings/payments only (enforced by `user_id` checks in controllers, not roles).

### Client-side auth flow

1. `AppNavigator` → `loadFromStorage()` reads `token` + `user` from AsyncStorage.
2. If token exists → `MainNavigator`; else → `AuthNavigator`.
3. Axios interceptor attaches token; **401** triggers `logout()` (returns to auth stack).

---

## 9. Booking Workflow

### Appointment slot generation

Implemented in `stylistController.js` → `generateTimeSlots()`:

- Hours **9–18**, steps of **30 minutes**
- Last slot **18:00** (18:30 excluded)
- Produces strings `"09:00"` … `"18:00"`

### Availability check

`GET /api/stylists/:id/availability?date=YYYY-MM-DD`:

1. Validate date format.
2. Query `bookings` for `stylist_id` + `booking_date`.
3. Mark slot unavailable if `booking_time` matches (HH:MM).

**Known inconsistency:** Availability query does **not** filter `status != 'cancelled'`, while `createBooking` conflict check **does**. Cancelled bookings may still block slots in availability (see §16).

### Conflict prevention

On `POST /api/bookings`:

```sql
SELECT id FROM bookings
WHERE stylist_id = $1 AND booking_date = $2 AND booking_time = $3
AND status != 'cancelled'
```

Returns `400` if row exists.

### Transaction handling

**Not implemented.** Booking insert and payment update are separate queries without `BEGIN/COMMIT`. Payment failure after insert leaves booking `pending` (acceptable for current design).

### Client booking flow (intended)

Navigation order in `MainNavigator.js` matches: salon → stylist → date/time → checkout → payment → status. **Stores** hold selections; **screens do not call API yet.**

---

## 10. Payment Workflow

### How payment is initiated

1. User creates booking (`status: pending`).
2. `POST /api/payments` with `booking_id`, `amount`, `method`.
3. Server verifies booking belongs to `req.user.id` and is `pending`.

### Verification

**Simulated only** — no external PSP:

```javascript
const success = Math.random() < 0.9;  // paymentController.js
```

### Booking confirmation after successful payment

1. Insert `payments` row (`completed` or `failed`).
2. If success: `UPDATE bookings SET status = 'confirmed'`.
3. If failed: booking remains `pending`; failed payment row still stored.

### Saved cards

Metadata-only storage (`last4`, `brand`, expiry) — not used automatically during `createPayment`.

---

## 11. Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default `3000`) | HTTP port for Express |
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://localhost:5432/salondb` |
| `JWT_SECRET` | Yes | Secret for signing/verifying JWTs |

Template: `server/.env.example`

### Client

**Not implemented.** API base URL is hardcoded in `client/src/api/client.js`:

```javascript
baseURL: 'http://localhost:3000'
```

No `EXPO_PUBLIC_*` env usage.

---

## 12. Docker Setup

**Not implemented.**

| Artifact | Status |
|----------|--------|
| `Dockerfile` (server) | Missing |
| `Dockerfile` (client) | Missing |
| `docker-compose.yml` | Missing |
| Service networking | N/A |

To containerize in future: typical layout would be `postgres` + `api` services; Expo client builds separately (EAS) or uses dev server outside Docker.

---

## 13. Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- For mobile: Expo Go or iOS Simulator / Android Emulator

### Database

```bash
# Create database (example)
createdb salondb

cd server
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET

npm install
npm run migrate
npm run seed
```

### Backend

```bash
cd server
npm install
npm run dev    # nodemon on src/app.js
# or: npm start
```

Verify:

```bash
curl http://localhost:3000/health
```

### Frontend

```bash
cd client
npm install
npm start      # Expo dev server
# npm run ios | android | web
```

**Device testing:** Change `baseURL` in `client/src/api/client.js` to your computer's LAN IP (e.g. `http://192.168.1.10:3000`).

### Docker

**Not applicable** — no Docker config in repository.

---

## 14. Deployment Guide

**Not implemented in repo.** Recommended approach:

### Frontend deployment

- Build with **EAS Build** (`expo build` / EAS Submit)
- Configure `EXPO_PUBLIC_API_URL` (once env support added)
- Publish to App Store / Google Play

### Backend deployment

- Host on Railway, Render, Fly.io, or VPS
- Set `PORT`, `DATABASE_URL`, `JWT_SECRET` in platform secrets
- Run `npm run migrate` on deploy
- Use `npm start` (not nodemon) in production

### Database hosting

- Managed PostgreSQL (Neon, Supabase, RDS)
- Enable SSL in `DATABASE_URL` for production
- Restrict network access to API servers only

---

## 15. Current Completion Status

| Component | Estimate | Notes |
|-----------|----------|-------|
| **Backend API** | ~85% | Core flows done; no users CRUD, roles, real payments |
| **Database schema** | ~90% | Tables + seed; no indexes, no migrations versioning |
| **Frontend UI** | ~15% | Navigation + state scaffold; all screens placeholders |
| **Frontend ↔ API** | ~5% | Axios client ready; no API calls from screens |
| **Auth (end-to-end)** | ~50% | Backend complete; mobile login UI not built |
| **Notifications** | 0% | — |
| **Docker/Deploy** | 0% | — |
| **Tests** | 0% | No test files |

### Fully implemented

- Express server bootstrap and health route
- PostgreSQL migrations and seed
- JWT register/login
- Salons, stylists, services, availability APIs
- Bookings create/list/cancel
- Simulated payments + saved cards
- Client navigation tree and Zustand stores

### Partially implemented

- Mobile app (structure without business UI or API wiring)
- Payment flow (simulation only)
- Validation (manual only; express-validator unused)

### Missing

- Real payment gateways (QPay, SocialPay, card processor)
- User profile APIs
- Salon admin / stylist management
- Notifications
- Docker, CI/CD, production config
- Automated tests
- Frontend components, hooks, API modules
- Database indexes and transactional payment atomicity

---

## 16. Known Issues and TODOs

### TODO comments in project source

**None found** in `server/src/` or `client/src/` (grep for `TODO` / `FIXME`).

### Inferred issues / incomplete behavior

1. **Availability vs cancel:** `getStylistAvailability` treats all bookings as blocking; cancelled slots should be free (booking create already excludes cancelled).
2. **Confirmed bookings block slots:** Availability does not filter by status — `confirmed` bookings correctly block; ensure cancelled do not.
3. **Race condition:** Two simultaneous `POST /api/bookings` for same slot could both pass conflict check without DB unique constraint.
4. **Payment amount:** Server does not verify `amount` matches `total_price` on booking.
5. **Hardcoded API URL:** `localhost` fails on real devices without code change.
6. **No global 404 handler** for unknown API routes.
7. **`express-validator` installed but unused.**
8. **`server/node_modules` may be tracked in git** (repository hygiene issue).
9. **`.env` secrets:** Must not be committed; use `.env.example` only in VCS.

### Design assets not integrated

`UI UX (1)/` contains PNG mockups for screens (Home, Checkout, Payment, etc.) — reference designs only, not imported into React Native.

---

## 17. Security Considerations

| Topic | Status |
|-------|--------|
| **Password hashing** | bcrypt (10 rounds) in `authController.js` |
| **JWT** | HS256 with `JWT_SECRET`; 7-day expiry; payload minimal (`id`, `email`) |
| **Input validation** | Basic required-field checks; no schema library in use |
| **SQL injection** | Parameterized queries via `pg` (`$1`, `$2`, …) throughout |
| **TLS/HTTPS** | Not configured in app (deployment responsibility) |
| **CORS** | `cors()` enabled for all origins (dev-friendly; tighten in production) |
| **Card data** | Only last4/brand/exp stored — appropriate for demo; PCI not applicable |
| **Rate limiting** | **Not implemented** |
| **Helmet / security headers** | **Not implemented** |

---

## 18. Performance Considerations

| Topic | Status |
|-------|--------|
| **Indexes** | Only PK + `users.email` UNIQUE; add composite index on `bookings(stylist_id, booking_date, booking_time)` for scale |
| **Caching** | **Not implemented** (no Redis/in-memory cache) |
| **Query optimization** | Salon detail uses `Promise.all` for parallel queries (good); list endpoints select `*` |
| **Connection pooling** | `pg` Pool in `db/index.js` (default pool size) |
| **Scalability** | Single Node process; stateless API suitable for horizontal scaling behind load balancer once DB pool sized correctly |

---

## 19. Future Improvements

1. **Wire frontend** — Implement screens per `UI UX (1)/` mockups; add `authApi`, `salonApi`, etc.
2. **Environment-based API URL** — `EXPO_PUBLIC_API_URL` for dev/staging/prod.
3. **Fix availability query** — Exclude `cancelled` (and optionally only block `pending` + `confirmed`).
4. **DB constraints** — Unique index on `(stylist_id, booking_date, booking_time)` where status not cancelled; use transactions for payment.
5. **Real payments** — Integrate QPay/SocialPay; webhook verification; idempotency keys.
6. **User roles** — Salon owner dashboard; admin CRUD for salons/stylists/services.
7. **Notifications** — Email/SMS/push on booking confirm, reminder, cancel.
8. **Docker Compose** — `postgres` + `api` for one-command local dev.
9. **Tests** — Jest/Supertest for API; Detox for mobile critical paths.
10. **express-validator** — Replace ad-hoc validation; consistent error format.
11. **Service layer** — Extract business logic from controllers for maintainability.
12. **Observability** — Structured logging, health checks including DB readiness.

---

## 20. Glossary

| Term | Definition |
|------|------------|
| **JWT** | JSON Web Token — signed token used for stateless API authentication |
| **bcrypt** | Password hashing algorithm used before storing credentials |
| **Expo** | Toolkit/SDK for building React Native apps with simplified tooling |
| **Zustand** | Lightweight React state management library used on the client |
| **Migration** | Script (`migrate.js`) that creates/updates database tables |
| **Seed** | Script (`seed.js`) that inserts development sample data |
| **Stylist availability** | List of time slots with boolean `available` for a given date |
| **Pending booking** | Appointment created but not yet paid/confirmed |
| **MNT** | Mongolian Tögrög — currency used in seed service prices |
| **PSP** | Payment Service Provider (QPay, SocialPay, etc.) — not integrated yet |
| **Parameterized query** | SQL with `$1` placeholders to prevent injection |
| **Stack navigator** | React Navigation pattern for push/pop screens (booking flow) |
| **Tab navigator** | Bottom tabs (Home stack + Profile) |

---

## Appendix: Git History (reference)

| Commit | Message |
|--------|---------|
| `6ae6f5e` | feat: scaffold Express server with health route and env config |
| `27ceb92` | add PostgreSQL connection pool and database migrations |
| `84110df` | add seed data with Ulaanbaatar salons and stylists |
| `8a8e5f6` | implement register and login API with JWT |
| `353eb0a` | add salons list and detail API routes |
| `a02aaa0` | add stylists, services and availability API routes |
| `c347fe7` | add bookings API (create, list, cancel) |
| `bd993c0` | add payments API with success and failed states |
| `c5acddf` | feat: scaffold Expo frontend with navigation and state management |

---

*End of document.*
