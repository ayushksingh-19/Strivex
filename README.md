# Strivex

<p align="center">
  <img src="./public/strivex-logo-yellow.svg" alt="Strivex Logo" width="320" />
</p>

<p align="center">
  <strong>A cinematic fitness landing page with a real full-stack product underneath.</strong>
</p>

<p align="center">
  Strivex blends a premium gym-brand frontend with working authentication, live session booking,
  lead capture, admin tooling, and persistent local data.
</p>

---

## Overview

Strivex started as a visually bold fitness landing page and was expanded into a usable full-stack application.
The experience keeps the motion-heavy, editorial feel of the original design while adding real product behavior:

- Member signup and login
- Live class booking and cancellation
- Persistent lead capture
- Admin dashboard with metrics and operations
- Local database-backed data flow

This repository is ideal if you want a strong branded frontend without sacrificing working backend logic.

## Highlights

- Animated landing page with Framer Motion interactions
- Custom yellow Strivex logo and favicon
- Session cards with booking actions and live spot counts
- Pricing and CTA sections styled like a premium product page
- Admin area for leads, members, bookings, and new session creation
- SQLite-backed persistence for local development

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend

- Express
- SQLite with `better-sqlite3`
- JWT authentication
- `bcryptjs` for password hashing

## Product Features

### Member Experience

- Create an account or log in
- Browse live sessions
- Book classes directly from the landing page
- Cancel bookings from the member area
- View upcoming sessions and account info

### Admin Experience

- View high-level platform metrics
- Review captured leads
- Browse members and bookings
- Create new training sessions
- Test the full internal flow with seeded demo accounts

## Local Development

Install dependencies:

```bash
npm install
```

Run the frontend and backend together:

```bash
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- API server: `http://localhost:4000`

## Available Scripts

```bash
npm run dev
```

Starts the Vite client and Express server together.

```bash
npm run build
```

Builds the production frontend bundle.

```bash
npm run server
```

Runs the backend server directly.

```bash
npm run lint
```

Runs ESLint across the project.

## Demo Accounts

Use these seeded accounts after starting the app:

- Admin: `admin@strivex.fit` / `admin123`
- Member: `member@strivex.fit` / `member123`

## Project Structure

```text
Strivex/
├─ public/            # Brand assets and favicon
├─ server/            # Express API and SQLite setup
├─ src/
│  ├─ lib/            # API helpers
│  ├─ App.tsx         # Main UI and product flow
│  └─ types.ts        # Shared frontend types
├─ data/              # Local SQLite database output
└─ README.md
```

## Data and Environment

SQLite data is stored locally in:

```text
data/strivex.db
```

That database file is ignored by git so local test data stays out of commits.

Optional environment variables:

- `PORT`
- `JWT_SECRET`

You can copy values from [.env.example](./.env.example).

## Current Build State

This project currently includes:

- A branded animated homepage
- Working API-backed bookings
- Local persistence
- Admin tools
- Responsive layout updates
- Custom logo integration

## Notes

- The project is optimized for local development first.
- The backend is intentionally simple and easy to extend.
- If you want production hosting next, this codebase is a strong base for deploying the frontend and API separately or together behind a Node server.

---

<p align="center">
  Built for Strivex.
</p>
