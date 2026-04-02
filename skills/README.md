# Skills

Skills are instruction sets your AI tool loads to apply Cypress-specific knowledge when generating or reviewing test code.

There is a large body of Cypress content available for AI models to learn from. Not all of it reflects the latest APIs, and not all of it reflects best practices. Skills steer your AI toward what good looks like today.

## Installation

### With the `skills` package (recommended)

```sh
npx skills add https://github.com/cypress-io/ai-toolkit/blob/main/skills/cypress-author -g
```

See [skills.sh](https://skills.sh/) for full documentation, including how to update and remove skills. Note that the update check in the `skills` package only tracks project-level installs, not global ones.

### Manually

1. Determine your Agent-of-Choice; this could be Cursor, Claude, or many others
2. Decide whether you want the skill installed globally or scoped to a single project.
3. Copy the skill directory into your agent's skills install location:
  - If you want a global **Cursor** skill this would be `{USER_HOME}/.cursor/skills`
  - If you want it project-scoped in **Claude**: `{PROJECT_DIR}/.claude/skills`

The skill directory should end up at `.../skills/{SKILL_NAME}`.

## Updates

Skills don't have a robust auto-update capability (yet), so we strongly encourage you to check back from time to time. The `skills` package referenced above includes an update check capability but you need to trigger it yourself - note that this only works for skills added to a *project* (rather than globally) so they are tracked as a project-level dependency.

## How skills are triggered

Skills activate based on keywords and intent in your prompts. Most agents also support a slash command to invoke a skill directly, for example `/cypress-author`. If a skill isn't triggering, see [Troubleshooting](#troubleshooting).

## Available skills

### [`cypress-author`](./cypress-author)

Creates, updates, and fixes Cypress end-to-end (E2E) and component tests. You don't need to say "Cypress" for it to activate. Phrases like "write a test for this file" or "fix the failing spec" are enough.

The skill reads your project before writing anything (your config, existing specs, custom commands, and fixtures) so the tests produced match your conventions rather than generic ones.

The more context you give it, the better the output.

#### Example prompts

**Create a component test:**
> Write component tests for the CheckoutSummary component. It should render correctly with an empty cart, show a line item for each product, and disable the "Place order" button when stock is unavailable.

**Create an end-to-end test with specific requirements:**
> Add new e2e tests for the `/login` page.
> The tests should:
> * Test form validation and error handling
> * Use these credentials - username `cypress`, password `testing`
> * Run the tests twice - once with a 800x600px viewport and again with 2048x1536px

**Write AI-powered tests using natural language steps:**

You can encourage the LLM to create AI-powered tests using the brand-new `cy.prompt` command by supplying an ordered list of steps and referencing words like AI or "self-healing".

> Write an e2e test that uses AI to:
> 1. Visit the shopping cart page
> 2. Remove the "Vegetables" item from the cart
> 3. Increase the quantity of the "Chocolate" item to 99

**Fix a failing test:**
> The "verify there are 2 notifications" Cypress test in `notifications.cy.ts` is failing with an '.notification is not visible' error. Fix it.

**Fix a flaky test:**
>The "submits the contact form" test in cypress/e2e/contact.cy.ts is failing intermittently with a timeout on cy.get('[data-cy="success-banner"]'). Fix it.

**Update an existing test:**
>Update the "should show validation errors" test in cypress/e2e/login.cy.ts to assert the new error message copy for an empty password field.

**Add coverage to an existing spec:**

>Review cypress/e2e/search.cy.ts and add tests for the empty state when no results are found and the error state when the search API fails.

### [`cypress-explain`](./cypress-explain)

Helps you understand, describe, and critique existing Cypress tests. Use this skill when you want to audit a test suite, onboard a new team member, or understand why a test is brittle before rewriting it.

This skill translates Cypress commands and patterns into plain language, surfaces missing coverage, and identifies weak selectors, flaky assertions, and over-coupled tests. It is built to complement `cypress-author`, not replace it.

#### Example prompts

**Explain a Cypress concept:**
>How does cy.intercept() work, and when should I use cy.wait('@alias') with it?

**Explain a specific test before editing it:**
>Explain what the "completes checkout as a guest" test in cypress/e2e/checkout.cy.ts is actually verifying, step by step.

**Audit a spec for quality issues:**
>Review cypress/e2e/dashboard.cy.ts. Flag any tests that are likely to be flaky, over-coupled to implementation details, or missing meaningful assertions.

**Understand why a pattern is used:**

>This test uses cy.intercept() and cy.wait('@alias') before clicking the submit button. Why, and what would break if it were removed?

**Get a plain-language summary for a non-technical stakeholder**
>Summarize what the tests in cypress/e2e/onboarding.cy.ts cover in plain language, as if explaining it to a product manager.

## Troubleshooting

### How do I know the skill is triggering?

Each agent is different, but usually you can look in the conversation history to ensure your agent is invoking the skill based on your prompt - the agent will typically print out that fact.

### The skill isn't triggering

1. Verify it's installed and configured in the appropriate context. Skills can be user or project specific and the setup depends on your Agent of Choice.
2. Skills attempt to listen for keywords and concepts, but depending on your agent, model, and other skills it may not be triggered. You can improve your odds by using the word "Cypress".
3. Most agents allow you to verify a skill is installed and/or force a skill to be used by using a slash command (above).

### The skill is using too many tokens

Skills sometimes prompt the agent to read foundational files like your `package.json` or Cypress config. Limit this by telling the agent to do "minimal exploration," or point it directly at the file you want it to use: "use `my_spec.cy.js` as a pattern."

Also review your `AGENTS.md`, `CLAUDE.md`, or similar agentic config files. These often reference files that are helpful in principle but large in practice. Consider adding instructions to scope how agents use them.

### The output isn't what I want*

Skills set general guidelines. Add your own steps, instructions, or anti-patterns directly in your prompt to override or extend them. The skill will mix your additions with its own.

For teams with consistent preferences, consider contributing your improvements back to this repo, or define a project-level skill that builds on top of the defaults.

### Results are slow

The model you choose has the biggest impact on speed vs. quality. For faster results, try a faster model. For higher-quality output where speed matters less, try a larger, slower model.

## Remove or reinstall skill

Remove and reinstall this skill *globally* (remove the `-g` to make it project-specific). To avoid doubt you may want to verify you only have one or the other so you're confident your changes are getting picked up.

`npx skills remove cypress-author -a claude-code -g`
`npx skills add ../cypress-author -a claude-code -g`

## Contributing

If you've found something a skill gets wrong, or you've built an improvement that would help others, we want to hear from you. Read the [contributing guide](../CONTRIBUTING.md) to get started.