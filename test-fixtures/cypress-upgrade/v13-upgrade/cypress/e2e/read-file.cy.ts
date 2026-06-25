describe('readFile', () => {
  it('reads a fixture', () => {
    // v13: readFile is now a query — this continues to work unchanged.
    // Included to confirm the upgrade does NOT make a spurious edit here.
    cy.readFile('cypress/fixtures/users.json')
      .its('users.123.fullName')
      .should('eq', 'John Doe')
  })
})
