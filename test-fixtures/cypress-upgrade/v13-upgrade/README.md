# v13 upgrade fixture (Cypress 12 → 13)

A synthetic Cypress **12** project staged to upgrade to **v13** with `npm`. Run the skill toward v13 and confirm it catches the items below.

## Expected detections

### Precheck
- **Cypress 12.x** in `package.json` → on the v13 prerequisite major; proceed.
- **Node 14** in `.nvmrc` → install blocker (Node 14 removed; recommend 18+).
- **TypeScript 3.9** in `package.json` → non-blocking; minimum supported is 4.x.

### Config (`cypress.config.ts`)
- `video: false` → now the default; redundant, can be removed.
- `videoCompression: 32` → now defaults to `false`.
- `videoUploadOnPasses` → option removed.
- `nodeVersion` → option removed.
- `after:run` / `after:spec` handlers → Module API result shape changed; review property usage.

### Code
- `cypress/support/commands.ts` — `Cypress.Commands.overwrite('readFile', ...)` → must become `Cypress.Commands.overwriteQuery('readFile', ...)`.
- `cypress/e2e/read-file.cy.ts` — `cy.readFile().its().should()` is fine (readFile is now a query); included to confirm **no** false-positive edit.

### Not mockable in files (verify the agent still reports them)
- Test Replay enabled by default with `--record`; allowlist `capture.cypress.io`.
- Runner UI hidden during Test Replay runs (`--runner-ui` to restore).
