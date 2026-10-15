# BOO-264: storage and Library tests

Verified locally on 2026-10-15 with Node 24.22.0 and npm 11.19.1.

`npm ci --ignore-scripts` installs the committed lockfile without running
dependency lifecycle scripts. `npm run validate` runs Expo ESLint, TypeScript,
18 existing Vitest logic tests and 12 new Jest native integration tests.
`npx jest --runInBand` also runs the native tests directly.

The new tests exercise the real storage adapter and the real Library screen
with its provider. AsyncStorage uses its official in-memory native mock; the
router navigation boundary and font icons are replaced. No BookProvider or
storage adapter methods are stubbed in the screen tests.

Coverage includes add/update/delete persistence, completion timestamps,
unreadable-data protection for all three mutations, failed storage writes,
initial loading, empty state, counts/progress, combined status and title/author
filtering, and add/detail navigation.

Mutation checks confirmed the assertions detect regressions: temporarily
removing the add operation's save produced five failing storage tests;
bypassing Library filtering produced one failing screen test. Both production
files were restored before the final full verification.

`npm test` runs both frameworks; `vitest.config.ts` restricts Vitest to the
pure logic files so it cannot collect the Jest native tests. Existing CI
already invokes `npm test` without suppressing failures.

These are local automated checks, not a device or store-release claim. The
Expo SDK remains 52. `npm audit --omit=dev` on this date still reports 37 high
and 2 critical findings (22 moderate); dependency remediation is outside this
test-coverage change. No hosted EAS build or remote CI run was triggered.
