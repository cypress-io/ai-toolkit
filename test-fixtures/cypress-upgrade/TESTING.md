# Testing the `cypress-upgrade` skill

A repeatable procedure for testing the [`cypress-upgrade`](../../skills/cypress-upgrade) skill against the fixtures in this directory. It follows Anthropic's [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), in particular the **Evaluation and iteration** section.

## Source of truth: the evals

The [`evals/`](./evals) directory holds one evaluation per upgrade path, in the best-practices evaluation format (`skills`, `query`, `files`, `expected_behavior`):

- [`evals/v13-upgrade.json`](./evals/v13-upgrade.json)
- [`evals/v14-upgrade.json`](./evals/v14-upgrade.json)
- [`evals/v15-upgrade.json`](./evals/v15-upgrade.json)

Each `expected_behavior` array is the rubric — the observable things a correct run must do. The matching fixture's `README.md` is the human-readable version of the same checklist.

> There is no built-in runner for these evals. Grade them by hand against the run, or wire them into your own harness. The `files` field is the fixture directory; run the skill with that directory as the working project.

## Procedure (per fixture)

1. **Make the skill available** to your agent (see [`skills/README.md`](../../skills/README.md) for install options — `npx skills add ... --skill cypress-upgrade`, or copy `skills/cypress-upgrade/` into `~/.claude/skills/` or `<project>/.claude/skills/`).
2. **Work on a throwaway copy** so edits and any install never touch the repo:
   ```sh
   cp -r test-fixtures/cypress-upgrade/v15-upgrade /tmp/v15-test
   cd /tmp/v15-test
   ```
3. **Run the skill** with the eval's `query`, e.g. `/cypress-upgrade Upgrade this project to Cypress 15.16.0`.
4. **Grade** the run against that eval's `expected_behavior` array: did it pick the right path, flag every precheck item, make exactly the right edits (and no spurious ones), and produce the findings report?
5. **Reset** — `rm -rf /tmp/v15-test` — and repeat for the other fixtures.

## Install and verify phases

These are **detection fixtures, not runnable apps**, so the install (phase 4) and verify (phase 6) phases need care:

- Each fixture's `.nvmrc` is deliberately **outside the target's Node range** (e.g. v15 → Node 18). A correct run should **halt at the install gate and surface the blocker instead of installing** — so a well-behaved run is naturally free of real `install` / `cypress verify` side effects. "Did it stop on the Node blocker?" is itself an `expected_behavior` line.
- For fast iteration on just detection/edits, scope the run: *"run the precheck and apply the breaking-change edits, but do not install packages or run cypress verify."*
- To exercise the install/verify path on purpose, set your copy's `.nvmrc` to a supported version (e.g. `22`) and expect real install/verify activity.

## Iterating on the skill (best-practices loop)

Per the best-practices guide, develop with two roles:

- **Claude A** (author) — the instance you ask to refine `SKILL.md` / the version data.
- **Claude B** (tester) — a fresh instance with the skill loaded, run against a fixture.

Loop: run Claude B on a fixture → observe where it struggles, succeeds, or makes unexpected choices → bring specifics back to Claude A → apply the fix → re-test. While observing, watch how the agent **navigates the skill**:

- Does it read `SKILL.md`, then the target version's `overview.md` and `breaking-changes.md` **in full**, or does it partial-read and miss later sections?
- Does it follow the references, or skip the version data?
- Does it respect the install-blocker gate, or proceed past it?

Turn each new gap into another `expected_behavior` line.

## Coverage checklist (from the best-practices doc)

- [ ] At least three evaluations exist (v13, v14, v15). ✔
- [ ] Tested with Haiku, Sonnet, and Opus — cheaper models surface under-specified instructions first.
- [ ] Tested with real usage (a copied fixture as the working project), not just by reading the skill.
- [ ] Each observed gap fed back into the skill and into an `expected_behavior` line.
