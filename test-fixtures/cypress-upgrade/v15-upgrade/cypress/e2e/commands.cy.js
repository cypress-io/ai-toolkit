describe('v15 e2e patterns', () => {
  it('reads the renamed cy.exec property', () => {
    // v15: the `code` property was renamed to `exitCode`
    cy.exec('echo hi').its('code').should('eq', 0)
  })

  it('uses the removed 3-argument cy.stub signature', () => {
    const user = { getName: () => 'Jane' }
    // v15: cy.stub(obj, name, fn) is removed — use cy.stub(obj, name).callsFake(fn)
    cy.stub(user, 'getName', () => 'Stubbed')
  })
})
