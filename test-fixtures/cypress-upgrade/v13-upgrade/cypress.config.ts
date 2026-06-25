import { defineConfig } from 'cypress'

export default defineConfig({
  // v13: video now defaults to false — this is redundant and can be removed
  video: false,
  // v13: videoCompression now defaults to false
  videoCompression: 32,
  // v13: this option was removed
  videoUploadOnPasses: false,
  // v13: this deprecated option was removed
  nodeVersion: 'system',
  e2e: {
    setupNodeEvents(on) {
      // v13: Module API / after:run result properties changed for consistency
      on('after:run', (results) => {
        console.log(results.totalPassed, results.totalFailed)
      })
      on('after:spec', (spec, results) => {
        console.log(spec.relative, results.stats)
      })
    },
  },
})
