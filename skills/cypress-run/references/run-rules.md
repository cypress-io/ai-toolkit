# Run Cypress Test Rules

Only attempt to run the Cypress test if the user requests it.

## Setup

You MUST read and follow [./env.md](./env.md) before attempting to invoke Cypress, including attempts to run tests.

## Intent

- **Explicit run request:** If the user asked to run, execute, or verify tests (with or without a spec path), treat that as the primary intent. Run the narrowest sensible target (spec or single test) unless they asked for the full suite or a script implies otherwise. Skip execution only when setup is unsafe or impossible (explain why), or the request is hopelessly ambiguous (ask for spec path or script).
- **After authoring or edits:** If the conversation is mainly about code changes and running is optional, do not run solely for comment-only or formatting-only edits. If the user asked you to validate a change, run as requested.
- Always respect the user’s instructions on whether or not to run, and on headed vs headless, env, or scripts when stated.

## Understand

- Review the project's `package.json` file
  - Determine the version of Cypress being used
  - Review project-defined scripts, focus on any related to running Cypress tests
- Determine if there are existing scripts to execute Cypress tests.
  - Verify if those scripts can focus on a single spec or test.
- If no project script exists, use the [Cypress Command Line Interface](https://on.cypress.io/cli) to run the impacted test.
- If running E2E tests, determine if the application needs to be running locally.
