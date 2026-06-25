// v13: readFile is now a query command, so it can no longer be overwritten with
// Cypress.Commands.overwrite() — this must become Cypress.Commands.overwriteQuery().
Cypress.Commands.overwrite('readFile', (originalFn, ...args) => {
  return originalFn(...args)
})
