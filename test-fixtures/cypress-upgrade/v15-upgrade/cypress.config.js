// v15: @cypress/vite-dev-server is now ESM-only — this CommonJS config (require /
// module.exports, no "type": "module") must be moved to an ESM context.
const { defineConfig } = require('cypress')
const { devServer } = require('@cypress/vite-dev-server')

module.exports = defineConfig({
  component: {
    devServer(devServerConfig) {
      // v15: Vite 4 is no longer supported (minimum Vite 5)
      return devServer({
        ...devServerConfig,
        framework: 'angular',
        viteConfig: {},
      })
    },
  },
})
