# Upgrade Plan

## Current state

- Before this pass: **4/10** — working Expo Router reading tracker, but CI
  masked every failure with `|| true`, `lib/` lived under `app/` (so Expo
  Router treated storage helpers as routes), no tests, storage `JSON.parse`
  could crash the app on corrupt data, a want-to-read book could never be
  started, and the stats screen duplicated (and mis-counted) aggregates.
- After this pass: **7/10** — tested pure logic, honest CI, detail screen can
  change status and rating, stats come from one tested function.

## Backlog

### P0
- None open.

### P1
- Import a JSON backup (paste or file) validated with `parseStoredBooks`.
- Component tests (jest-expo + @testing-library/react-native) for add/detail.
- Edit title/author/pages after creation; custom page entry instead of only
  ±10/+50 buttons.

### P2
- Upgrade Expo SDK 52 -> 53+ (clears remaining `npm audit` findings in Expo
  build tooling) and move to ESLint 9 flat config.
- Real light theme (`userInterfaceStyle: automatic` but colors are dark-only).

## Done in this pass

- Moved `app/lib/*` to top-level `lib/` so they are no longer Expo Router routes.
- `lib/books.ts`: pure logic (progress, page delta with auto-complete/resume,
  strict page parsing, form validation, stats incl. real top-author counts,
  defensive `parseStoredBooks`) with Vitest tests (`npm test`).
- Library tab: status filter chips + title/author search (`filterBooks`), no more `NaN%` progress for books without a page count.
- Add screen validates pages/rating via the lib; detail screen gains status
  switcher and tappable star rating (with accessibility roles/labels).
- `useBooks()` throws a clear error outside the provider; load errors no longer
  leave the app stuck on loading; unique ids; `dateCompleted` set on add.
- CI runs `npm ci`, lint, typecheck, tests and an Android bundle export with no
  failure masking; EAS preview build is owner-triggered; `eas.json` committed.

## Done in this pass (pass 2)

Score: 7/10 (was 6/10) — notes are editable and the library can be exported; still SDK 52.

- Notes editor on `/book/[id]` (saves on blur or via "Save notes", capped at 2,000 chars with `normalizeNotes`); legacy stored books without `notes` are back-filled by `parseStoredBooks`.
- Export: Stats tab shares a versioned JSON backup (`exportLibrary`) through the core `Share` API. Import is still TODO (P1).
- Accessibility: labelled notes field, save/export/remove buttons with roles and disabled state.
- Advisories: lockfile-only patch updates (`npm update`) for brace-expansion, fast-uri, js-yaml, undici and @xmldom/xmldom; `overrides.postcss ^8.5.28`. 29 -> 24 findings (10 -> 5 high). Remaining (tar critical, image-size, uuid, xmldom 0.7 via plist, vitest dev-only) need the SDK 53+ / vitest 4 majors.
- Verified: typecheck, lint, 15 vitest tests, Android `expo export` bundle.

## Done in this pass (pass 3)

Score: 7.5/10 (was 7/10) — edge-case hunt in `lib/books.ts` / `lib/storage.ts`.

- Bug (data loss): add/update/delete re-read storage with the lenient parser, which returns `[]` for corrupt JSON and silently drops unreadable entries — the next write then overwrote the whole saved library. Writes now use `parseStoredBooksForWrite`, which throws instead; `BookContext` shows an alert and leaves storage untouched.
- Bug: the cover used `title.charAt(0)`, which renders half a surrogate pair for a title starting with an emoji; `coverInitial` uses the first code point.
- Bug: `normalizeNotes` could cut an emoji in half at the 2000-unit cap.
- Verified: typecheck, lint, 18 vitest tests, Android `expo export`.

## Done in this pass (pass 4, 2026-10-23)

- CI moved to the shared `platform-ci-workflows` v1.1.1 (`ci-node` + `security`), with
  `require-tests` and a 58% line-coverage gate; the old `build.yml` and its EAS job are gone.
- One test runner: the Vitest suites (`lib/*.test.ts`) now run in Jest, so coverage counts
  every test; dropping Vitest also removed the vitest/vite/tinypool advisories.
- Lockfile-only `npm update` of compression, shell-quote and source-map-js (`npm audit fix` was
  not used: it pulled a newer-SDK `expo-linking` and broke the Android bundle). Remaining advisories (tar 6, @xmldom/xmldom 0.7, uuid,
  image-size, braces, node-forge in Expo SDK 52 CLI/build tooling, plus decode-uri-component via
  react-navigation) are each listed with a
  reason and expiry in `osv-scanner.toml` / `.trivyignore`. The SDK 53+ upgrade (P2) clears them.
- Added `PRODUCT.md`. Found: the profile screen lists "Set reading goals", which does not exist (P1).
