describe('v14 e2e patterns', () => {
  it('interacts with a second origin without cy.origin()', () => {
    cy.visit('https://www.cypress.io')
    cy.visit('https://docs.cypress.io')
    // v14: document.domain is no longer injected — this now requires cy.origin()
    cy.get('[role="banner"]').should('be.visible')
  })

  it('uses removed / deprecated APIs', () => {
    // v14: resourceType on cy.intercept is deprecated
    cy.intercept({ resourceType: 'xhr', url: '/api/**' }, {})

    // v14: this undocumented backend method was removed
    Cypress.backend('firefox:force:gc')

    // v14: fetch from about:blank in Electron is no longer supported (use cy.request or visit first)
    cy.window().then((win) => win.fetch('/api/health'))
  })
})
