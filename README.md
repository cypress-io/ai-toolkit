<p align="center">
  <img src="./assets/cypress-logotype-dark.svg#gh-light-mode-only" alt="Cypress" width="240" />
  <img src="./assets/cypress-logotype.svg#gh-dark-mode-only" alt="Cypress" width="240" />
</p>

# ✨ Cypress AI Toolkit

Open-source Cypress AI skills, built by the Cypress team. Works with Claude, Cursor, GitHub Copilot, and more.

Your AI tool is capable. It just does not know Cypress the way you do. The toolkit fixes that with skills, context, and guidance built by the team that built Cypress.

Cypress also ships AI capabilities in the App and Cypress Cloud - such as [`cy.prompt()`](https://docs.cypress.io/api/commands/prompt), Studio AI, Cloud MCP, Test Intent and Error Summaries, and UI Coverage test generation. Learn more in the [Cypress AI documentation](https://docs.cypress.io/cloud/features/cypress-ai-features).

## The problem this solves

AI tools can work with Cypress. What they struggle with is applying it consistently and correctly.

Without guidance, AI tools fall back on generic patterns — underusing the Cypress API, misapplying selectors, skipping best practices that experienced Cypress developers internalize over time. The result is output that technically runs but that you can't rely on.

The Cypress AI Toolkit gives your AI tools the Cypress-specific context they need to produce output you can actually build on — consistently, across your team and your workflows.

## What's in the toolkit

### Skills

Skills are instruction sets your AI tool loads to apply Cypress-specific knowledge when generating or reviewing test code. They fill the gap between what an AI learned during training and what current, well-written Cypress tests actually look like.

Two skills are available now:

- **[`cypress-author`](./skills/README.md#cypress-author)** — Improves how AI tools create, update, and fix Cypress tests. Use it when you're writing new tests or fixing broken ones.
- **[`cypress-explain`](./skills/README.md#cypress-explain)** — Helps you understand, describe, and critique existing tests. Use it when auditing a suite, onboarding a new team member, or investigating a brittle test before rewriting it.

Skills work with any AI tool that accepts custom instructions, including Claude, Cursor, and GitHub Copilot.

See the [skills documentation](./skills/README.md) for installation instructions, example prompts, and troubleshooting.

### What's coming

We're building toward a broader toolkit.

The community will help shape what gets prioritized. If you're already unlocking AI-powered Cypress workflows, we want to hear how. [Open an issue](https://github.com/cypress-io/ai-toolkit/issues) or [open a PR](https://github.com/cypress-io/ai-toolkit/pulls).

## Getting started

The Cypress AI toolkit is published as a plugin for both Claude and Cursor. This is the easiest way to install and configure the various capabilities in this package and also enables an auto-update capability.

_Note: Listings in the Claude and Cursor official plugin marketplaces are currently pending. This README will be updated once they are available. Until then, this repository can be cloned and installed as a local plugin in your agent of choice._

### Manual Installation

If you're using another agent or prefer to pick-and-choose you can pick the portions of this repository you want.

1. Install the skills using the [`skills`](https://skills.sh/) package:

   ```sh
   npx skills add cypress-io/ai-toolkit
   ```

2. Prompt your AI tool as you normally would. The skills will activate automatically when relevant, or invoke one directly with a slash command (e.g. `/cypress-author`).

For manual installation, example prompts, and more, see the [skills documentation](./skills/README.md) or the [Cypress AI Skills docs](https://docs.cypress.io/app/tooling/ai-skills).

3. The Cypress Cloud MCP configuration can be copied into your agent, or you can follow the [configuration instructions here](https://docs.cypress.io/cloud/integrations/cloud-mcp).

## Who this is for

This toolkit is for Cypress developers who use AI coding tools and want consistent, reliable output — not just code that runs.

It's the right fit if you want your AI tool to:

- Follow Cypress conventions and best practices without being told every time
- Produce workflows you can repeat and build on, not just one-off completions
- Behave consistently across your team, regardless of who's prompting

You do not need AI expertise to use it. You need Cypress and an AI coding tool.

## Contributing

We welcome contributions of all kinds: new skills, improvements to existing ones, bug reports, and ideas.

If you've built something that makes AI tools smarter about Cypress, this is the right place to share it.

Read the [contributing guide](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE)
