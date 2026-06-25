# v14 upgrade fixture (Cypress 13 → 14)

A synthetic Cypress **13** project (React 17 + create-react-app component testing, plus E2E) staged to upgrade to **v14** with `yarn`. Run the skill toward v14 and confirm it catches the items below.

## Expected detections

### Precheck
- **Cypress 13.x** in `package.json` → on the v14 prerequisite major; proceed.
- **Node 16** in `.nvmrc` → install blocker (16 and 21 dropped; minimum 18).
- **React 17** in `package.json` → component-testing minimum is now 18.0.0.
- **webpack-dev-server 3** in `package.json` → v3 dropped (v5 ships by default).
- **`framework: 'create-react-app'`** in the component config → no longer supported; switch to a real bundler.

### Config (`cypress.config.ts`)
- `experimentalSkipDomainInjection` → removed; replaced by `injectDocumentDomain`.
- `experimentalFetchPolyfill` → removed; use `cy.intercept()`.
- `experimentalJustInTimeCompile` → removed (JIT is the default `justInTimeCompile`).
- `before:browser:launch` handler treating the second arg as an array → signature changed.

### Code
- `cypress/support/component.ts` — `import { mount } from 'cypress/react18'` → `cypress/react`.
- `cypress/e2e/cross-origin.cy.ts`:
  - two `cy.visit()` to different origins then interacting without `cy.origin()` → now requires `cy.origin()`.
  - `cy.intercept({ resourceType: ... })` → `resourceType` deprecated.
  - `Cypress.backend('firefox:force:gc')` → removed.
  - `cy.window().then((win) => win.fetch(...))` before navigation → fetch from `about:blank` unsupported.
- `package.json` scripts `open-ct` / `run-ct` → use `cypress open --component` / `cypress run --component`.

### Not present in this fixture (the skill also covers these)
- Angular `<17.2.0` (`cypress/angular-signals`), Vue 2 (`cypress/vue2`), Svelte 3/4, Next/Nuxt minimums, and `@vue/cli-service`. This fixture is React/CRA-focused; see the v14 `breaking-changes.md` for the rest.
