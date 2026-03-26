# Cypress Run

Helps refine and improve the Cypress experience in your AI Agent-of-Choice.

- Running Cypress tests (E2E and component)

## Issues

Cypress was designed with human users and CI flows in mind; however, new agentic workflows can hit bottlenecks and limitations. This skill works toward improving or working around those issues when agents drive test execution.

### User shell

Agents operate in a shell that may not match how humans run the suite: the app under test and backing services often need to be up with the right ports, env vars, and secrets, while Cypress may assume a headed browser, a display, or project-specific npm scripts that do not translate cleanly to non-interactive automation.

### Flakiness and "Run Until Green" workflows

Tests can be slow or flaky, so tight feedback loops burn time and tokens, and failures surface as detailed logs that are easy to misread without knowing whether the failure is environment (permissions, network, missing `baseUrl`), data, or the test itself.

### Targeting

Agents risk running the wrong target (whole suite vs one spec), skipping setup steps documented only in team habit, or leaving orphan processes; orchestration, isolation, and clear run boundaries matter as much as the test code.

## Installation

`npx skills add https://github.com/cypress-io/ai-toolkit/tree/main/skills/cypress-run`

*Note:* Add a `-g` flag to install it globally; otherwise it is installed for the current project.

Want more details? Review [these instructions for installing Skills](../README.md#installation).

## Use

This skill adds instructions for **executing** Cypress via project scripts or the CLI, respecting project setup and the user’s intent. You can give a minimal prompt (“run e2e”) or a detailed one (spec path, headed/headless, grep).

Skills are matched to your prompt by the agent and model. If it does not trigger, add specificity (e.g. “Cypress”, path to spec). Many agents support a slash command, e.g. `/cypress-run ...`.

### Prompt examples

**Run a spec**

> Run the Cypress spec `cypress/e2e/login.cy.ts`.

**Run one test**

> Run only the test `should show validation errors` in `cypress/e2e/forms.cy.ts`.

**Run via npm script**

> Use the `test:e2e` script from `package.json` and tell me the result.

**Headed / CI-style**

> Run component tests headless like CI would.

## FAQ

### How do I know it is working?

Check that the agent invoked the **cypress-run** skill and that the response includes how Cypress was invoked and the run output (or a clear reason it could not run).

### Why is the skill not triggering?

1. Confirm it is installed in the right scope (user vs project) for your agent.
2. Include run-related wording (“run”, “execute”, spec path, “Cypress”).
3. Use your agent’s slash command or skill picker if available.

### It runs, but results look wrong

1. Confirm Cypress and this skill are up to date.
2. Point the agent at your team’s setup: dev server, env files, npm scripts, `baseUrl`, and any required services.
3. If failures are environmental, share errors verbatim and what should already be running locally.

### I want authoring, not just execution

Use **[cypress-author](../cypress-author/README.md)** to create or change tests; use **cypress-run** when you only need execution and reporting.

### Bad or slow outcomes

Narrow the target (one spec or one `it`), avoid looping “run until green” without reading the first failure, and match model depth to the task (lighter models for quick reruns, heavier ones for messy failure analysis).

## Development

Remove and reinstall this skill *globally* (omit `-g` for project-only). Keep a single install location so picks up changes predictably.

`npx skills remove cypress-run -a claude-code -g`

`npx skills add ../cypress-run -a claude-code -g`
