# Cypress v14.0 breaking changes

Detailed code/config changes for the `cypress-upgrade` skill's v14 path — each section describes one breaking change: what to detect and how to fix it. This file is the reference consulted by the "Make updates" phase in [../../SKILL.md](../../SKILL.md). The version **support matrix** (Node, glibc, macOS, framework/bundler thresholds) and links live in [./overview.md](./overview.md). See also the full changelog at https://on.cypress.io/changelog#14-0-0 and the migration guide at https://on.cypress.io/migration-guide.

## Contents

- [`cy.origin()` now required for cross-origin navigation](#cyorigin-now-required-for-cross-origin-navigation)
- [`experimentalSkipDomainInjection` replaced by `injectDocumentDomain`](#experimentalskipdomaininjection-replaced-by-injectdocumentdomain)
- [`experimentalFetchPolyfill` removed](#experimentalfetchpolyfill-removed)
- [`before:browser:launch` callback signature changed](#beforebrowserlaunch-callback-signature-changed)
- [`open-ct` and `run-ct` CLI commands removed](#open-ct-and-run-ct-cli-commands-removed)
- [Undocumented `Cypress.backend` methods removed](#undocumented-cypressbackend-methods-removed)
- [Fetch from `about:blank` in Electron no longer supported](#fetch-from-aboutblank-in-electron-no-longer-supported)
- [`cy.intercept` `resourceType` deprecated](#cyintercept-resourcetype-deprecated)
- [Just-in-time (JIT) compile changes](#just-in-time-jit-compile-changes)
- [`webpack-dev-server` v3 no longer supported](#webpack-dev-server-v3-no-longer-supported)
- [React below 18 CT no longer supported](#react-below-18-ct-no-longer-supported)
- [Angular below 17.2.0 CT no longer supported](#angular-below-1720-ct-no-longer-supported)
- [Vue 2 CT no longer supported](#vue-2-ct-no-longer-supported)
- [Svelte 3 and 4 CT no longer supported](#svelte-3-and-4-ct-no-longer-supported)
- [create-react-app CT no longer supported](#create-react-app-ct-no-longer-supported)
- [`@vue/cli-service` CT no longer supported](#vuecli-service-ct-no-longer-supported)
- [Browser support policy](#browser-support-policy)

## `cy.origin()` now required for cross-origin navigation

Cypress no longer injects `document.domain` into `text/html` content by default. A test that interacts with a second origin (a composite of URL scheme, hostname, and port) must now wrap that interaction in `cy.origin()` — even when both origins share a superdomain.

**Detect:** Tests that `cy.visit()` more than one origin and then interact with the page without a `cy.origin()` block.
**Action:** Wrap second-origin interactions in `cy.origin()`.

```js
cy.visit('https://www.cypress.io')
cy.visit('https://docs.cypress.io')

// before — fails: Cypress cannot interact with the second origin
cy.get('[role="banner"]').should('be.visible')

// after
cy.origin('https://docs.cypress.io', () => {
  cy.get('[role="banner"]').should('be.visible')
})
```

As a temporary bridge you can set `injectDocumentDomain: true` to avoid `cy.origin()` when the superdomain matches — but it is **deprecated** and will be removed, must be `true` for `experimentalWebKitSupport`, and breaks some sites (Azure AD B2C, Salesforce, Google). Prefer migrating to `cy.origin()`.

## `experimentalSkipDomainInjection` replaced by `injectDocumentDomain`

The `experimentalSkipDomainInjection` config option was removed and replaced by `injectDocumentDomain` (inverted meaning).

**Detect:** `experimentalSkipDomainInjection` in the Cypress config.
**Action:** Remove it. If you still need the legacy `document.domain` injection, set `injectDocumentDomain: true` (deprecated — see the `cy.origin()` section).

## `experimentalFetchPolyfill` removed

**Detect:** `experimentalFetchPolyfill` in the Cypress config.
**Action:** Remove it; use `cy.intercept()` to handle fetch requests.

## `before:browser:launch` callback signature changed

The second argument yielded to `before:browser:launch` is no longer an array of browser arguments.

**Detect:** A `before:browser:launch` handler in `setupNodeEvents` that treats the second argument as an array of args.
**Action:** Use the `launchOptions` object (e.g. `launchOptions.args`) instead of an args array.

## `open-ct` and `run-ct` CLI commands removed

**Detect:** `cypress open-ct` or `cypress run-ct` in npm scripts or CI.
**Action:** Use `cypress open --component` and `cypress run --component`.

## Undocumented `Cypress.backend` methods removed

The undocumented `Cypress.backend('firefox:force:gc')` and `Cypress.backend('log:memory:pressure')` methods were removed.

**Detect:** Calls to either backend method.
**Action:** Remove them; there is no replacement.

## Fetch from `about:blank` in Electron no longer supported

You can no longer make a `fetch` or `XMLHttpRequest` from the `about:blank` page in Electron (e.g. `cy.window().then((win) => win.fetch('<url>'))`).

**Detect:** `win.fetch(...)` / XHR issued before any `cy.visit()`.
**Action:** Use `cy.request()`, or perform initial navigation with `cy.visit()` first.

## `cy.intercept` `resourceType` deprecated

The `resourceType` option on `cy.intercept` is deprecated; its types may change or be removed in the future.

**Detect:** `resourceType` used in `cy.intercept` matchers.
**Action:** Flag for review; avoid relying on `resourceType`.

## Just-in-time (JIT) compile changes

JIT compilation is now the default for component tests via the `justInTimeCompile` option, and the `experimentalJustInTimeCompile` flag was removed. JIT does not apply with `vite` (no benefit there).

**Detect:** `experimentalJustInTimeCompile` in the component config.
**Action:** Remove `experimentalJustInTimeCompile`. To opt out of JIT, set `justInTimeCompile: false` in the component config.

```js
{
  component: {
    justInTimeCompile: false,
  },
}
```

## `webpack-dev-server` v3 no longer supported

`@cypress/webpack-dev-server` no longer supports `webpack-dev-server` v3 and now ships v5 by default. If you are still on webpack 4, install `webpack-dev-server` v4 alongside Cypress.

**Detect:** `webpack-dev-server` v3 in `package.json` / lockfile.
**Action:** Move to `webpack-dev-server` 5 (default), or pin v4 if still using webpack 4.

## React below 18 CT no longer supported

The minimum React version for component testing is now `18.0.0`, and the `cypress/react18` harness is now `cypress/react`.

**Detect:** React 16/17, or `import { mount } from 'cypress/react18'`.
**Action:** Upgrade to React 18+ and update the import.

```ts
import { mount } from 'cypress/react18' // before
import { mount } from 'cypress/react'   // after
```

### Workaround — continue using React below 18

> `@cypress/react@8` is deprecated; a temporary workaround until you migrate to React 18+.

```sh
npm install --save-dev @cypress/react@8
```

Then update the import to add the `@` prefix:

```ts
import { mount } from 'cypress/react'  // before
import { mount } from '@cypress/react' // after
```

## Angular below 17.2.0 CT no longer supported

The minimum Angular version for component testing is now `17.2.0`. The `@cypress/angular-signals` harness is deprecated; support moved to `cypress/angular`.

**Detect:** Angular 13–16, or `import { mount } from 'cypress/angular-signals'`.
**Action:** Upgrade to Angular 17.2.0+ and update the import.

```ts
import { mount } from 'cypress/angular-signals' // before
import { mount } from 'cypress/angular'         // after
```

### Workaround — continue using Angular below 17.2.0

> `@cypress/angular@2` is deprecated; a temporary workaround until you migrate to Angular 17.2.0+.

```sh
npm install --save-dev @cypress/angular@2
```

Then update the import to add the `@` prefix:

```ts
import { mount } from 'cypress/angular'  // before
import { mount } from '@cypress/angular' // after
```

## Vue 2 CT no longer supported

Cypress 14 no longer ships the Vue 2 component-testing harness.

**Detect:** Vue 2 in `package.json` / lockfile, or `import { mount } from 'cypress/vue2'`.
**Action:** Migrate to Vue 3. To stay on Vue 2 temporarily, install the standalone harness and update the import.

### Workaround — continue using Vue 2

> `@cypress/vue2` is deprecated; a temporary workaround until you migrate to Vue 3.

```sh
npm install --save-dev @cypress/vue2
```

```ts
import { mount } from 'cypress/vue2'  // before
import { mount } from '@cypress/vue2' // after
```

## Svelte 3 and 4 CT no longer supported

Cypress 14 no longer ships the Svelte 3/4 component-testing harness.

**Detect:** Svelte 3/4 in `package.json` / lockfile.
**Action:** Migrate to Svelte 5. To stay on Svelte 3/4 temporarily, install the standalone harness and update the import.

### Workaround — continue using Svelte 3 and 4

> `@cypress/svelte@2` is deprecated; a temporary workaround until you migrate to Svelte 5+.

```sh
npm install --save-dev @cypress/svelte@2
```

```ts
import { mount } from 'cypress/svelte'  // before
import { mount } from '@cypress/svelte' // after
```

## create-react-app CT no longer supported

`create-react-app` is no longer supported; component tests now need a real bundler.

**Detect:** `framework: 'create-react-app'` in the component `devServer` config.
**Action:** Switch to a bundler (`webpack` or `vite`) and set `framework: 'react'`. If ejecting CRA, point `webpackConfig` at the ejected config:

```js
process.env.NODE_ENV = 'development'
const { defineConfig } = require('cypress')
const webpackConfig = require('./config/webpack.config.js')

module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: webpackConfig('development'),
    },
  },
})
```

## `@vue/cli-service` CT no longer supported

`@vue/cli-service` (Vue CLI) is no longer supported; component tests now need a real bundler.

**Detect:** `framework: 'vue-cli'` in the component `devServer` config.
**Action:** Switch to a bundler (`vite` recommended, or `webpack`) and set `framework: 'vue'`.

```js
devServer: { framework: 'vue-cli', bundler: 'webpack' } // before
devServer: { framework: 'vue', bundler: 'vite' }        // after (or 'webpack')
```

## Browser support policy

Cypress 14 officially supports the latest 3 major versions of Chrome, Firefox, and Edge.

**Action:** No code change — keep browsers up to date for compatibility.
