# Cypress v15.0 breaking changes

Reference detail for the `cypress-v15-migration` skill. Each section describes one breaking change: what to detect and how to fix it. See the full changelog at https://on.cypress.io/changelog#15-0-0 and the migration guide at https://on.cypress.io/migration-guide.

## Node.js 20, 22 and 24+ support

Cypress requires [Node.js](https://nodejs.org/en) to install the Cypress binary. The supported versions are now Node.js **20, 22, 24 and above**. Node.js **18 and 23 are no longer supported**. See [Node's release schedule](https://github.com/nodejs/Release).

**Detect:** `.nvmrc`, `.node-version`, `engines` in `package.json`, CI workflow files, and Dockerfiles.
**Action:** Flag in the report. The user must update their Node.js version; this cannot be safely automated.

## Unsupported Linux distributions (glibc < 2.31)

Prebuilt binaries for Linux are no longer compatible with Linux distributions based on glibc `< 2.31`. This is in line with Node.js's support for Linux in 20+.

**Detect:** On Linux, run `ldd --version` to read the glibc version.
**Action:** If glibc `< 2.31`, flag that the user must update their distribution to install Cypress 15+.

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

The default file preprocessor no longer shims all built-ins previously provided by Webpack v4 — this reduces security vulnerabilities and bundle size. It still ships with **some** built-ins: `buffer`, `path`, `process`, `os`, and `stream`.

**Action:** If other built-ins are required, install `@cypress/webpack-batteries-included-preprocessor` independently and configure them via [Webpack's `resolve.fallback`](https://webpack.js.org/configuration/resolve/#resolvefallback).

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

## Angular 17 component testing is no longer supported

With [LTS end](https://angular.dev/reference/releases#actively-supported-versions) for Angular 17, the minimum Angular version for component testing is now `18.0.0`.

**Detect:** `@angular/cli` / `@angular/core` on version 17 in a project with component testing.
**Action:** Recommend upgrading to Angular `18.0.0+`. If the user declines, apply the workaround below.

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
