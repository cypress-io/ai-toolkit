# Skills

Skills are instruction sets your AI tool loads to apply Cypress-specific knowledge to your workflows.

Cypress skills work with any AI coding tool that supports custom instructions, including Cursor, Claude Code, GitHub Copilot, and others.

For full documentation — available skills, example prompts, troubleshooting, and more — see the [Cypress AI Skills docs](https://docs.cypress.io/app/tooling/ai-skills).

## Installation

### With the `skills` package (recommended)

Install all skills:

```sh
npx skills add cypress-io/ai-toolkit
```

Or install a specific skill:

```sh
npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-author
npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-explain
```

See [skills.sh](https://skills.sh/) for full documentation, including how to update and remove skills.

### Manually

1. Determine your AI tool of choice; this could be Cursor, Claude Code, or many others.
2. Decide whether you want the skill installed globally or scoped to a single project.
3. Copy the skill directory into your agent's skills install location:
  - **Cursor** (global): `~/.cursor/skills`
  - **Claude Code** (project): `{PROJECT_DIR}/.claude/skills`
  - **Other tools**: check your tool's documentation for its skills or custom instructions directory.

## Troubleshooting

For usage help, example prompts, and general troubleshooting see the [Cypress AI Skills docs](https://docs.cypress.io/app/tooling/ai-skills).

### The skill isn't being picked up after install

Verify the skill is installed in the correct location for your tool and context (global vs. project-scoped).

### Remove or reinstall a skill

```sh
npx skills remove cypress-author
npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-author
```

To avoid conflicts, verify you don't have both a global and project-scoped copy installed before reinstalling.

## Contributing

If you've found something a skill gets wrong, or you've built an improvement that would help others, we want to hear from you. Read the [contributing guide](../CONTRIBUTING.md) to get started.
