# Skills

Skills are supplements that can be added to your Agent of Choice to trigger additional instructions or context based on certain keywords of workflows.

## Installation

### Tool-based

Take a look at [skills.sh](https://skills.sh/) - there are instructions for using the [skills](https://www.npmjs.com/package/skills) package to automatically install and manage skills.

### Manual
1. Determine your Agent-of-Choice; this could be Cursor, Claude, or many others
2. Decide if you want this skill to be global or scoped to a single project - this will impact where to install the Skill.
3. Based on the above, find your Agent's skills install directory.
  - If you want a global Cursor skill this would be `{USER_HOME}/.cursor/skills`
  - If you want it project-scoped in Claude: `{PROJECT_DIR}/.claude/skills`
4. Copy this directory into that targeted skills directory so you end up with `...skills/{SKILL_NAME}`

### Updates

Skills don't have a robust auto-update capability (yet), so we strongly encourage you to check back from time to time. The `skills` package referenced above includes an update check capability but you need to trigger it yourself - note that this only works for skills added to a *project* (rather than globally) so they are tracked as a project-level dependency.

## How to Use

See each skill's README file for instructions.
