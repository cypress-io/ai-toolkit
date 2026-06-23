# Cypress v15.0 breaking changes

Detailed code/config changes for the `cypress-upgrade` skill's v15 path — each section describes one breaking change: what to detect and how to fix it. This file is the reference consulted by the shared flow's "Make updates" phase ([../../shared/upgrade-flow.md](../../shared/upgrade-flow.md)). The version **support matrix** (Node, glibc, bundler/framework thresholds) and links live in [./overview.md](./overview.md). See also the full changelog at https://on.cypress.io/changelog#15-0-0 and the migration guide at https://on.cypress.io/migration-guide.

> Environment-only requirements (Node.js and glibc) carry no code change and are covered by the support matrix in [./overview.md](./overview.md); they are not repeated here.

## `cy.exec()` `code` property renamed to `exitCode`

The `code` property on [`cy.exec()`](https://on.cypress.io/exec) has been renamed to `exitCode`.

**Detect:** `cy.exec(...)` chains that read `.its('code')` (or otherwise access the `code` property of the yielded result).
**Action:** Rename `code` to `exitCode`.

Before:

```javascript
cy.exec('rake db:seed').its('code').should('eq', 0)
```

After:

```javascript
cy.exec('rake db:seed').its('exitCode').should('eq', 0)
```

## `cy.stub()` 3-argument signature removed

The deprecated 3-argument signature of [`cy.stub()`](https://on.cypress.io/stub) — `cy.stub(object, name, fn)` — is no longer supported. Use `cy.stub(object, name).callsFake(fn)` instead. (Addresses [#31346](https://github.com/cypress-io/cypress/issues/31346).)

**Detect:** `cy.stub(...)` calls passing a third argument — `cy.stub(obj, 'method', fn)`.
**Action:** Replace the third argument with a chained `.callsFake(fn)`.

Before:

```javascript
cy.stub(user, 'getName', () => 'Jane')
```

After:

```javascript
cy.stub(user, 'getName').callsFake(() => 'Jane')
```

## Selector Playground API renamed to Element Selector

`Cypress.SelectorPlayground` has been renamed to [`Cypress.ElementSelector`](https://on.cypress.io/element-selector-api). The `onElement` function has also been **removed** as an option to the `defaults` method. This reflects its use beyond the Selector Playground (e.g. Cypress Studio).

**Detect:** `Cypress.SelectorPlayground` usage (commonly in support files).
**Action:** Rename to `Cypress.ElementSelector`. Remove any `onElement` option passed to `defaults`.

Before:

```ts
Cypress.SelectorPlayground.defaults({
  selectorPriority: ['class', 'id'],
})
```

After:

```ts
Cypress.ElementSelector.defaults({
  selectorPriority: ['class', 'id'],
})
```

## Webpack 4 is no longer supported

Cypress no longer supports Webpack `4` (it is unmaintained; Webpack `5` has been available since Q4 2020). This drops Webpack `4` support for:

- **`@cypress/webpack-dev-server`** (component testing) — the most common case; requires an update to Webpack `5`. It also no longer supports Webpack Dev Server v4 — Cypress 14 shipped Webpack Dev Server v5 as the default, with `webpack-dev-server@4` as an option.
- **`@cypress/webpack-preprocessor`** (end-to-end) — By default Cypress uses the [Webpack Batteries Included Preprocessor](https://github.com/cypress-io/cypress/blob/@cypress/webpack-batteries-included-preprocessor-v3.0.7/npm/webpack-batteries-included-preprocessor/README.md), which has used Webpack 5 since Cypress 13. This change likely does not apply unless you use `@cypress/webpack-preprocessor` as a standalone package.

**Detect:** Webpack `4` in `package.json`/lockfile; standalone use of `@cypress/webpack-dev-server` or `@cypress/webpack-preprocessor`.
**Action:** Recommend upgrading to Webpack `5`. If the user declines, apply the relevant workaround below.

### Workaround — continue using Webpack 4

> These pinned package versions are deprecated and no longer supported by Cypress. They are temporary workarounds until you can migrate to Webpack `5`.

#### Component Testing

```sh
npm install --save-dev @cypress/webpack-dev-server@4
```

```js
import { devServer } from '@cypress/webpack-dev-server'
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: 'react',
        webpackConfig: require('./webpack.config.js'),
      })
    },
  },
})
```

More info: [Webpack Dev Server v4 docs](https://github.com/cypress-io/cypress/blob/@cypress/webpack-dev-server-v4.0.2/npm/webpack-dev-server/README.md) and [Custom Dev Server docs](https://on.cypress.io/component-testing/component-framework-configuration).

#### End-to-End Testing

Only needed if you already use `@cypress/webpack-preprocessor` as a standalone package and need custom spec preprocessing with Webpack `4`.

```sh
npm install --save-dev @cypress/webpack-preprocessor@6
```

```js
import { defineConfig } from 'cypress'
import webpackPreprocessor from '@cypress/webpack-preprocessor'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('file:preprocessor', webpackPreprocessor())
    },
  },
})
```

More info: [Preprocessors API docs](https://on.cypress.io/preprocessors-api) and [Webpack Preprocessor docs](https://github.com/cypress-io/cypress/blob/@cypress/webpack-preprocessor-v6.0.4/npm/webpack-preprocessor/README.md).

## `@cypress/webpack-batteries-included-preprocessor` no longer shims all Webpack 4 built-ins

To better align with best practices (and reduce security vulnerabilities and bundle size), the default file preprocessor, `@cypress/webpack-batteries-included-preprocessor`, no longer includes certain browser built-ins that Webpack 4 provided automatically. (Addresses [#31039](https://github.com/cypress-io/cypress/issues/31039).)

**Removed built-ins:** `assert`, `constants`, `crypto`, `domain`, `events`, `http`, `https`, `punycode`, `querystring`, `string_decoder`, `sys`, `timers`, `tty`, `url`, `util`, `vm`, and `zlib`.

**Still shipped by default:** Because many users share files between their Cypress tests and Node context, the preprocessor continues to ship built-in support for `buffer`, `path`, `process`, `os`, and `stream`.

**Detect:** Spec files (or files they import) that rely on any of the removed built-ins — e.g. `require('crypto')` / `import ... from 'crypto'`, `querystring`, `url`, `util`, `zlib`, etc.
**Action:** If a removed built-in is required, install `@cypress/webpack-batteries-included-preprocessor` independently and configure it via [Webpack's `resolve.fallback`](https://webpack.js.org/configuration/resolve/#resolvefallback), per the [`@cypress/webpack-batteries-included-preprocessor` README](https://github.com/cypress-io/cypress/blob/@cypress/webpack-batteries-included-preprocessor-v3.0.7/npm/webpack-batteries-included-preprocessor/README.md).

Example providing the `querystring` built-in:

```javascript
const webpackPreprocessor = require('@cypress/webpack-batteries-included-preprocessor')

function getWebpackOptions() {
  const options = webpackPreprocessor.getFullWebpackOptions()

  // add built-ins as needed
  // NOTE: for this example, querystring-es3 needs to be installed as a dependency
  options.resolve.fallback.querystring = require.resolve('querystring-es3')
  return options
}

module.exports = (on) => {
  on(
    'file:preprocessor',
    webpackPreprocessor({
      // if using typescript, you will need to set the typescript option to true
      typescript: true,
      webpackOptions: getWebpackOptions(),
    })
  )
}
```

## `@cypress/vite-dev-server` is now ESM-only

`@cypress/vite-dev-server` (used for Vite-based component testing) is now an **ESM-only** package and can no longer be used from a CommonJS context.

**Detect:** A project doing Vite component testing whose Cypress config is CommonJS — e.g. a `cypress.config.cjs`, or a `cypress.config.js` using `require(...)` / `module.exports` (no `"type": "module"` in `package.json`) — that imports or otherwise pulls in `@cypress/vite-dev-server`.
**Action:** Move the Cypress config to an ESM context — convert it to `import`/`export default` (a `cypress.config.mjs`, or set `"type": "module"` in `package.json`), or use the TypeScript config (`cypress.config.ts`). Do not leave `@cypress/vite-dev-server` being `require()`d from CommonJS.

## Vite 4 is no longer supported

`@cypress/vite-dev-server` no longer supports Vite `4`. The minimum supported Vite version is now `5`.

**Detect:** `vite` on version `4` in `package.json` / the lockfile in a project using Vite component testing.
**Action:** Upgrade `vite` to `5` or newer (e.g. `npm install --save-dev vite@^5`). Review the [Vite migration guide](https://vite.dev/guide/migration) for any Vite 4 → 5 changes in your own config.

## Angular 17 component testing is no longer supported

With [LTS end](https://angular.dev/reference/releases#actively-supported-versions) for Angular 17, the minimum Angular version for component testing is now `18.0.0`.

**Detect:** `@angular/cli` / `@angular/core` on version 17 in a project with component testing.
**Action:** Recommend upgrading to Angular `18.0.0+`. If the user declines, apply the workaround below.

## `@cypress/angular` requires zone.js `0.14.0+`

`@cypress/angular` now requires a minimum of `zone.js` `0.14.0`. (Addresses [#31582](https://github.com/cypress-io/cypress/issues/31582).) This applies to projects using Angular component testing.

**Detect:** In a project with Angular component testing, check the resolved `zone.js` version in `package.json` / the lockfile. Flag it if it is below `0.14.0`.
**Action:** Update `zone.js` to `0.14.0` or newer (e.g. `npm install --save-dev zone.js@^0.14.0`).

### Workaround — continue using Angular below 18.0.0

> The pinned `@cypress/angular@3` test harness is deprecated and no longer supported by Cypress. It is a temporary workaround until you can migrate to Angular v18.0.0+.

```sh
npm install --save-dev @cypress/angular@3
```

Then, inside your component support file (e.g. `./cypress/support/component.(js|ts)`) or wherever the `mount` function is imported, add the `@` prefix.

Before:

```ts
import { mount } from 'cypress/angular'
```

After:

```ts
import { mount } from '@cypress/angular'
```
