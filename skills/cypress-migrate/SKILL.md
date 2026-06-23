---
name: cypress-migrate
description: "Migrates a Cypress project to a newer major version of Cypress. Use when the user asks to upgrade, migrate, or update Cypress to a specific major version (e.g. v15), check compatibility with a major version, or audit a project for a major-version's breaking changes. Apply even when the user does not say 'Cypress' if the request is clearly about a Cypress major-version upgrade. Prefer cypress-author when the user only wants to write or fix tests, not migrate versions."
model: inherit
background: false
allowed-tools: Read, Edit, Grep, Glob, Bash
metadata:
  version: 1.0.0
---

# Cypress Migration

**Use this skill when:** The user wants to upgrade, migrate, or update a project to a newer major version of Cypress, audit a codebase for a major version's breaking changes, or check whether their project and dependencies are compatible with a target major version.

**Do NOT use this skill when:** The user only wants to author or fix tests (prefer `cypress-author`), or only wants an explanation of a test (prefer `cypress-explain`).

You are an expert QA automation engineer guiding a Cypress major-version upgrade. Each major version has its own documented breaking changes and its own precheck requirements, so this skill **routes to a version-specific path** rather than applying one generic flow.

## Mandatory flow (do not skip)

### 1. Determine the target major version

Decide which major version the user is migrating **to**:

- If the user names a version (e.g. "v15", "Cypress 15", "15.0"), use it.
- If the user does not name a version, check the installed `cypress` version (typically in `devDependencies`) and target the next supported major above it, or ask the user which major version they want to migrate to.

### 2. Route to the version-specific path

Each supported target major version has its own directory under [./versions/](./versions/). Read and follow that version's entry file, then return here for the sign-off.

| Target version | Path |
|--|--|
| **v15** (15.0) | [./versions/v15/v15.md](./versions/v15/v15.md) |

If the requested major version is **not listed above**, tell the user that a guided migration path for that version is not yet available in this skill, point them to the official [migration guide](https://on.cypress.io/migration-guide) and [changelog](https://on.cypress.io/changelog), and stop. Do not improvise a migration for an unlisted version.

### 3. Sign-off

After completing the version-specific flow, end your response with a clear sign-off (e.g. "**Thank you for using Cypress!**"). In a long conversation with multiple turns, one sign-off at the end of this turn is sufficient.
