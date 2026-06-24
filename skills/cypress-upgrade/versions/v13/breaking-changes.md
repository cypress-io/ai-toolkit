# Cypress v13.0 breaking changes

Detailed code/config changes for the `cypress-upgrade` skill's v13 path — each section describes one breaking change: what to detect and how to fix it. This file is the reference consulted by the "Make updates" phase in [../../SKILL.md](../../SKILL.md). The prerequisite and links live in [./overview.md](./overview.md). See also the full changelog at https://on.cypress.io/changelog#13-0-0 and the migration guide at https://on.cypress.io/migration-guide.

## Contents

- [Test Replay enabled by default when recording](#test-replay-enabled-by-default-when-recording)
- [`video` now defaults to false](#video-now-defaults-to-false)
- [`videoUploadOnPasses` removed](#videouploadonpasses-removed)
- [`videoCompression` now defaults to false](#videocompression-now-defaults-to-false)
- [`cy.readFile()` is now a query command](#cyreadfile-is-now-a-query-command)
- [`.readFile()` can no longer be overwritten with `Cypress.Commands.overwrite()`](#readfile-can-no-longer-be-overwritten-with-cypresscommandsoverwrite)

## Test Replay enabled by default when recording

Cypress Cloud Test Replay is enabled by default when passing `--record` during `cypress run`.

**Detect:** Recorded runs (`cypress run --record`) in a network-restricted environment (e.g. a strict VPN).
**Action:** Allowlist `capture.cypress.io` so Test Replay data can be captured. No code change otherwise.

## `video` now defaults to false

`video` is now `false` by default (previously `true`).

**Detect:** `video: false` in the Cypress config (now redundant); or a workflow that relies on video being recorded by default.
**Action:** Remove a redundant `video: false`. To keep recording video — useful locally, or in non-Chromium browsers where Test Replay is unavailable — set `video: true`:

```ts
import { defineConfig } from 'cypress'

export default defineConfig({
  video: true,
})
```

## `videoUploadOnPasses` removed

The `videoUploadOnPasses` configuration option has been removed. With `videoCompression` off by default, it no longer provides its previous time-saving value.

**Detect:** `videoUploadOnPasses` in the Cypress config.
**Action:** Remove it. To avoid uploading video for passing tests, delete the video for passing specs instead (see Cypress's guide on discarding captured video of passing tests).

## `videoCompression` now defaults to false

`videoCompression` is now `false` by default. This reduces run time (no compression step) at the cost of larger files; video quality is higher.

**Detect:** Reliance on compressed video output, or an expectation of the old default.
**Action:** No change to keep the new default. To reduce file size, re-enable compression (`true`, or an integer between 0 and 51):

```ts
import { defineConfig } from 'cypress'

export default defineConfig({
  // value can be true/false -or- an integer between 0 and 51
  videoCompression: true,
})
```

## `cy.readFile()` is now a query command

`cy.readFile()` is now a query. Existing tests continue to work unchanged — no edits are required. The behavior change: it re-reads the file from disk if any upcoming command in the same chain fails, so assertions no longer have to be attached directly.

```js
cy.readFile('users.json').its('users.123.fullName').should('eq', 'John Doe')
```

The command above now re-reads `users.json` until the file exists, has the requested property, and passes the assertion. (Previously it retried only until the file existed, without re-reading from disk for property/content changes.)

**Detect:** Informational — no detection needed for normal usage.
**Action:** None for normal usage. See the next section if you overwrite `readFile`.

## `.readFile()` can no longer be overwritten with `Cypress.Commands.overwrite()`

Now that `readFile` is a query, it must be overwritten with `Cypress.Commands.overwriteQuery()` instead of `Cypress.Commands.overwrite()`.

**Detect:** `Cypress.Commands.overwrite('readFile', ...)`.
**Action:** Switch to `Cypress.Commands.overwriteQuery('readFile', function () { ... })`. See the Cypress docs on overwriting existing queries.

```ts
Cypress.Commands.overwrite('readFile', () => { /* ... */ })            // before — no longer works
Cypress.Commands.overwriteQuery('readFile', function () { /* ... */ }) // after
```
