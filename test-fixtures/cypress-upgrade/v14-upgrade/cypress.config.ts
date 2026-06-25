import { defineConfig } from 'cypress'

export default defineConfig({
  // v14: this experimental option was removed and replaced by injectDocumentDomain
  experimentalSkipDomainInjection: ['*.example.com'],
  // v14: this experimental option was removed (use cy.intercept())
  experimentalFetchPolyfill: true,
  e2e: {
    setupNodeEvents(on) {
      // v14: the second argument is no longer an array of browser arguments
      on('before:browser:launch', (browser, args) => {
        args.push('--disable-gpu')
        return args
      })
    },
  },
  component: {
    // v14: experimentalJustInTimeCompile removed (justInTimeCompile is the default)
    experimentalJustInTimeCompile: true,
    devServer: {
      // v14: create-react-app is no longer supported
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
})
