# BookEverything (content-bookreviews-mobile) — Product

Status: active personal app, Expo SDK 52 / Expo Router, TypeScript strict.
This repo is its own app, not one of the Expo template copies.

## What it is

A personal reading tracker for one person on one device: add books, track
page progress, rate finished books, keep notes and see reading stats.

## Who it is for

The owner (and anyone running it from source) who wants a private reading
log without an account or a server.

## Screens that exist

| Route | What it does |
|---|---|
| `/(tabs)` Library | List of books with status filter chips (All / Want / Reading / Done counts) and title/author search; tap a book to open it |
| `/(tabs)/stats` | Totals (books, completed, pages read, total pages, average rating, active), per-status bars, top authors, "Export library (JSON)" through the system share sheet |
| `/(tabs)/profile` | Static about screen |
| `/add` | Add a book: title, author, pages, status, rating (validated) |
| `/book/[id]` | Status switcher, progress bar with -10 / +10 / +50 page buttons (auto-complete at the last page), star rating, notes (max 2,000 characters), delete |

## Data

- Stored only on the device in `AsyncStorage` under `@bookeverything:books`.
- No backend, no account, no analytics, no network calls.
- Corrupt stored data never gets overwritten: writes refuse to run and the
  app shows an alert instead.
- Export only (JSON via share sheet). There is no import yet.

## What does not exist (do not claim it)

- No store listing and no published build. EAS profiles exist in `eas.json`,
  but no build has been run from CI; that needs the owner's Expo account.
- No reading goals: the profile screen lists "Set reading goals" as a
  feature, but no such screen exists (backlog item: fix that copy or build it).
- No sync, backup restore, sharing between users or reviews published anywhere.
- No light theme (colors are dark-only).

## Quality

- Tests: Jest with the `jest-expo` preset. `lib/books.test.ts` and
  `lib/notes.test.ts` cover the pure logic; `__tests__/storage.test.ts`
  covers storage writes and refusal to overwrite unreadable data;
  `__tests__/library.test.tsx` renders the real Library screen with its
  provider.
- CI: `.github/workflows/ci.yml` (shared `platform-ci-workflows` v1.1.1):
  `npm ci`, lint, typecheck, Jest with a line-coverage gate, Android JS
  bundle export, and security scans.
- Known risk: dependency advisories inside Expo SDK 52 build tooling need
  the SDK 53+ upgrade; see `osv-scanner.toml`, `.trivyignore` and
  `docs/UPGRADE-PLAN.md`.
