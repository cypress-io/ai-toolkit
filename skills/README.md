# Skills

Skills are supplements that can be added to your Agent of Choice to trigger additional instructions or context based on certain keywords of workflows.

There's a huge body of knowledge out there for Cypress which is incredible for LLM's to train and learn on. Unfortunately it's not always the latest (and sometimes not the greatest 😬), especially as Cypress continually releases new features and improvements. This skill attempts to steer your Cypress-related interactions with guidelines, hints, and enhancements to deliver higher-quality, more performant, and more maintainable artifacts.

## Installation

### Tool-based

Take a look at [skills.sh](https://skills.sh/) - there are instructions for using the [skills](https://www.npmjs.com/package/skills) package to automatically install and manage skills.

For example, `npx skills add https://github.com/cypress-io/ai-toolkit/blob/main/skills/cypress-author -g`

### Manual
1. Determine your Agent-of-Choice; this could be Cursor, Claude, or many others
2. Decide if you want this skill to be global or scoped to a single project - this will impact where to install the Skill.
3. Based on the above, find your Agent's skills install directory.
  - If you want a global Cursor skill this would be `{USER_HOME}/.cursor/skills`
  - If you want it project-scoped in Claude: `{PROJECT_DIR}/.claude/skills`
4. Copy corresponding skill directory into that install directory so you end up with `..../skills/{SKILL_NAME}`

### Updates

Skills don't have a robust auto-update capability (yet), so we strongly encourage you to check back from time to time. The `skills` package referenced above includes an update check capability but you need to trigger it yourself - note that this only works for skills added to a *project* (rather than globally) so they are tracked as a project-level dependency.

## Use

Once installed, skills are triggered by the agent+model comparing your keywords and intents with subjects the skill claims to understand. You may need to rephrase or add specificity to your prompts to get it to trigger in your environment. Each skill (below) documents the sort of keywords and language it listens for. Most agents also support a "slash command" to directly trigger a skill (e.g `/cypress-author ...`).

## Skills

### [`cypress-author`](./cypress-author)

This skill attempts to listen for prompts related to creating, updating, or fixing tests and injects content and instructions to improve the process of authoring Cypress tests. It attempts to fill in the gaps using standard best-practice hints and referring to existing content when possible, but you can refine or override any behaviors just like you would with any prompt.

#### Prompt examples

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

### [`cypress-explain`](./cypress-explain)

An agent skill that helps you describe, understand, and critique existing Cypress tests so you can spot gaps, problems, and ways to make them stronger.

This skill is built for teams who already have Cypress specs or are just getting started and want clearer narratives of what each test does, how it relates to the app under test, and where the suite might be thin, brittle, or out of date. Use it to walk through flows step by step, translate commands and patterns into plain language, and surface missing coverage, flaky or over-coupled selectors, weak assertions, and practical enhancements—from small refactors to broader test-design improvements—without replacing your authoring workflow.

#### Prompt examples

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

Each agent is different, but usually you can look in the conversation history to ensure your agent is invoking the skill based on your prompt - the agent will typically print out that fact.

### Why isn't the skill triggering?

1. Verify it's installed and configured in the appropriate context. Skills can be user or project specific and the setup depends on your Agent of Choice.
2. Skills attempt to listen for keywords and concepts, but depending on your agent, model, and other skills it may not be triggered. You can improve your odds by using the word "Cypress".
3. Most agents allow you to verify a skill is installed and/or force a skill to be used by using a slash command (above).

### The skill is inflating my token use - why?

Skills adds some good general purpose guidelines that may or may not help, depending on your use case. Try the following:

1. Skills sometimes point the agent to "foundational" files like your package.json or Cypress config - these may be very large for your project or point to very large resources. You can help by suggesting the skill do "minimal exploration" or "don't worry about matching/reusing existing content", or do the work yourself and point the skill where it needs to look ("use my_spec.cy.js as a pattern")
2. Review your `AGENTS.md`, `CLAUDE.md`, etc agentic files - these often refer agents to files that are certainly *helpful* but can be bloated or of limited value. Consider adding instructions to refine how agents use those files (only use for XYZ, search by component name inside this file, etc). 

### I don't like what the skill is doing - what can I do?

**Is it something general-purpose or otherwise would apply to others? Consider contributing to this skill!**

You can supply as much or as little context as you want when triggering skills. Add steps, instructions, patterns, and anti-patterns to help inform the model and it will be mixed in with the instructions the skill supplies.

Skills will generally also be able to lean on any existing Cypress configuration and tests, so generally you'll get better results as your test suite grows.

For the AI power users, consider defining your own rules and skills with specific overrides and customizations. As this skill asks the model to, for example, write an e2e test you can have your own skill that triggers on that phrasing to enhance what the model is instructed with automatically.

### I'm getting bad/slow results

Think of this skill as just setting up some general guidelines - you may need to focus the prompt a bit by pointing at specific files or calling out things you *don't* want it to do. These should improve as you write more tests and the skill has more material to reference.

Underneath it all, the chosen model will have an outsized impact on speed vs quality behavior. Are you getting fabulous results but it's too slow? Try a lighter, faster model like Claude Haiku or Gemini Flash. Things speedy but not getting great tests? Try a heavier, slower model like Claude Opus or Gemini Pro.

## Development

Remove and reinstall this skill *globally* (remove the `-g` to make it project-specific). To avoid doubt you may want to verify you only have one or the other so you're confident your changes are getting picked up.

`npx skills remove cypress-author -a claude-code -g`
`npx skills add ../cypress-author -a claude-code -g`
