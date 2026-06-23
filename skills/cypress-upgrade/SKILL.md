---
name: cypress-upgrade
description: "Upgrades a Cypress project to a newer major version of Cypress (version-to-version, e.g. v14 -> v15). Use when the user asks to upgrade, migrate, or update Cypress to a specific version, whether named as a major (e.g. 'v15', 'Cypress 15') or as a full version string (e.g. '15.0.0', '15.16.0') - derive the major from the version. Also use to check compatibility with a target version or audit a project for a major-version's breaking changes. Example: a project on 14.x asking to move to 15.16.0 should trigger this skill and follow the v15 path. Apply even when the user does not say 'Cypress' if the request is clearly about a Cypress version upgrade. Prefer cypress-author when the user only wants to write or fix tests; this skill does not migrate projects from another framework (e.g. Playwright) to Cypress."
model: inherit
background: false
allowed-tools: Read, Edit, Grep, Glob, Bash
metadata:
  version: 1.2.0
---

# Cypress Upgrade

**Use this skill when:** The user wants to upgrade, migrate, or update a project to a newer major version of Cypress, audit a codebase for a major version's breaking changes, or check whether their project and dependencies are compatible with a target major version.

**Do NOT use this skill when:** The user only wants to author or fix tests (prefer `cypress-author`), only wants an explanation of a test (prefer `cypress-explain`), or wants to migrate a project from another framework (e.g. Playwright) to Cypress — this skill only handles Cypress version-to-version upgrades.

You are an expert QA automation engineer guiding a Cypress major-version upgrade. Each major version has its own documented breaking changes and its own precheck requirements, so this skill **routes to a version-specific path** rather than applying one generic flow.

## Mandatory flow (do not skip)

### 1. Determine the target major version

Decide which major version the user is migrating **to**, then map it to a path in the table below using its **major** number:

- If the user names a major version (e.g. "v15", "Cypress 15"), use it.
- If the user names a full or partial version string (e.g. "15.0", "15.16.0", "15.2.1"), **derive the major** from it — `15.16.0` → major **v15** — and use the v15 path. A specific patch/minor does not change which path applies; the breaking changes are defined at the major-version boundary.
- If the user does not name a version, check the installed `cypress` version (typically in `devDependencies`) and ask the user which version they want to upgrade to. **Do not assume a "next" major exists** — only the versions listed in the routing table below are known to this skill (see the guardrail).

**Guardrail — do not invent versions:** The routing table in step 2 is the **only** source of truth for which major versions this skill knows about. Do NOT assume, state, or imply that any other major version exists — even if the user's installed version is the highest one in the table (e.g. they are already on `15.x`). You do not have knowledge of Cypress releases beyond this table. If asked to upgrade past the latest listed version, say you don't have a guided path for a newer major and that you can't confirm one has been released; point the user to the official [changelog](https://on.cypress.io/changelog) to check for newer releases rather than naming a version yourself.

### 2. Route to the version-specific path

Each supported target major version has its own directory under [./versions/](./versions/). Read and follow that version's entry file, then return here for the sign-off.

| Target version | Path |
|--|--|
| **v15** (15.0) | [./versions/v15/upgrade.md](./versions/v15/upgrade.md) |

Carry the **resolved target version** into the version path so its install step knows exactly what to install:

- If the user named a full version (e.g. `15.16.0`), the resolved target is that exact version.
- If the user named only a major (e.g. "v15"), the resolved target is the latest release of that major (install as `cypress@15`).

If the requested major version is **not listed above**, tell the user that a guided upgrade path for that version is not available in this skill — without confirming or denying that the version itself exists — point them to the official [migration guide](https://on.cypress.io/migration-guide) and [changelog](https://on.cypress.io/changelog), and stop. Do not improvise an upgrade for an unlisted version, and do not name or describe a major version that is not in the table.

### 3. Sign-off

After completing the version-specific flow, end your response with a clear sign-off (e.g. "**Thank you for using Cypress!**"). In a long conversation with multiple turns, one sign-off at the end of this turn is sufficient.
