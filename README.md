# Thornton Energy: Electric Management App

A customer portal and operations back office for **Thornton Energy Inc.**, a fictional electric utility serving central New Jersey. Customers pay bills, track usage, compare rate plans, and report outages. Admins manage accounts, meters, rate plans, billing runs, and the outage repair queue.

Built with **Angular 22** as Revature Project 1. The app talks to a mock REST API (json-server) through `HttpClient`, so it can be pointed at a real backend by changing one URL.

---

## Features

### Customer portal (`/account`)

| Page | What it does |
|---|---|
| **Dashboard** | Balance due and next due date, this month's usage vs. last month, banners for active outages |
| **Usage** | 12-month bar chart of kWh calculated from meter readings, with total, average, and peak month |
| **Billing** | Bill history filterable by status; each bill opens a detail page with line items and **Pay Now** |
| **Outages** | Report an outage (address pre-filled) and follow the status of past reports |
| **Rate Plans** | Estimates what every plan would cost *this* customer from their real average usage, and switches plans in one click |

### Admin portal (`/admin`)

| Page | What it does |
|---|---|
| **Dashboard** | Customer count, outstanding balance, kWh billed in the latest period, active outages, average repair time |
| **Customers** | Search by name, account number, email, or address; filter and change account status |
| **Billing** | Month-by-month totals, plus a **billing run** that generates bills from meter readings and each customer's rate plan |
| **Meters** | Latest reading per meter, meter status, and reading entry (readings must be later and higher than the last one) |
| **Rate Plans** | Create, edit, and delete plans; plans with customers on them can't be deleted |
| **Outages** | Repair queue in three columns: Reported → In Progress → Resolved, with time-to-fix |
| **Inbox** | Messages sent from the public Contact page, with unread tracking |

### Public site

Landing page, About (company history, service area, leadership), Contact (message form and FAQ), Login, Register for online access, and a 404 page.

---

## Getting started

### Prerequisites

- **Node.js 22.22.3+ or 24.15+** (Angular 22's minimum; check with `node -v`)
- npm (comes with Node)

### Install and run

```bash
npm install

# Terminal 1: the mock API on http://localhost:3000
npm run api

# Terminal 2: the Angular app on http://localhost:4200
npm start
```

Both must be running. The app shows "Could not load…" messages if the API isn't up.

### Reset the demo data

Payments, registrations, outages, and messages are saved to `db.json` as you use the app. To restore the original demo state:

```bash
npm run reset-db
```

This copies `db.seed.json` over `db.json`. The API picks up the change automatically. Log out and back in afterward if you were signed in.

### Run the tests

```bash
npm test -- --watch=false
```

Unit tests use Vitest. They cover the auth guard (logged out, wrong role, right role), login (password never stored, suspended accounts blocked), bill payment and overdue detection, billing math, usage calculation, the password-match validator, the status pipe and directive, and that every page component can be created. The API does not need to be running.

---

## Demo accounts

| Role | Email | Password | Good for showing |
|---|---|---|---|
| Admin | `support@thornenergy.com` | `admin123` | Every admin page |
| Customer | `jane@example.com` | `jane123` | Unpaid bill, active outage banner, 12 months of usage |
| Customer | `john@example.com` | `john123` | An **overdue** bill, Time-of-Use plan |
| Customer | `maria@example.com` | `maria123` | Fully paid account on the Green Energy plan |
| *Unregistered* | Robert Chen | n/a | **Register live** at `/register` with account `TE-100004` and `robert@example.com` |

> Passwords are stored in plain text in `db.json` because this is a mock. See [Limitations](#limitations).

### Suggested walkthrough

1. **Landing → Register** as Robert to show online-access signup.
2. **Robert's dashboard**: balance, usage, and his open outage.
3. Log in as **Jane** → **Rate Plans**: she would save about $26/month on Time-of-Use.
4. **Billing** → open September → **Pay Now**. The dashboard balance drops to $0.
5. **Contact** → send a message.
6. Log in as **Admin** → **Inbox** shows the message; **Outages** → resolve Jane's outage, and her banner disappears.
7. **Meters** → enter a Nov 1, 2026 reading for one or more meters → **Billing** → run October 2026. Customers with both readings get a new bill; the rest are listed as skipped, with the reason.
8. `npm run reset-db` before the next demo.

---

## How it works

```
index.html + main.ts ── bootstrapApplication(App, appConfig)
        │                 (provideRouter + provideHttpClient)
        ▼
App shell ── Navbar · <router-outlet /> · Footer
        ▼
Router (app.routes.ts) + authGuard ── checks login and role, lazy-loads the page
        ▼
Page component ── inject() services, subscribe(), store results in signals,
        │          computed() derives balances, usage, and estimates
        ▼
Services ── one per collection, return Observables from HttpClient
        ▼
json-server :3000 ── reads and writes db.json
```

- **Components never call the API directly.** Every HTTP call lives in a service in `services/`, and every URL is built from `API_URL` in `utils/api.ts`. Replacing json-server with a real backend (for example ASP.NET Core) means changing that one constant.
- **Login state** lives in `AuthService` as a `BehaviorSubject`, persisted to `sessionStorage`. The navbar watches it with `toSignal`, and the guard reads it before every protected route.
- **One guard protects both portals.** Each route declares `data: { role: 'customer' | 'admin' }`, and `authGuard` redirects logged-out users to `/login?returnUrl=…` and wrong-role users to their own portal.

### Data model (`db.json`)

| Collection | Links to | Notes |
|---|---|---|
| `users` | `customers` via `customerId` | `null` for admins |
| `customers` | `ratePlans` via `ratePlanId` | Account number, address, status |
| `meters` | `customers` via `customerId` | |
| `meterReadings` | `meters` via `meterId` | Running totals; monthly usage = this reading − last reading |
| `bills` | `customers` via `customerId` | Stores its own charges so past bills don't change with rate plans |
| `outages` | `customers` via `customerId` | `timeResolved` is set and cleared together with `status` |
| `ratePlans` | n/a | Price per kWh and monthly fee |
| `messages` | n/a | From the Contact page |

---

## Project structure

```
src/app/
├── components/
│   ├── account/      Customer portal: layout, dashboard, usage, billing, bill detail, outages, rate plans
│   ├── admin/        Admin portal: layout, dashboard, customers, billing, meters, rate plans, outages, inbox
│   └── ...           Public pages: landing, about, contact, login, register, navbar, footer, not-found
├── directives/       StatusBadge: colors a badge by its status
├── guards/           authGuard: login + role check with returnUrl
├── interfaces/       Data shapes: Customer, Bill, Meter, Outage, RatePlan, User, Message, …
├── pipes/            StatusLabelPipe: 'in_progress' → 'In Progress'
├── services/         One per collection: Auth, Customer, Bill, Meter, Outage, RatePlan, Message
└── utils/            api.ts, billing.ts, usage.ts, dates.ts, validators.ts
```

---

## Angular concepts used

- **Standalone components** with lazy-loaded routes (`loadComponent`) and child routes
- **Signals**: `signal`, `computed`, `toSignal`, `@let`, and signal two-way binding with `ngModel`
- **RxJS**: `HttpClient` Observables, `pipe`, `map`, `switchMap`, `tap`, `forkJoin`, `BehaviorSubject`
- **Forms**: template-driven (Login) and reactive (Register, Contact, admin forms), with a custom cross-field validator
- **Routing**: functional `CanActivate` guard, route `data`, route parameters, `returnUrl` redirects, wildcard 404
- **Custom pipe and directive**: `statusLabel` and `appStatusBadge` (host bindings)
- **Built-in control flow**: `@if`, `@for` with `track`, `@switch`, `@empty`
- **`NgOptimizedImage`** for photos
- **Full CRUD** over HTTP: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`

---

## Design decisions worth knowing

- **Dates are stored as strings** (`'2026-10-21'`) and displayed with `DatePipe` in `'UTC'`. Without that, a date-only string shows one day early in US time zones.
- **`todayIso()` and `nowIso()` build dates from local time**, because `toISOString()` is UTC and would stamp the next day after 8 pm in New York.
- **json-server's cascade delete is turned off** (`--fks _fk`). By default, deleting a record also deletes everything that references it, and the admin user's `customerId: null` crashed that check.
- **Login only follows in-app `returnUrl` paths** (starting with a single `/`), which prevents an open redirect to another site.
- **Overdue is calculated, not stored.** `BillService` marks any unpaid bill past its due date as `overdue` when bills load, so the status is always current.
- **The password never reaches `sessionStorage`.** `AuthService` saves the user record without it (`SessionUser = Omit<User, 'password'>`).
- **Suspended and closed accounts can't log in.** Login checks the customer's account status and shows a customer-care message instead.
- **Customers can't open other customers' bills** by typing an id into the URL; the bill page checks ownership.

---

## Limitations

This is a front-end demo with a mock API, so some things a production utility portal would need are intentionally out of scope:

- **Authentication is simulated.** Passwords are plain text in `db.json` and checked by query; the session is a copy of the user record in `sessionStorage`. A real system would hash passwords and issue tokens from a server.
- **Authorization is client-side.** Guards and ownership checks run in the browser. A real API must enforce them on the server.
- **Payments are simulated.** "Pay Now" marks a bill paid; no payment details are collected.
- **Time-of-Use estimates use a flat rate.** Real Time-of-Use pricing depends on when energy is used.

## Possible next steps

- Replace json-server with an **ASP.NET Core Web API + Entity Framework Core** (the interfaces map directly to C# entities)
- Move `API_URL` into Angular environment files for dev/prod
- Add an HTTP interceptor for global error handling

---

## Author

**Isaiah**: B.A. Information Technology and Informatics, Rutgers University (2026). Revature .NET Full Stack training.

Thornton Energy Inc., its people, and its data are fictional. Photos are from free stock libraries (Unsplash / Pexels).
