# Skills

Skills are instruction sets your AI tool loads to apply Cypress-specific knowledge to your workflows.

Cypress skills work with any AI coding tool that supports custom instructions, including Cursor, Claude Code, GitHub Copilot, and others.

For full documentation — available skills, example prompts, troubleshooting, and more — see the [Cypress AI Skills docs](https://docs.cypress.io/app/tooling/ai-skills).

## Installation

### Install via skills (recommended)
The [`skills`](https://skills.sh/) package is the fastest way to install Cypress skills.

Install all skills by running:

```sh
npx skills add cypress-io/ai-toolkit
```

Or install a specific skill with:

```sh
npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-author
npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-explain
npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-docs
```

See [skills.sh](https://skills.sh/) for full documentation, including how to update and remove skills. Note that the update check in the `skills` package only tracks project-level installs, not global ones.

### Manually

1. Determine your Agent-of-Choice; this could be Cursor, Claude, or many others
2. Decide whether you want the skill installed globally or scoped to a single project.
3. Copy the skill directory into your agent's skills install location:
  - **Cursor:** If you want a global **Cursor** skill this would be `{USER_HOME}/.cursor/skills`
  - **Claude Code*:** If you want it project-scoped in **Claude**: `{PROJECT_DIR}/.claude/skills`
  - **Other tools:** check your tool's documentation for its skills or custom instructions directory.

## Available skills
See the [Cypress AI Skills documentation](https://docs.cypress.io/app/tooling/ai-skills) for all examples.

### [`cypress-author`](./cypress-author)

Creates, updates, and fixes Cypress end-to-end (E2E) and component tests. You don't need to say "Cypress" for it to activate. Phrases like "write a test for this file" or "fix the failing spec" are enough.

The skill reads your project before writing anything (your config, existing specs, custom commands, and fixtures) so the tests produced match your conventions rather than generic ones.

#### Example

**Write a component test:**

```skill
/cypress-author Write component tests for the CheckoutSummary component. It should render correctly with an empty cart, show a line item for each product, and disable the "Place order" button when stock is unavailable.
```

### [`cypress-explain`](./cypress-explain)
Helps you understand, describe, and critique existing Cypress tests. Use this skill when you want to audit a test suite, onboard a new team member, or understand why a test is brittle before rewriting it.

This skill translates Cypress commands and patterns into plain language, surfaces missing coverage, and identifies weak selectors, flaky assertions, and over-coupled tests. It is built to complement `cypress-author`, not replace it.

#### Example

**Explain a Cypress concept:**

> How does cy.intercept() work, and when should I use cy.wait('@alias') with it?

### [`cypress-docs`](./cypress-docs)
Helps your agent use Cypress documentation more effectively and reliably by using LLM-optimized resources and supplying guidance on how to parse and extract information while grounding answers in verifiable information.

This skill is meant to help inform and support other Cypress skills.

#### Example

**Define a Cypress API:**

> Define the Cypress `cy.prompt` API

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

## Contributing

If you've found something a skill gets wrong, or you've built an improvement that would help others, we want to hear from you. Read the [contributing guide](../CONTRIBUTING.md) to get started.
