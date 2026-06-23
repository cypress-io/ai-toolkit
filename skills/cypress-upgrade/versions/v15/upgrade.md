# Migrating to Cypress v15

Version-specific path for the `cypress-upgrade` skill. Follow this flow to migrate a project to Cypress v15.0. See [./breaking-changes.md](./breaking-changes.md) for the full detail of each change, the official [migration guide](https://on.cypress.io/migration-guide), and the [v15.0 changelog](https://on.cypress.io/changelog#15-0-0).

Treat your output as a draft for the user to review. Never invent file contents — read and search the files you reference.

## Mandatory flow (do not skip)

Complete these phases in order. Read [./breaking-changes.md](./breaking-changes.md) for the detail of each change before applying it.

### 1. Precheck (ALWAYS run first to determine next steps)

Assume you are running within a project that already has Cypress installed.

1. **Package manager** — Identify the package manager in use (npm, yarn, or pnpm) from the lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`). Use it to read installed versions and to phrase any install/upgrade commands.
2. **Cypress version** — Check the installed `cypress` version (typically in `devDependencies`). **If `cypress` is not on a `14.x` version, stop and recommend the user upgrade to the latest `14.x` first**, then re-run this migration to reach v15.
3. **Flag dependencies needing attention** — Inspect `package.json` and the lockfile, plus config and CI files, and flag (for the report in phase 3) any of:
   - **Node.js** not on `20`, `22`, or `24+`. Check `.nvmrc`, `.node-version`, CI workflow files, `engines` in `package.json`, and Dockerfiles. Node 18 and 23 are no longer supported.
   - **glibc** — If running on Linux, run `ldd --version` to read the glibc version. Prebuilt Linux binaries are no longer compatible with distributions based on glibc `< 2.31`; flag this since the user must update their distribution.
   - **Webpack 4** — Cypress v15 supports only Webpack `5+`. Flag for upgrade (workaround in the reference if the user declines).
   - **Angular 17** (`@angular/cli` / `@angular/core`) — Component testing requires Angular `18.0.0+`. Flag for upgrade (workaround in the reference if the user declines).
4. **Locate the Cypress config** — Find `cypress.config.js` or `cypress.config.ts`. If it cannot be found, prompt the user for its location before continuing.

### 2. Make updates

1. **Detect component testing** — Grep the Cypress config for a `component` block inside `defineConfig` to know whether component-testing changes (Webpack dev server, Angular) apply.
2. **Find spec files** — Use the `specPattern` from the Cypress config (and support files) to locate the test files to scan.
3. **Apply the code changes** from [./breaking-changes.md](./breaking-changes.md). At minimum, grep for and update:
   - `Cypress.SelectorPlayground.defaults` → `Cypress.ElementSelector.defaults` (and drop the removed `onElement` option).
   - `cy.exec(...)` results reading `.its('code')` → `.its('exitCode')`.
   - Angular `import { mount } from 'cypress/angular'` → `'@cypress/angular'` only when applying the Angular-17 workaround.
   - Webpack dev server / preprocessor and batteries-included built-in changes, only where they apply to this project.

Make the safe, mechanical edits directly. For anything ambiguous or environment-dependent (Node/glibc/Webpack/Angular upgrades), do not guess — surface it in the report.

### 3. Share findings back with the user

1. **Print every version that is outside Cypress v15 support** (Cypress, Node.js, glibc, Webpack, Angular) with the current value and the required value, so the user knows their next steps.
2. **List the code changes you made**, and any you could not safely automate.
3. **Tell the user to verify the work** against the official resources:
   - Migration guide: https://on.cypress.io/migration-guide
   - Full v15.0 changelog: https://on.cypress.io/changelog#15-0-0
