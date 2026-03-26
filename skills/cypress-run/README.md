# Cypress Run

Helps refine and improve the Cypress experience in your AI Agent-of-Choice.

- Running Cypress tests

## Issues

Cypress was designed with human users and CI flows in mind; however, new agentic workflows can hit bottlenecks and limtiations. This skill will work toward improving or working around these issues to improve the mechanisms for using Cypress.

### User Shell

Agents operate in a shell that may not match how humans run the suite: the app under test and backing services often need to be up with the right ports, env vars, and secrets, while Cypress itself may assume a headed browser, a display, or project-specific npm scripts that don't translate cleanly to non-interactive automation.

### Flakiness and "Run Until Green" workflows

Tests can be slow or flaky, so "run until green" loops burn time and tokens, and failures surface as detailed but token-expensive logs that are easy to misread without knowing whether the failure is environment (permissions, network, missing baseUrl), data, or the test itself.

### Targeting

Agents risk running the wrong target (whole suite vs one spec), skipping setup steps documented only in team habit, or leaving orphan processes; orchestration, isolation, and clear run boundaries matter as much as the test code.

## Installation

`npx skills add https://github.com/cypress-io/ai-toolkit/tree/main/skills/cypress-author`

*Note:* Add a `-g` flag to install it globally, otherwise will be installed for the current project.

Want more details? Review [these instructions for installing Skills](../README.md#installation).

## Use

This skill attempts to listen for testing-related prompts and injects content and instructions to improve the flow. You can supply as much or as little instruction in your prompt as possible. The skill attempts to fill in the gaps using standard best-practice hints and referring to existing content when possible, but you can refine or override any behaviors just like you would with any prompt.

Skills are triggered by the agent+model comparing your keywords and intents with subjects the skill claims to understand. You may need to rephrase or add specificity to your prompts to get it to trigger in your environment. Most agents also support a "slash command" to directly trigger a skill: `/cypress-author ...`.

### Prompt examples

**Basic Test Creation**
> Write a test for this file

**Detailed Test Creation**
> Add new tests for the `/login` page.
> The tests should:
> * Test form validation and error handling
> * Use these credentials - username `cypress`, password `testing`
> * Run the tests twice - once with a 800x600px viewport and again with 2048x1536px

**Supercharged Tests**

You can encourage the LLM to create AI-powered tests using the brand-new `cy.prompt` command by supplying an ordered list of steps and referencing words like AI or "self-healing".

> Write a test that uses AI to:
> 1. Visit the shopping cart page
> 2. Remove the "Vegetables" item from the cart
> 3. Increase the quantity of the "Chocolate" item to 99

**Fix a Test**
> The "verify the skill" Cypress test in `skill.cy.ts` is failing with an EPERM error. Fix it.

## FAQ

### How do I know it's working?

Each agent is different, but usually you can look in the conversation history to ensure your agent is invoking the `cypress-arun` skill based on your prompt. You should also see a friendly message from the skill to let you know it's done.

### Why isn't the skill triggering?

1. Verify it's installed and configured in the appropriate context. Skills can be user or project specific and the setup depends on your Agent of Choice.
2. The skill attempts to listen for test-related language but depending on your agent, model, and other skills it may not be triggered. You can improve your odds by using the word "Cypress".
3. Most agents allow you to verify a skill is installed and/or force a skill to be used by using a slash command (above).

### The skill triggers but isn't running my tests correctly

1. Verify you have the latest version of the skill and the latest version of Cypress.
2. If you have custom scripts/targets that handle setup/teardown or other orchestration you may need to point the agent in that direction.
3. 

### It's still not working the way I want - what can I do?

**Is it something general-purpose or otherwise would apply to others? Consider contributing to this skill!**

You can supply as much or as little context as you want when triggering the skill. Add steps, instructions, patterns, and anti-patterns to help inform the model and it will be mixed in with the instructions the skill supplies.

For the AI power users, consider defining your own rules and skills with specific overrides and customizations. As this skill asks the model to, for example, write an e2e test you can have your own skill that triggers on that phrasing to enhance what the model is instructed with automatically.

### I'm getting bad/slow results

Think of this skill as just setting up some general guidelines - you may need to focus the prompt a bit by pointing at specific files or calling out things you *don't* want it to do. These should improve as you write more tests and the skill has more material to reference.

Underneath it all, the chosen model will have an outsized impact on speed vs quality behavior. Are you getting fabulous results but it's too slow? Try a lighter, faster model like Claude Haiku or Gemini Flash. Things speedy but not getting great tests? Try a heavier, slower model like Claude Opus or Gemini Pro.

## Development

Remove and reinstall this skill *globally* (remove the `-g` to make it project-specific). To avoid doubt you may want to verify you only have one or the other so you're confident your changes are getting picked up.

`npx skills remove cypress-run -a claude-code -g`
`npx skills add ../cypress-run -a claude-code -g`
