# Run Cypress Test Rules

Only attempt to run the Cypress test if the user requests it.

## Setup

You MUST read and follow [../setup/env.md](../setup/env.md) before attempting to invoke Cypress, including attempts to run tests.

## Intent

Review the conversation to determine whether the impacted spec or test should be executed.
- Changes that do not impact the test functionality should not be run. This includes changes isolated to comments and formatting.
- Always respect instructions from the user regarding whether or not to run the test

## Understand

- Review the project's `package.json` file
  - Determine the version of Cypress being used
  - Review project-defined scripts, focus on any related to running Cypress tests
- Determine if there are existing scripts to execute Cypress tests.
  - Verify if those scripts can focus on a single spec or test.
- If no project script exists, use the [Cypress Command Line Interface](https://on.cypress.io/cli) to run the impacted test.
- If running E2E tests, determine if the application needs to be running locally.
