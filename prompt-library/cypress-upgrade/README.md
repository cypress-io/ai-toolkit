# Cypress Upgrade Prompts

Prompts for upgrading a Cypress project across a major version with an AI tool. Each prompt points your AI tool at the official [Cypress Migration Guide](https://docs.cypress.io/app/references/migration-guide) (via its LLM-friendly markdown export) and walks it through the same flow an experienced engineer would follow: precheck the environment, update the dependency, apply the breaking changes that actually affect your codebase, then verify with `npx cypress verify` and your test suite.

These same prompts are embedded as one-click "Copy Prompt" cards in the [Migration Guide](https://docs.cypress.io/app/references/migration-guide) itself, directly below each version's section heading.

## How to use these prompts

1. Pick the prompt for the major version you're upgrading **to**.
2. Paste it into your AI coding tool of choice (Claude Code, Cursor, GitHub Copilot, etc.) with your project open.
3. Review the changes it proposes — treat the output as a draft, and confirm your tests pass in your environment.

A few things to keep in mind:

- **Upgrade one major at a time.** If you're several majors behind, run each version's prompt in sequence (e.g. 12 → 13, then 13 → 14, then 14 → 15). Each prompt checks this and stops if your project isn't on the expected starting major.
- **Some changes can't be automated.** Node.js, OS, and framework version requirements are environment changes only you can make — the prompts instruct the AI to flag these rather than guess.
- **Use the official migration guide alongside.** These prompts are accelerators, not replacements for the [docs](https://docs.cypress.io/app/references/migration-guide).

## Prompt Library

| Prompt Goal | Notes |
| --- | --- |
| [Upgrade to Cypress 15](./upgrade-to-v15.md) | From 14.x. Node.js 20/22/24+, drops webpack 4, Vite 4, Angular 17 CT. |
| [Upgrade to Cypress 14](./upgrade-to-v14.md) | From 13.x. Node.js 18+, macOS 11+, drops several CT frameworks and bundlers. |
| [Upgrade to Cypress 13](./upgrade-to-v13.md) | From 12.x. Test Replay on by default, video off by default. |

Preparing for v16? See the [Cypress v16 migration prompts](../cypress-v16-migration/README.md), which cover the deprecations (like `Cypress.env()` removal) you can address today.

## Have feedback on a prompt?

Open a github issue and share your feedback and what's worked for you!
