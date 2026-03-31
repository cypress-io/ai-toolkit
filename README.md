<p align="center">
  <img src="./assets/cypress-logotype-dark.svg#gh-light-mode-only" alt="Cypress" width="240" />
  <img src="./assets/cypress-logotype.svg#gh-dark-mode-only" alt="Cypress" width="240" />
</p>

# ✨ Cypress AI Toolkit

Open-source building blocks that help AI tools write better Cypress tests.

Cypress also ships AI capabilities in the App and Cypress Cloud - such as `cy.prompt()`, Studio AI, Cloud MCP, Test Intent and Error Summaries, and UI Coverage test generation. Learn more in the [Cypress AI documentation](https://docs.cypress.io/cloud/features/cypress-ai-features).

## The problem this solves

AI coding assistants can write Cypress tests. What they struggle with is writing *good* Cypress tests.

Without guidance, AI tools default to patterns that technically work but produce brittle, hard-to-maintain test code. They underuse the Cypress API, misapply selectors, and ignore testing best practices that experienced Cypress developers internalize over time.

The Cypress AI Toolkit gives your AI tools that context so they produce tests you actually want to ship.

## What's in the toolkit

### Skills

Skills are composable instruction sets designed to be loaded into your AI tool before it generates or reviews Cypress code.

Each skill targets a specific area of Cypress usage. You can use them individually or combine them for more complex workflows.

Skills work with any AI tool that accepts system prompts or custom instructions, including:

- Claude (claude.ai, Claude Code, API)
- Cursor
- GitHub Copilot (Workspace and Chat)
- Any tool that supports Model Context Protocol (MCP)

### What's coming

We're building toward a broader toolkit.

The community will help shape what gets prioritized. If you're already unlocking AI-powered Cypress workflows, we want to hear how. [Open an issue](https://github.com/cypress-io/ai-toolkit/issues) or [open a PR](https://github.com/cypress-io/ai-toolkit/pulls).

## Getting started

1. Browse the available skills in this repository.
2. Load the skill that matches what you're working on into your AI tool.
3. Prompt your AI tool as you normally would. Your AI tool will apply Cypress-specific guidance automatically.

Detailed usage instructions are included with each skill.

## Who this is for

The Cypress AI Toolkit is for developers who:

- Already use Cypress for end-to-end or component testing
- Are using AI coding tools and want better Cypress output from them
- Want to standardize AI-generated test quality across a team

You do not need to be an AI expert to use it. You need Cypress and an AI tool.

## Contributing

We welcome contributions of all kinds: new skills, improvements to existing ones, bug reports, and ideas.

If you've built something that makes AI tools smarter about Cypress, this is the right place to share it.

Read the [contributing guide](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE)
