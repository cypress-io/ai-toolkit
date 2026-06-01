# Cypress v16 Migration Prompts

Cypress v16 is a major release with a set of committed, documented breaking changes. This folder contains prompts to help you prepare for and work through those changes with an AI tool. The provided prompts are not exhaustive of the coming changes.

These are starting points — not magic wands. They work best when you bring your own codebase context: your config files, your test code, your framework setup. The prompts give your AI tool the right framing and checklist; you supply the specifics.

## Who this is for

Anyone upgrading a Cypress project to v16. Whether you're doing it yourself or delegating test updates to an AI tool, these prompts give both you and your AI a shared, accurate starting point.

These prompts are also useful before v16 is released. Use them now to audit your codebase for deprecated patterns, understand the scope of changes needed, and work toward compatibility incrementally — so the actual upgrade is straightforward when the time comes.

## What changed in v16

A few of the breaking changes in v16 include removing `Cypress.env()` in favor of `cy.env()`, updating the visibility check behavior and dropping deprecated Node and component testing library support.

For the full changelog and official migration guide, see the [Cypress v16 migration guide draft](https://deploy-preview-6451--cypress-docs.netlify.app/app/references/migration-guide#Migrating-to-Cypress-160) and the [Github issue](https://github.com/cypress-io/cypress/issues/33052) tracking the changes.

## How to use these prompts

Each prompt in this folder targets a specific breaking change or migration task. They are designed to be used as system prompts or initial instructions in your AI tool of choice — paste one in, add your relevant code or config, and let the AI do the heavy lifting.

A few things to keep in mind:

- **Run one prompt per concern.** Don't try to address `Cypress.env()` removal and Angular version updates in the same session. Scope each session to a single migration task.
- **Treat the output as a draft.** Review what the AI produces before committing. The prompts are designed to push toward correct Cypress v16 patterns, but your tests need to pass in your environment.
- **Use the official migration guide alongside.** These prompts are accelerators, not replacements for the docs. Link is above.

## Prompt Library

| Prompt Goal | Change Explainer |
|--|--|
| [Remove Keyboard Delay](./remove-keyboard-delay.md) | The keyboard delay allows you to simulate real-user typing delays. Cypress v16 new default for Keyboard delay will be 0ms, previously 10ms. This changed to improve test run performance. |
| [Remove Cypress.env() usage](./remove-cypress-env-usage.md) | Cypress.env() was deprecated in v15.10.0 to reduce risk of accidentally exposing sensitive data. With data security top-of-mind, Cypress v16 will no longer support the `Cypress.env()` and require users to migrate to `cy.env()` to feed sensitive values into tests and use `Cypress.expose()` for non-sensitive values. See the [Migrating away from Cypress.env() guide](https://on.cypress.io/migration-guide#Migrating-away-from-Cypressenv) for more explanation.  |

## Have feedback on a prompt?

Open a github issue and share your feedback and what's worked for you!