# Cypress upgrade flow (shared)

This is the **version-agnostic** procedure for upgrading a Cypress project to a newer major version. Every version path under [`../versions/`](../versions/) uses it. Read it together with the target version's two data files:

- `../versions/<target-major>/overview.md` — the support matrix (prerequisite major; supported Node, glibc, bundler, and framework versions), and the migration/changelog/announcement links. This file intentionally hardcodes **no** version thresholds — take every concrete value from `overview.md`.
- `../versions/<target-major>/breaking-changes.md` — the detailed code/config changes to detect and apply.

Throughout, `<target>` is the resolved target version supplied by the router: the exact version the user named (e.g. `15.16.0`), or the latest release of the major (e.g. `cypress@15`).

Treat your output as a draft for the user to review. Never invent file contents — read and search the files you reference.

## Mandatory flow (do not skip)

Complete these phases in order.

### 1. Precheck (ALWAYS run first to determine next steps)

Assume you are running within a project that already has Cypress installed.

1. **Package manager** — Identify the package manager in use (npm, yarn, or pnpm) from the lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`). Use it to read installed versions and to phrase any install/upgrade commands.
2. **Cypress version** — Check the installed `cypress` version (typically in `devDependencies`). If it is **not on the prerequisite major** named in `overview.md` (the major immediately below the target), stop and recommend the user upgrade to the latest of that major first, then re-run this path.
3. **Flag dependencies needing attention** — Using the support matrix in `overview.md`, inspect the project and flag (for the report in phase 5) anything outside the supported range. `overview.md` classifies each dependency as an **install blocker** (halts the upgrade until resolved) or a **component-testing dependency** (flag but proceed). Where to look:
   - **Node.js** — `.nvmrc`, `.node-version`, `engines` in `package.json`, CI workflow files, and Dockerfiles.
   - **glibc** (Linux only) — run `ldd --version` and compare against the glibc threshold in `overview.md`.
   - **Bundlers and frameworks** (e.g. Webpack, Vite, Angular, zone.js) — `package.json` and the lockfile. Only relevant when the project uses component testing.
4. **Locate the Cypress config** — Find `cypress.config.js` or `cypress.config.ts` (or `.mjs`/`.cjs`). If it cannot be found, prompt the user for its location before continuing.

### 2. Upgrade the Cypress package

1. **Check for install blockers first.** Do **not** run the install if the precheck found any dependency that `overview.md` marks as an **install blocker** (commonly an unsupported Node.js version, or glibc below the threshold on Linux) — the binary install will fail. Stop, surface the blocker (see phase 5), and have the user resolve it before upgrading, unless the user explicitly asks to proceed anyway, in which case warn that the install and verification will likely fail. Component-testing dependencies are **not** install blockers; proceed with the install but keep them flagged.
2. **Bump the `cypress` devDependency to the resolved target version** using the detected package manager. `<target>` is the exact version the router resolved (e.g. `15.16.0`) or the major (e.g. `15`) for the latest in that line:
   - **npm:** `npm install --save-dev cypress@<target>`
   - **yarn:** `yarn add --dev cypress@<target>`
   - **pnpm:** `pnpm add --save-dev cypress@<target>`

### 3. Make updates

1. **Detect component testing** — Grep the Cypress config for a `component` block inside `defineConfig` to know whether component-testing changes apply.
2. **Find spec files** — Use the `specPattern` from the Cypress config (and support files) to locate the test files to scan.
3. **Apply the code changes** from `breaking-changes.md` — grep for each documented pattern and apply the change. Make the safe, mechanical edits directly. For anything ambiguous or environment-dependent (Node/glibc/bundler/framework upgrades), do not guess — surface it in the report.

### 4. Verify the upgrade

1. **Confirm the binary installed** — run `npx cypress verify`.
2. **Confirm the version** — run `npx cypress version` (or `npx cypress --version`) and check the installed Cypress version matches the resolved target.
3. **Run the test suite** if the project has a test script (e.g. the `cypress run` command in `package.json` scripts) to catch breaking-change regressions, or recommend the user run it if it is long-running or environment-dependent.
4. If verification fails, **report the actual error and the likely cause** (commonly an unsupported environment surfaced in the precheck, or a remaining breaking-change usage) rather than guessing or retrying blindly.

### 5. Share findings back with the user

1. **Print every version that is outside support** (per `overview.md`'s matrix) with the current value and the required value, so the user knows their next steps.
2. **Summarize what you did** — the resolved target version installed, the code changes you made, and anything you could not safely automate.
3. **Report verification results** — whether `cypress verify`, the version check, and any test run passed or failed.
4. **Tell the user to double-check the work** against the official resources linked in `overview.md` (migration guide and changelog).
5. **Link the announcement** — share the announcement URL from `overview.md` for the full story on what's new.
