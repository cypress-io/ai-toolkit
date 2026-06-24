# Cypress v14 — support matrix & links

Version-specific data for the `cypress-upgrade` skill's v14 path. The skill's procedure in [../../SKILL.md](../../SKILL.md) reads this file for every concrete version threshold; the detailed code/config changes live in [./breaking-changes.md](./breaking-changes.md).

## Prerequisite

- **Upgrade from:** Cypress `13.x`. If the project is on an older major, upgrade it to the latest `13.x` first, then run this path to reach v14.

## Support matrix

Flag anything outside the supported range during the precheck.

### Install blockers — do NOT install Cypress 14 until resolved

The Cypress 14 binary will fail to install or run on an unsupported environment.

| Dependency | Supported | Where to check | Notes |
|--|--|--|--|
| Node.js | 18+ | `.nvmrc`, `.node-version`, `engines` in `package.json`, CI workflow files, Dockerfiles | 16 and 21 are no longer supported. Cannot be safely automated — the user must update Node. |
| glibc (Linux) | ≥ 2.28 | Run `ldd --version` | Prebuilt binaries require glibc 2.28+. E.g. Ubuntu 14–18, RHEL 7, CentOS 7, and Amazon Linux 2 must update their distribution. |
| macOS | ≥ 11 (Big Sur) | `sw_vers -productVersion` | Cypress 14 requires macOS 11+. The user must update if lower. |

### Component-testing dependencies — flag, but proceed with the install

Only relevant if the project uses component testing. Cypress 14 dropped several frameworks and bundlers; workarounds for declining an upgrade are in [./breaking-changes.md](./breaking-changes.md).

| Dependency | Supported | Where to check | Notes |
|--|--|--|--|
| Angular (`@angular/core`, `@angular/cli`) | 17.2.0+ | `package.json` / lockfile | 13–16 dropped. `@cypress/angular-signals` merged into `cypress/angular`. |
| React | 18.0.0+ | `package.json` / lockfile | 16 and 17 dropped. |
| Next.js | 15.0.0+ | `package.json` / lockfile | 10–13 dropped. |
| Nuxt | 3+ | `package.json` / lockfile | Nuxt 2 dropped. |
| Svelte | 5+ | `package.json` / lockfile | 3 and 4 dropped. |
| Vue | 3+ | `package.json` / lockfile | Vue 2 dropped. |
| webpack-dev-server | 4+ (5 ships by default) | `package.json` / lockfile | v3 dropped. Keep v4 only if still on webpack 4. |
| Component framework | a real bundler (`webpack` or `vite`) | `framework` in the component `devServer` config | `create-react-app` and `@vue/cli-service` are no longer supported. |

## Links

- **Migration guide:** https://on.cypress.io/migration-guide
- **Changelog (v14.0.0):** https://on.cypress.io/changelog#14-0-0
