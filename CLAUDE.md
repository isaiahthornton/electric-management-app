# Electric Management App

Revature Project 1: a mock electric utility management system built in Angular, demoed to the client (an electric utility). Scope is 1–2 weeks. Use a fictional company name in the UI, not a real utility's branding.

## How to help me

- I'm learning Angular and want to write the code myself. Guide me step by step: explain the concept first (plain-English analogy, then code), then tell me what to write and where. Don't create or edit files unless I ask you to.
- One small step at a time, and we run it (`ng serve`) before moving on.
- When I hit an error, help me read it and find the cause rather than just pasting a fix.
- Keep examples consistent with this app's own models (Customer, Meter, Bill, etc.).

## Stack and conventions

- Angular 22, standalone components (no NgModules), `bootstrapApplication` in `main.ts`.
- New file naming: `customer-list.ts` / `customer-list.html` with class `CustomerList` (no `.component` suffix).
- State in signals (`signal`, `computed`, `.set`, `.update`); read in templates as `{{ value() }}`.
- Templates use built-in control flow: `@if`, `@for` (with `track`), `@switch`.
- `inject()` for dependencies instead of constructor injection.
- Routing in `app.routes.ts`; lazy pages with `loadComponent`.
- Plain CSS.
- No backend yet: a mock data service holds seed data in signals.
- SSR was enabled at `ng new` (`server.ts`, `app.routes.server.ts`). Code that touches `localStorage` or `window` must only run in the browser.

## Features

Customer: register/login, view meter readings, monthly energy usage, billing history (pay a bill), report an outage.

Admin: manage customer accounts, update meter info, configure rate plans, view billing periods, track and update outages.

## Build plan

1. Clean slate: clear the starter `app.html`.
2. Models: interfaces for Customer, Meter, MeterReading, Bill, RatePlan, Outage.
3. Mock data service with seed data in signals.
4. Routing and layout: navbar, empty customer and admin pages.
5. Mock login/register and route guards (customer vs admin).
6. Customer features, one page at a time.
7. Admin features, one page at a time.

## Commands

- `ng serve` — dev server at http://localhost:4200
- `ng generate component <path>` — new component
- `ng generate service <path>` — new service
- `ng build` — production build
