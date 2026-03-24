# Cypress TestSmith

TestSmith helps refine and improve the Cypress experience in your AI Agent-of-Choice.

- Creating, updating, or fixing Cypress tests
- Explaining Cypress tests
- Answering questions about Cypress

There's a huge body of knowledge out there for Cypress tests which is incredible for LLM's to train and learn on. Unfortunately it's not always the latest (and sometimes not the greatest 😬), especially as Cypress continually releases new features and improvements. This skill attempts to steer your Cypress-related interactions with guidelines, hints, and enhancements to deliver higher-quality, more performant, and more maintainable artifacts.

## Installation

`npx skills add https://github.com/cypress-io/ai-toolkit/tree/main/skills/cypress-testsmith`

Want more details? Review [these instructions for installing Skills](../README.md#installation).

## Use

TestSmith attempts to listen for testing-related prompts and injects content and instructions to improve the flow. You can supply as much or as little instruction in your prompt as possible. TestSmith attempts to fill in the gaps using standard best-practice hints and referring to existing content when possible, but you can refine or override any behaviors just like you would with any prompt.

Skills are triggered by the agent+model comparing your keywords and intents with subjects the skill claims to understand. You may need to rephrase or add specificity to your prompts to get it to trigger in your environment. Most agents also support a "slash command" to directly trigger a skill: `/cypress-testsmith ...`.

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

**Explain Cypress concepts**
> Explain how I could change this test to use `cy.prompt`

**Explain Cypress tests**
> What is this Cypress test doing, and how could I improve it?

## FAQ

### How do I know it's working?

Each agent is different, but usually you can look in the conversation history to ensure your agent is invoking the `cypress-testsmith` skill based on your prompt. You should also see a friendly message from the skill to let you know it's done.

### Why isn't the skill triggering?

1. Verify it's installed and configured in the appropriate context. Skills can be user or project specific and the setup depends on your Agent of Choice.
2. The skill attempts to listen for test-related language but depending on your agent, model, and other skills it may not be triggered. You can improve your odds by using the word "Cypress".
3. Most agents allow you to verify a skill is installed and/or force a skill to be used by using a slash command (above).

### I don't like the tests it's writing - what can I do?

**Is it something general-purpose or otherwise would apply to others? Consider contributing to this skill!**

You can supply as much or as little context as you want when triggering the skill. Add steps, instructions, patterns, and anti-patterns to help inform the model and it will be mixed in with the instructions the skill supplies.

The skill will leverage any existing Cypress configuration and Cypress tests, so generally you'll get better results as your test suite grows.

For the AI power users, consider defining your own rules and skills with specific overrides and customizations. As this skill asks the model to, for example, write an e2e test you can have your own skill that triggers on that phrasing to enhance what the model is instructed with automatically.

### I'm getting bad/slow results

Think of this skill as just setting up some general guidelines - you may need to focus the prompt a bit by pointing at specific files or calling out things you *don't* want it to do. These should improve as you write more tests and the skill has more material to reference.

Underneath it all, the chosen model will have an outsized impact on speed vs quality behavior. Are you getting fabulous results but it's too slow? Try a lighter, faster model like Claude Haiku or Gemini Flash. Things speedy but not getting great tests? Try a heavier, slower model like Claude Opus or Gemini Pro.

## Development

### Architecture

TestSmith is designed as an orchestrated skill which attempts to do the following:
- Identify the targeted task
- Collect information
- Invoke task

At a future date these *may* get split into different skills or subagents, so we've tried to split the responsibilities here by using a "subskill" convention.

Invocation flow:

```
cypress-testsmith
├── subskills/task.md      (identify task + payload)
├── subskills/explain.md   (when task is EXPLAIN)
├── subskills/author.md   (when task is FIX, CREATE, or UPDATE)
└── subskills/run.md   (when the skill needs to invoke Cypress)
```

Each subskill is then defined to have a ruleset under `/references` in an attempt to maintain a "what you're doing" vs "how you should do it" structure.

### Testing Updates

Remove and reinstall this skill *globally* (remove the `-g` to make it project-specific). To avoid doubt you may want to verify you only have one or the other so you're confident your changes are getting picked up.

`npx skills remove cypress-testsmith -a claude-code -g`
`npx skills add ../cypress-testsmith -a claude-code -g`
