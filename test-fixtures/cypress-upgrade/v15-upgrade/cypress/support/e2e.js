// v15: Cypress.SelectorPlayground was renamed to Cypress.ElementSelector
// (and the onElement option was removed from defaults).
Cypress.SelectorPlayground.defaults({
  selectorPriority: ['data-cy', 'id', 'class'],
})
