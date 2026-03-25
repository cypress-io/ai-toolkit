# Cypress Explain Test

An agent skill that helps you describe, understand, and critique existing Cypress tests so you can spot gaps, problems, and ways to make them stronger.

This skill is built for teams who already have Cypress specs or are just getting started and want clearer narratives of what each test does, how it relates to the app under test, and where the suite might be thin, brittle, or out of date. Use it to walk through flows step by step, translate commands and patterns into plain language, and surface missing coverage, flaky or over-coupled selectors, weak assertions, and practical enhancements—from small refactors to broader test-design improvements—without replacing your authoring workflow.

## Installation

`npx skills add https://github.com/cypress-io/ai-toolkit/tree/main/skills/cypress-explain`

*Note:* Add a `-g` flag to install it globally, otherwise will be installed for the current project.

Want more details? Review [these instructions for installing Skills](../README.md#installation).

## Use

This skill attempts to listen for testing-related prompts and injects content and instructions to improve the flow. You can supply as much or as little instruction in your prompt as possible.

Skills are triggered by the agent+model comparing your keywords and intents with subjects the skill claims to understand. You may need to rephrase or add specificity to your prompts to get it to trigger in your environment. Most agents also support a "slash command" to directly trigger a skill: `/cypress-explain ...`.

### Prompt examples

**Answer Cypress Questions**
> Does Cypress support async/await?

**Planning**
> How could I write a Cypress test that uses AI to validate my application?

**Explain Tests**

> Explain this Cypress test

**Improve Tests**
> Review this e2e test. Identify potential issues and suggest improvements.

## FAQ

### How do I know it's working?

Each agent is different, but usually you can look in the conversation history to ensure your agent is invoking the `cypress-explain` skill based on your prompt. You should also see a friendly message from the skill to let you know it's done.

### Why isn't the skill triggering?

1. Verify it's installed and configured in the appropriate context. Skills can be user or project specific and the setup depends on your Agent of Choice.
2. The skill attempts to listen for test-related language but depending on your agent, model, and other skills it may not be triggered. You can improve your odds by using the word "Cypress".
3. Most agents allow you to verify a skill is installed and/or force a skill to be used by using a slash command (above).

### I don't like the content it's generating - what can I do?

**Is it something general-purpose or otherwise would apply to others? Consider contributing to this skill!**

You can supply as much or as little context as you want when triggering the skill. Add steps, instructions, patterns, and anti-patterns to help inform the model and it will be mixed in with the instructions the skill supplies.

For the AI power users, consider defining your own rules and skills with specific overrides and customizations.

### I'm getting bad/slow results

Think of this skill as just setting up some general guidelines - you may need to focus the prompt a bit by pointing at specific files or calling out things you *don't* want it to do. These should improve as you write more tests and the skill has more material to reference.

Underneath it all, the chosen model will have an outsized impact on speed vs quality behavior. Are you getting fabulous results but it's too slow? Try a lighter, faster model like Claude Haiku or Gemini Flash. Things speedy but not getting great tests? Try a heavier, slower model like Claude Opus or Gemini Pro.

## Development

Remove and reinstall this skill *globally* (remove the `-g` to make it project-specific). To avoid doubt you may want to verify you only have one or the other so you're confident your changes are getting picked up.

`npx skills remove cypress-explain -a claude-code -g`
`npx skills add ../cypress-explain -a claude-code -g`
