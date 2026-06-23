# Upgrading to Cypress v15

Version-specific path for the `cypress-upgrade` skill. Follow this flow to upgrade a project to Cypress v15. The **resolved target version** is supplied by the router: the exact version the user named (e.g. `15.16.0`), or the latest `15.x` release (`cypress@15`) if they named only the major. See [./breaking-changes.md](./breaking-changes.md) for the full detail of each change, the official [migration guide](https://on.cypress.io/migration-guide), and the [v15.0 changelog](https://on.cypress.io/changelog#15-0-0).

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
   - **zone.js** below `0.14.0` — `@cypress/angular` now requires `zone.js` `0.14.0+`. Flag for upgrade in projects using Angular component testing.
4. **Locate the Cypress config** — Find `cypress.config.js` or `cypress.config.ts`. If it cannot be found, prompt the user for its location before continuing.

### 2. Upgrade the Cypress package

1. **Check for install blockers first.** The Cypress 15 binary will fail to install on an unsupported environment, so do **not** run the install if the precheck found either:
   - **Node.js** not on `20`, `22`, or `24+`, or
   - On Linux, **glibc `< 2.31`**.

   If a blocker exists, stop here, surface it (see phase 5), and have the user resolve it before upgrading — unless the user explicitly asks to proceed anyway, in which case warn that the install and verification will likely fail. Webpack `4` and Angular `17` are component-testing concerns, **not** binary-install blockers; proceed with the install but keep them flagged.

2. **Bump the `cypress` devDependency to the resolved target version** using the detected package manager. `<target>` is the exact version the router resolved (e.g. `15.16.0`) or the major (`15`) for the latest `15.x`:
   - **npm:** `npm install --save-dev cypress@<target>`
   - **yarn:** `yarn add --dev cypress@<target>`
   - **pnpm:** `pnpm add --save-dev cypress@<target>`

### 3. Make updates

1. **Detect component testing** — Grep the Cypress config for a `component` block inside `defineConfig` to know whether component-testing changes (Webpack dev server, Angular) apply.
2. **Find spec files** — Use the `specPattern` from the Cypress config (and support files) to locate the test files to scan.
3. **Apply the code changes** from [./breaking-changes.md](./breaking-changes.md). At minimum, grep for and update:
   - `Cypress.SelectorPlayground.defaults` → `Cypress.ElementSelector.defaults` (and drop the removed `onElement` option).
   - `cy.exec(...)` results reading `.its('code')` → `.its('exitCode')`.
   - `cy.stub(object, name, fn)` (3-argument signature) → `cy.stub(object, name).callsFake(fn)`.
   - Angular `import { mount } from 'cypress/angular'` → `'@cypress/angular'` only when applying the Angular-17 workaround.
   - For Angular component testing, ensure `zone.js` is `0.14.0+` (now required by `@cypress/angular`); update it if lower.
   - Webpack dev server / preprocessor and batteries-included built-in changes, only where they apply to this project.

Make the safe, mechanical edits directly. For anything ambiguous or environment-dependent (Node/glibc/Webpack/Angular upgrades), do not guess — surface it in the report.

### 4. Verify the upgrade

1. **Confirm the binary installed** — run `npx cypress verify`.
2. **Confirm the version** — run `npx cypress version` (or `npx cypress --version`) and check the installed Cypress version matches the resolved target.
3. **Run the test suite** if the project has a test script (e.g. the `cypress run` command in `package.json` scripts) to catch breaking-change regressions, or recommend the user run it if it is long-running or environment-dependent.
4. If verification fails, **report the actual error and the likely cause** (commonly an unsupported Node/glibc environment surfaced in the precheck, or a remaining breaking-change usage) rather than guessing or retrying blindly.

### 5. Share findings back with the user

1. **Print every version that is outside Cypress v15 support** (Cypress, Node.js, glibc, Webpack, Angular, zone.js) with the current value and the required value, so the user knows their next steps.
2. **Summarize what you did** — the resolved target version installed, the code changes you made, and anything you could not safely automate.
3. **Report verification results** — whether `cypress verify`, the version check, and any test run passed or failed.
4. **Tell the user to double-check the work** against the official resources:
   - Migration guide: https://on.cypress.io/migration-guide
   - Full v15.0 changelog: https://on.cypress.io/changelog#15-0-0
