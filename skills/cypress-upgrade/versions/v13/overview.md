# Cypress v13 — support matrix & links

Version-specific data for the `cypress-upgrade` skill's v13 path. The skill's procedure in [../../SKILL.md](../../SKILL.md) reads this file for every concrete version threshold; the detailed code/config changes live in [./breaking-changes.md](./breaking-changes.md).

## Prerequisite

- **Upgrade from:** Cypress `12.x`. If the project is on an older major, upgrade it to the latest `12.x` first, then run this path to reach v13.

## Support matrix

Flag anything outside the supported range during the precheck. The remaining v13 changes are configuration and behavior changes — see [./breaking-changes.md](./breaking-changes.md).

### Install blockers — do NOT install Cypress 13 until resolved

| Dependency | Supported | Where to check | Notes |
|--|--|--|--|
| Node.js | 16+ (18+ recommended) | `.nvmrc`, `.node-version`, `engines` in `package.json`, CI workflow files, Dockerfiles | Node 14 support removed. Node 16 is deprecated — it may still work with v13 but is not supported going forward; recommend updating to at least Node 18. |

### Non-blocking dependencies — flag, but proceed with the install

| Dependency | Supported | Where to check | Notes |
|--|--|--|--|
| TypeScript | 4.x+ | `typescript` in `package.json` / lockfile | Minimum supported TypeScript is 4.x. Only relevant if the project uses TypeScript. |

## Links

- **Migration guide:** https://on.cypress.io/migration-guide
- **Changelog (v13.0.0):** https://on.cypress.io/changelog#13-0-0
- **Announcement:** https://on.cypress.io/cypress-13-release
