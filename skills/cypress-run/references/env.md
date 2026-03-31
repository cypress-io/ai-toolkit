# Cypress Environment Setup

## Running Cypress

If Cypress needs to be executed, including installation, verifying version, or running tests, you MUST follow these instructions.

### Determine package manager

Review the project configuration to determine the package manager being used (`npm`, `yarn`, etc). Respect this configuration when attempting to run Cypress.

### Ensure Cypress binary is installed

- The Cypress npm package does not include the platform-specific binary; it is downloaded separately (e.g. to `~/.cache/Cypress` or `CYPRESS_CACHE_FOLDER`). In clean or CI-like environments the binary may be missing even when `node_modules` is present.
- When running in an environment that may use an isolated cache (e.g. Cursor), set `CYPRESS_CACHE_FOLDER` to the user's cache path so the existing binary is found.
  - **macOS:** `CYPRESS_CACHE_FOLDER=$HOME/Library/Caches/Cypress`
  - **Linux:** `CYPRESS_CACHE_FOLDER=$HOME/.cache/Cypress`
  - **Windows:** `CYPRESS_CACHE_FOLDER=%USERPROFILE%\AppData\Local\Cypress\Cache` (or `$env:LOCALAPPDATA\Cypress\Cache` in PowerShell)
- **Before running Cypress** ensure the binary is present: run `npx cypress verify` (or `yarn cypress verify`). If it reports the binary is missing, run `npx cypress install` (or `yarn cypress install`) with the same permissions as the run step; `cypress install` requires network access to download the binary, so use `required_permissions: ["all"]` (or include `full_network` if the tool supports it).

### Running Cypress

- When invoking the terminal to run Cypress (e.g. `npm run …`, `npx cypress run`, or any script that launches Cypress), **request full permissions** so the Cypress binary is available. In this environment the command is sandboxed by default; the Cypress binary (e.g. in `~/.cache/Cypress` or project `node_modules`) is not available under the sandbox, so the run fails before executing the spec unless the sandbox is disabled.
- Link the run to the **user's** cache by setting `CYPRESS_CACHE_FOLDER` to the user's home-based cache path **before** running Cypress. Use an absolute path (Cypress does not expand `~`).
- Example: `CYPRESS_CACHE_FOLDER=$HOME/Library/Caches/Cypress npx cypress run --component --spec "src/components/Foo.cy.tsx"` (adjust path and OS as needed).
- Request full permissions (`required_permissions: ["all"]`) so the process can read the user's home directory and cache. This allows the same binary the user uses in their local terminal to be found when the agent runs Cypress.
