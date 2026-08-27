---
name: cypress-cloud-cli
description: Runs the cy-cloud CLI to inspect Cypress Cloud organizations, projects, runs, specs, tests, failure screenshots, and Test Replay data. Use when the user mentions Cypress Cloud, cy-cloud, cypress-cloud-cli, a Cloud run or test URL, failing or flaky Cypress tests, Test Replay, run triage, Cloud artifacts, or asks why a recorded test failed.
metadata:
  version: 1.0.0
---

# Cypress Cloud CLI

Use `cy-cloud` directly to investigate Cypress Cloud. Execute the commands, inspect their JSON, and
report conclusions supported by the returned data. Do not send the user to the Cloud UI when the CLI
can answer the question.

## Start safely

The published binary requires Node.js 22.21.0 or newer.

Run these checks only on first use, when the environment is unknown, or after an installation or
authentication error. If `cy-cloud` already worked in this session, invoke the investigation command
directly instead of spending another turn rechecking the setup.

```bash
node --version
cy-cloud status
cy-cloud --help
```

Assume `cy-cloud` is already installed and available on `PATH`. Run it from the user's current
workspace; do not locate, clone, build, or depend on the cloud-cli source repository. If the command
is unavailable, stop and report the missing prerequisite. The user can install it with:

```bash
npm install -g @cypress/cloud
```

If unauthenticated, ask the user to choose an authentication method:

```bash
cy-cloud login                 # interactive OAuth
cy-cloud login --token "$PAT"  # persist a Personal Access Token
```

For CI or an existing environment, `CYPRESS_CLOUD_TOKEN` takes precedence over stored credentials
and writes no credential file.

Never print, echo, read back, or commit tokens. Never inspect
`~/.config/cy-cloud/auth.json` or `cypress.env.json`; use `cy-cloud status`.

The organization must have the Cypress Cloud CLI integration enabled. A response saying it is not
enabled requires action from an organization administrator; it cannot be fixed with another CLI command.

## Discover instead of guessing

Every command supports:

```bash
cy-cloud <command> --help
cy-cloud <command> --schema
```

Treat `--help` as authoritative for arguments and `--schema` as the intended response contract. Use
them before constructing a query when a flag or field is uncertain. Validate the actual response
too: `run get` can return a fractional `duration`, and `replay info.failedAt` can be a fractional
epoch even when the schema declares an integer. Treat those values as numbers and report the schema
mismatch if it matters; do not discard or round the data.

Successful data commands write JSON to stdout. Pipe them to `jq`. Replay download progress is
written to stderr, so never combine stderr with stdout before parsing JSON:

```bash
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> 2>/dev/null | jq
```

If a command fails, rerun without suppressing stderr. Argument-validation errors can appear on
stdout; command execution errors appear on stderr. Both exit with status 1.

When running from Cursor, Cloud-backed fetches may be blocked by the command sandbox even when local
commands such as `status` succeed. Run Cloud data commands with unrestricted network permission. If
a fetch fails with a sandbox or network denial, retry that same command with unrestricted network
before diagnosing a CLI, authentication, or Cloud problem.

## Command map

```text
version
status
login [--token PAT] [--timeout SECONDS]
logout

org list
project list [--orgId UUID,...] [--page N] [--limit N]
project get --projectId PROJECT_ID
run list --projectId PROJECT_ID [--status STATUS,...] [--branch NAME,...] [--page N] [--limit N]
run get --projectId PROJECT_ID --runNumber N
spec list (--projectId PROJECT_ID --runNumber N | --specId UUID,...) [--status STATUS,...]
spec get --specId UUID
test list (--projectId PROJECT_ID --runNumber N | --specId UUID,... | --testId UUID,...)
          [--status STATUS,...] [--page N] [--limit N]
test get (--testId UUID | --testResultUrl URL) [--screenshot [DIRECTORY]]
replay info (--testId UUID | --testResultUrl URL) [--attempt N]
replay timeline (--testId UUID | --testResultUrl URL) [--attempt N] [filters]
cache info
cache cleanup
cache clear
```

For `projectId`, use the project identifier already present in a Cloud URL; both the short slug and
the project UUID are accepted by project/run lookups and run-scoped spec/test lists. Do not perform
organization and project discovery merely to replace a UUID with a slug. `runNumber` is the
per-project run number. `specId` and `testId` are UUIDs. Attempt numbers are 1-indexed, matching
Cypress Cloud.

Cloud list responses have `.pagination`; request more pages when the question is not limited to the
first page. `replay timeline` is different: it accepts `--page` and `--limit` but returns only
`.events`, with no pagination metadata. For an unfiltered `--all` query, compare returned event
counts across pages with `replay info` totals (`commandEvents + networkEvents + logs`). Continue
while a page returns the requested limit or the accumulated count is below that total.

## Standard investigation

Start broad only when the user did not provide a Cloud URL or test ID. A copied test overview URL
can already contain the project identifier, run number, and test ID, including when it has a query
string, so try it directly before discovery.

```bash
# Discover a project
cy-cloud org list | jq '.organizations[] | {uuid, name}'
cy-cloud project list --orgId <orgUuid> | jq '.projects[] | {projectId, name}'

# Find recent failing runs
cy-cloud run list --projectId <projectId> --status failed --limit 5 \
  | jq '.runs[] | {runNumber, status, branch, createdAt}'

# Find failed specs and tests
cy-cloud spec list --projectId <projectId> --runNumber <runNumber> --status failed \
  | jq '.specs[] | {id, path, status}'
cy-cloud test list --projectId <projectId> --runNumber <runNumber> --status failed \
  | jq '.tests[] | {projectId, testId, specFilepath, testName, status, attempts}'
```

When the user supplies a Cloud test overview or test-results URL, skip discovery:

```bash
cy-cloud test get --testResultUrl "<url>" \
  | jq '{projectId, runNumber, specFilepath, testName, status, attempt, attempts,
         failureScreenshotPath, failureScreenshotReason}'

# Choose the failed attemptNumber from attempts[]; never rely on the final/default attempt for a flake.
cy-cloud replay info --testResultUrl "<url>" --attempt <failedAttemptNumber> 2>/dev/null
cy-cloud replay timeline --testResultUrl "<url>" --attempt <failedAttemptNumber> 2>/dev/null
```

Accepted paths include `/runs/<run>/overview/<testId>` and
`/runs/<run>/test-results/<testId>`, with optional trailing paths and query strings. Pass
`--testId` or `--testResultUrl`, never both.

## Inspect the failure

Get the test details first:

```bash
cy-cloud test get --testId <uuid> \
  | jq '{projectId, runNumber, specFilepath, testName, status, attempt, attempts,
         failureScreenshotPath, failureScreenshotReason}'
```

`attempts[]` provides `attemptNumber`, `errorName`, `errorMessage`, and `stackTrace`. Select the
failed `attemptNumber` explicitly for every replay query. `test get` can report the final passing
retry in `attempt`, so its default attempt is unsafe for flaky-test diagnosis.

Only request a screenshot when `test get` identifies a failed selected result for which a failure
screenshot can exist:

```bash
cy-cloud test get --testId <uuid> --screenshot ./artifacts \
  | jq '{status, attempt, attempts, failureScreenshotPath, failureScreenshotReason}'
```

Read `failureScreenshotPath` only when the response actually returns a path. `test get` has no
attempt selector, so a flaky test may select its final passing retry even though `attempts[]`
contains an earlier failure. In that case, `--screenshot` returns
`failureScreenshotReason: "test passed"` and cannot retrieve the failed-attempt screenshot; continue
with the failed attempt's replay and source inspection instead of treating the absent file as
missing evidence. Record this as an evidence gap in the conclusion: the CLI currently has no
workaround for fetching that earlier attempt's screenshot, and its contents must not be inferred.

There is no explicit flake status, `--status flaky` filter, or `flakyCount` field. Flake can only be
inferred from `attempts[]`, so interpret retries carefully:

- A final pass after an earlier failed attempt is evidence of flake.
- Repeated failed attempts indicate a reproducible failure.
- A single failed attempt does not prove the test is non-flaky; retries may be disabled.

Cloud UI URLs can include filters such as `isFlaky=true`, but that query parameter is a UI filter,
not a flake field exposed by the CLI. Reconstruct the UI's classification from `attempts[]`: find an
earlier failed attempt followed by a passing retry.

## Use Test Replay

Check whether replay resolution succeeds and inspect the selected attempt:

```bash
cy-cloud replay info --testId <uuid> --attempt <failedAttemptNumber> 2>/dev/null
```

`replay info` has no availability boolean. A successful response means replay data resolved; an
error means it is unavailable or inaccessible.

With no filters, `replay timeline` returns the 25 commands leading to the failure, the failed
command, and XHR/Fetch network events. Start with this default:

```bash
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> 2>/dev/null \
  | jq '.events[] | {category, name, message, state, method, url, response}'
```

Then narrow or widen only as needed:

```bash
# Failed command
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> --failedOnly 2>/dev/null

# More commands around failure
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> \
  --aroundFailure 100 2>/dev/null

# Network diagnosis
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> --network All 2>/dev/null \
  | jq '.events[] | select(.category == "network") | {method, url, status: .response.status}'

# Application console output
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> --logs 2>/dev/null \
  | jq '.events[]
        | select(.category == "log" and .payload)
        | (.payload | fromjson?)
        | select(.)
        | {type, msg: [.args[]? | .value // .description]}'

# Full timeline; page because this can be large
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> \
  --all --limit 200 --page 1 2>/dev/null

# Compare a passing retry without pulling task and code-coverage payloads
cy-cloud replay timeline --testId <uuid> --attempt <passingAttemptNumber> \
  --commands --limit 100 --page 1 2>/dev/null \
  | jq '.events[] | {name, message, state}'
```

Any explicit filter disables the default failure context. For example, `--logs` returns only logs.
To add logs while retaining useful failure context, specify every desired category:

```bash
cy-cloud replay timeline --testId <uuid> --attempt <failedAttemptNumber> \
  --commands --aroundFailure 25 --network XHR,Fetch --logs 2>/dev/null
```

Timeline events share an ordered `.events[]` array and use `category` values `command`, `network`,
and `log`. Preserve array order when correlating events: command events may not expose a usable
timestamp field. Use timestamps when an event provides one and compare timestamp-bearing logs and
network events with `replay info.failedAt`; otherwise use array position relative to the failed
command. Ignore events after the failure unless the question specifically concerns teardown or
post-failure behavior. Dev-server messages emitted after `failedAt`, such as
`Invalid Host/Origin header`, are not evidence for the assertion failure.

The default network filter can silently return zero events for applications whose traffic is
recorded under resource types other than XHR or Fetch. If the default timeline has no network
events, rerun with `--network All` before concluding there was no network activity for an end-to-end
spec. For a unit or component-testing spec, first inspect `replay info.networkEvents` and the test
setup. If `networkEvents` is `0` and dependencies are mocked or the component is not exercising an
application backend, skip `--network All`; it adds noise without new evidence.

Network events do not include a `resourceType` field in their output. `--network` can filter by
resource type, but the returned events cannot identify that type. If the type distribution matters,
query the relevant types separately and compare each result's `.events | length`.

The first replay request downloads and caches a SQLite database, often for an entire spec. Later
queries for that spec are local and faster.

## Diagnose, do not merely restate

Use this evidence order:

1. Test details and all attempts.
2. Select the failed attempt and pass its `attemptNumber` via `--attempt` to every replay query.
3. Failure screenshot, only when a path exists for a failed selected result.
4. Default replay failure context for that failed attempt.
5. For end-to-end specs, if the default has no network events, rerun with `--network All`; skip this
   for mocked unit/component specs whose `replay info.networkEvents` is `0`.
6. Network failures, missing requests, or incomplete responses before the failed command.
7. Application console errors at or before `failedAt`, parsing the JSON string in `payload`.
8. A passing attempt or passing run for comparison when the cause remains ambiguous. Start with
   `--commands`; do not use `--all` for the initial comparison because task events can contain very
   large code-coverage payloads.
9. If replay establishes only the assertion symptom, use the stack trace to read the spec and
   relevant source. Inspect the immediately preceding and following tests plus their hooks,
   especially when tests pass alone but fail in sequence. Check module-level state, globals,
   aliases, mocks, and fixtures that an adjacent test mutates and `beforeEach` does not reset. Cloud
   artifacts can reveal the symptom without revealing why the state already had that value.

For "element never appeared" failures, check in order:

1. A preceding 4xx or 5xx response.
2. A request that never completed.
3. An expected request that never started.
4. A console exception.
5. Selector, timing, or rendering behavior visible in the screenshot and command timeline.

Report:

- the project/run/spec/test that was inspected;
- the failing attempt and Cypress command;
- the visible symptom and assertion;
- the most likely root cause, with timeline/network/log evidence;
- whether retry history suggests flake, or `unknown` when attempts are insufficient;
- uncertainty and the next discriminating check when evidence is incomplete.

## Cache and common recovery

```bash
cy-cloud cache info
cy-cloud cache cleanup
cy-cloud cache clear
```

Use `cache cleanup` for normal maintenance. Use `cache clear` only when replay resolution appears
stale or corrupted because it forces future replay downloads.

Common outcomes:

- `Replay not available`: use test details and the screenshot when one exists; no replay can be
  fetched.
- `No matching records found for testId and attempt`: verify the 1-indexed attempt with
  `replay info`.
- Empty replay events: rerun with no filters, then `--commands`; use paged `--all` only when the
  investigation needs every category because task events can contain large payloads.
- Missing expected fields: inspect that command's `--schema`.
- `jq` parse failure: ensure stderr was not merged into stdout.
- `cy-cloud version` reporting `"status": "Unknown"` does not by itself mean the installation is
  broken or outdated. Compare `version` and `latestVersion`; upgrade only when those values or an
  explicit compatibility error indicate it.
