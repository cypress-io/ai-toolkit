I'm preparing for a Cypress v16 upgrade. `Cypress.env()` was deprecated in v15.10 and must be fully removed before v16.

**Migration rules:**

- **Sensitive values** (API keys, tokens, passwords, secrets, credentials) → `cy.env(['key']).then(({ key }) => { ... })`. Note: `cy.env()` is read-only and asynchronous.
- **Public/non-sensitive values** (feature flags, API versions, public URLs, plugin config) → `Cypress.expose('key')` synchronously in tests, and move the key from `env:` to a new top-level `expose:` block in `cypress.config` (parallel to `env:`, not nested under `e2e:` or `component:`).
- **Runtime writes — sensitive** (`Cypress.env(key, value)` for secrets) → replace with a `cy.task()`-based store/retrieve pattern where the value is stored in a plain JS object in the Node process (inside `setupNodeEvents`) and never touches the browser.
- **Runtime writes — non-sensitive** (`Cypress.env(key, value)` for public config) → replace with `Cypress.expose(key, value)`. Add a comment that these changes only persist for the remainder of the current spec file.

**Step 1:** Search all files under `cypress/` for `Cypress.env(`. List every occurrence with file path, line number, and the key name being read or written.

**Step 2:** For each occurrence, classify it as sensitive or non-sensitive and propose the replacement code. Show your reasoning for any ambiguous key names.

**Pause here.** Show me the full classification table and proposed replacements and wait for my approval before making any file changes.

**Step 3 (after approval):** Make the changes. Update `cypress.config` to move any non-sensitive keys from the `env:` block into a new top-level `expose:` block. Do not nest `expose:` inside `e2e:` or `component:`.

**Step 4:** Check for `--env` CLI flags in `package.json` scripts, Makefile targets, CI config, or `.npmrc`. Any `--env KEY=val` flags that supply non-sensitive values should become `--expose KEY=val` (or `-x KEY=val`). List any you find and propose the updated command.

**Step 5:** Check whether either of these plugins appear in `package.json`. They use `Cypress.env()` internally and must be upgraded before `allowCypressEnv: false` can be set without errors. Note: these major version bumps exist solely to drop `Cypress.env()` support — there are no other breaking changes, so they are safe to upgrade as part of this migration.

- `@cypress/code-coverage` — upgrade to 4.0.0+. The only breaking change is moving the `codeCoverage` config key from `env:` to `expose:` in `cypress.config`. Also requires Node 20+.
- `@cypress/grep` — upgrade to 6.0.0+. The only breaking change is moving grep-related keys (e.g. `grepTags`, `grep`) from `env:` to `expose:` in `cypress.config`, and updating any `--env grepTags="..."` CLI flags to `--expose grepTags="..."`.

**Step 6:** Once all `Cypress.env()` calls are gone, add `allowCypressEnv: false` to the top-level `cypress.config` object (not inside `e2e:` or `component:`).

Show me the before/after diff for every changed file.