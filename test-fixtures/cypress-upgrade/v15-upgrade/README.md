# v15 upgrade fixture (Cypress 14 → 15)

A synthetic Cypress **14** project (Vite + Angular component testing with a **CommonJS** config, plus E2E) staged to upgrade to **v15** with `pnpm`. Run the skill toward v15 and confirm it catches the items below.

## Expected detections

### Precheck
- **Cypress 14.x** in `package.json` → on the v15 prerequisite major; proceed.
- **Node 18** in `.nvmrc` → install blocker (v15 needs 20, 22, or 24+).
- **Vite 4** in `package.json` → minimum Vite is now 5.
- **Angular 17** (`@angular/core`, `@angular/cli`) → component-testing minimum is now 18.0.0.
- **zone.js 0.13** in `package.json` → `@cypress/angular` requires 0.14.0+.
- **webpack 4** in `package.json` → Webpack 4 is no longer supported (present to exercise that detection even though this fixture's bundler is Vite).

### Config (`cypress.config.js`)
- **CommonJS config** (`require` / `module.exports`) using `@cypress/vite-dev-server` → that package is now ESM-only; the config must move to an ESM context.

### Code
- `cypress/support/e2e.js` — `Cypress.SelectorPlayground.defaults(...)` → `Cypress.ElementSelector.defaults(...)`.
- `cypress/e2e/commands.cy.js`:
  - `cy.exec(...).its('code')` → `.its('exitCode')`.
  - `cy.stub(obj, 'name', fn)` (3-arg) → `cy.stub(obj, 'name').callsFake(fn)`.
- `cypress/e2e/uses-builtin.cy.js` — `import qs from 'querystring'` → no longer shimmed by the batteries-included preprocessor; configure `resolve.fallback` if needed.

### Not mockable in files (verify the agent still reports them)
- glibc `< 2.31` (Linux) and macOS — environment checks that depend on the host, not the fixture.
