# Cypress v15 — support matrix & links

Version-specific data for the `cypress-upgrade` skill's v15 path. The shared procedure in [../../shared/upgrade-flow.md](../../shared/upgrade-flow.md) reads this file for every concrete version threshold; the detailed code/config changes live in [./breaking-changes.md](./breaking-changes.md).

## Prerequisite

- **Upgrade from:** Cypress `14.x`. If the project is on an older major, upgrade it to the latest `14.x` first, then run this path to reach v15.

## Support matrix

Flag anything outside the supported range during the precheck.

### Install blockers — do NOT install Cypress 15 until resolved

The Cypress 15 binary will fail to install on an unsupported environment.

| Dependency | Supported | Where to check | Notes |
|--|--|--|--|
| Node.js | 20, 22, 24+ | `.nvmrc`, `.node-version`, `engines` in `package.json`, CI workflow files, Dockerfiles | 18 and 23 are no longer supported. Cannot be safely automated — the user must update Node. |
| glibc (Linux) | ≥ 2.31 | Run `ldd --version` | Prebuilt binaries require glibc 2.31+; the user must update their distribution. |

### Component-testing dependencies — flag, but proceed with the install

These affect whether **component testing** runs, not whether the Cypress binary installs. Only relevant if the project uses component testing. Workarounds for declining an upgrade are in [./breaking-changes.md](./breaking-changes.md).

| Dependency | Supported | Where to check | Notes |
|--|--|--|--|
| Webpack | 5+ | `package.json` / lockfile | Webpack 4 dropped. |
| Vite | 5+ | `package.json` / lockfile | Vite 4 dropped; `@cypress/vite-dev-server` is now ESM-only (CommonJS Cypress config must move to ESM). |
| Angular | 18.0.0+ | `@angular/core` / `@angular/cli` in `package.json` / lockfile | Angular 17 dropped. |
| zone.js | 0.14.0+ | `package.json` / lockfile | Required by `@cypress/angular`. |

## Links

- **Migration guide:** https://on.cypress.io/migration-guide
- **Changelog (v15.0.0):** https://on.cypress.io/changelog#15-0-0
- **Announcement:** https://on.cypress.io/cypress-15-upgrade
