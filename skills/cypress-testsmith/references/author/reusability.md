# Reusable Patterns

Consider extracting repeated or reusable content.

## Hooks

Prefer `before` and `beforeEach` hooks for required setup and configuration. Consider extracting existing test content into a shared hook if similar steps are needed in a new test. 

Code in `before` hooks is only run once, and between the tests Cypress removes all aliases, so subsequent tests may not have access to them. Always prefer defining aliases in `beforeEach` over `before`.

## Repeated browser state

Consider the `cy.session` command for situations where browser state (such as authentication) is repeatedly established.

## Custom Commands

Always review existing Cypress Custom Commands and prefer using them when possible. Consider extracting repeated or shared steps in to new Custom Commands, especially if this projects already uses Custom Commands.
