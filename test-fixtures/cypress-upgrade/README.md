# Cypress upgrade — test fixtures

Synthetic mock projects for exercising the [`cypress-upgrade`](../../skills/cypress-upgrade) skill. There is one fixture per upgrade path; each sits on the **prerequisite** major and is deliberately loaded with that version's deprecated/changed patterns so you can run the skill against it and confirm it detects and fixes everything.

| Fixture | Starting point | Upgrades to | Package manager |
|--|--|--|--|
| [`v13-upgrade/`](./v13-upgrade) | Cypress 12 | v13 | npm |
| [`v14-upgrade/`](./v14-upgrade) | Cypress 13 | v14 | yarn |
| [`v15-upgrade/`](./v15-upgrade) | Cypress 14 | v15 | pnpm |

The package managers vary on purpose so the precheck's package-manager detection is tested too.

## How to use

1. Copy a fixture somewhere the agent can treat it as the working project (or open it directly).
2. Invoke the skill toward the matching major, e.g. `/cypress-upgrade upgrade this project to v15`.
3. Check the agent's findings and edits against that fixture's `README.md`, which lists every change it should catch.

See [`TESTING.md`](./TESTING.md) for the full procedure (setup, grading, the install/verify nuance, and the iteration loop), and [`evals/`](./evals) for one machine-readable evaluation per fixture in the [best-practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) `skills`/`query`/`files`/`expected_behavior` format.

## Caveats

- **These are detection fixtures, not runnable apps.** Dependencies are not installed and the version combinations are synthetic (e.g. a project may list both `webpack` and `vite` to exercise multiple detections). Do not `npm install` / run Cypress against them expecting a working suite.
- The lockfiles are minimal stubs — present only so package-manager detection has something to read.
- Environment-only checks (glibc via `ldd --version`, macOS version, the installed Node) depend on the machine you run on, not the fixture. Each fixture sets an `.nvmrc` to a version outside the target's support range so the Node check fires; glibc/macOS are noted in each README but can't be mocked in files.
