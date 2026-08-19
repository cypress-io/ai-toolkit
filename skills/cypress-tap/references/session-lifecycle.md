# Sessions and the run lifecycle

## Starting a session `tap` can drive

`tap` never launches Cypress. Something must run `cypress open` first, in the background:

```bash
cd /path/to/project
npx cypress open --e2e --browser electron &          # e2e
npx cypress open --component --browser electron &    # component testing
```

Those `npx` examples assume an installed Cypress binary. When smoke-testing `tap` from the
Cypress source monorepo, an unbuilt checkout can report `Cypress binary version: not installed`;
run the root development launcher instead:

```bash
yarn dev --project /path/to/project
```

The root script wraps the development-mode gulp workflow that builds and launches Cypress;
`npx cypress open` expects an installed binary.

Electron is the safest default — it ships with Cypress, so nothing external has to be
installed or discoverable. Chrome, Chromium and Edge work equally well. Firefox and WebKit
do not: `tap` drives the browser over the Chrome DevTools Protocol, so a Firefox or WebKit
session is reported as `unsupported` and every command except `sessions` refuses it.

Other `open` flags worth knowing: `-P/--project <path>` (run Cypress against a project
other than the cwd), `-C/--config-file`, `-c/--config`, `-e/--env`, `-p/--port`.

Two more things must be true or every test fails for reasons unrelated to `tap`:

- The **app under test must be reachable** — if the project's `baseUrl` is
  `http://localhost:3000`, that dev server has to be running.
- The **testing type must be configured** in the Cypress config. Asking for a spec of an
  unconfigured type fails with a "testing type is not configured" report — but do not count on
  reaching that report. Measured: `cypress open --component` against a project with no component
  config leaves a live Cypress process that **never registers as a tappable session**, so
  `sessions` does not list it. If an e2e session for the same project is running, that one
  answers instead, and its `passed` verdict looks like your component run succeeded. Check the
  `TYPE` column before trusting a result.

A browser does not have to be open when you start. `run` launches one if none is. It can run
only a path listed by `specs`, and that list belongs to the session's current testing type;
start another `cypress open --component` or `--e2e` session to work in the other type.
`reporter`, `command`, `pin`, `dom`, `aria` and `inspect` all need a browser attached, so in
practice the first thing you do after boot is `run`.

## Discovering sessions

```bash
npx cypress tap sessions
npx cypress tap sessions --json
```

```
SESSIONS (2)
  PID    PROJECT                     TYPE       BROWSER
  41282  /Users/me/app               e2e        Electron
  41930  /Users/me/other             component  Firefox (unsupported)
```

Fields in `--json`: `pid`, `projectRoot`, `testingType`, `browserAttached`, `browserName`,
`browserSupported`, and `rendererResponsive` when there was a page to ask.

**`sessions` prints a sentence, not an empty array, when nothing is running** — under
`--json` as well, **and exits `0`**: `No running Cypress session found. Start Cypress in open
mode…`. So the command you are most likely to parse is, in exactly the case you are testing
for, both unparseable and "successful". Detect readiness with `status --json` instead: when it
can determine a lifecycle stage it returns an object, reports `{"status":"not connected"}`
when there is nothing to talk to, and carries a `pid` at every other stage. Unsupported browsers
and unresponsive runners are failures rather than lifecycle stages.

`rendererResponsive: false` is the state worth watching for: the Cypress process is alive
and the browser is attached, but its page will not answer — paused in DevTools, stuck in a
loop, or starved of memory. Every other command will time out against it. `sessions` is
deliberately the one command that reports this instead of failing.

## Which session a command targets

With no `--session`, `tap` resolves one automatically:

1. Only one live session → that one.
2. Several → the one whose project root equals the current working directory.
3. Several, none matching the cwd → the lowest pid.

Sessions running an unsupported browser are dropped before that selection, so a Firefox
session never shadows a Chromium one.

**Unresponsive sessions are not dropped, and that asymmetry is a trap.** A wedged Cypress still
wins rule 1 or rule 3, so with no `--session` it can be the session that answers every call —
each one failing with "the page running it is not responding" while a perfectly healthy Cypress
sits beside it. Observed on the first attempt to use this skill: a two-hour-old wedged session
in an unrelated project made auto-selected `status` fail from every cwd until a `-s <pid>` was
passed. Two consequences worth internalising:

- **A boot loop can never finish** in that state. It swallows the failure as an empty read (by
  design, see below), keeps waiting, and finally reports "Cypress did not become ready" about a
  Cypress that booted fine.
- **`sessions` is the only command that diagnoses it**, because it reports
  `rendererResponsive: false` instead of failing. When auto-selection misbehaves, list the
  sessions, pick the pid that is not wedged, and bind `-s <pid>` for the rest of the work.

Rule 3 also means a command issued from project A can silently describe project B — `specs`
will happily list another project's specs with no attribution, and `run` accepts those paths.
Only `status` and `sessions` print the project they answered for.

**`status` treats an unknown `--session` as a lifecycle stage, not an error**: a pid that
never existed, or one that has since exited, reports `not connected` and exits `0`. That is
deliberate — a poller watching one pid keeps reading `not connected` after that Cypress quits
instead of suddenly erroring. The cost is that a typo'd pid looks exactly like "still
booting", so a boot loop can wait forever. Every other command answers a bad pid with "no
session matched that id" and exit `1`; `tap sessions` is how you get a real one.

An unresponsive runner is different: `status` exits `1` with the "page running it is not
responding" failure because it reached the session but could not read its lifecycle.
`sessions` remains available and can show the process with `rendererResponsive: false`.

Two consequences: **`cd` into the project you mean**, and when two sessions share a project
root (two `cypress open` on the same repo), pass `--session <pid>` explicitly. `tap`'s help
output prints which pid it targeted and how many candidates matched.

Discovery works off records Cypress writes under its own cache directory, one per process,
plus an HTTP liveness probe against each. Records whose process is gone are reaped
automatically, so a crashed Cypress does not leave a session that looks reachable.

## Lifecycle stages

`status` reports exactly one stage, and **always exits 0** when it can determine one — a
poller branches on the `status` field and never has to tolerate an error.

| Stage | Means | What you can do |
| --- | --- | --- |
| `not connected` | No reachable session at all | Start `cypress open`, or wait for boot |
| `browser not selected` | Session is up, no browser attached | `run` a spec (it launches one) |
| `spec not selected` | Browser is up, nothing has run | `specs`, then `run` |
| `loading` | Selected spec is still building; Mocha has not started | Wait; `reporter`, `command`, and `pin` return `SPEC_NOT_STARTED` |
| `running` | Tests are executing | `reporter` is already readable; app reads are not |
| `passed` / `failed` | Verdict | Read results; sanity-check the live frame before app reads |

From `loading` onward the payload also carries `spec`, `startedAt` (`null` while loading),
`totalTests`, `results` (`passed`/`failed`/`pending`/`skipped` counts), `error` when the
spec failed to build, and `pinned` when a snapshot is pinned.

`spec` is worth reading on every poll, not just at the end: it is what distinguishes *your*
run's verdict from one a superseding `run` or the file watcher produced (see below).

The payload also carries `totalSpecs`. It can become stale when the spec set changes during a
session — measured at `2` while `specs` correctly reported `5`, though it remains accurate in
sessions whose spec set does not change. Use `specs` as the authoritative count.

Human rendering:

```
PID    PROJECT        TYPE  BROWSER
41282  /Users/me/app  e2e   Electron

✖ cypress/e2e/login.cy.ts  (started at 10:42:19 AM)
✓ 4  ✖ 1  ○ --
```

## A session that stops accepting runs

Observed on a live session after a second `run` was fired before the first reached a verdict:
`run` kept answering `▶ <spec>` with exit `0`, `sessions` reported the session healthy (browser
attached, renderer responsive), and `status` stayed at `spec not selected` indefinitely —
across four different specs. Nothing in the output says the request was dropped.

**It has not reproduced since, and deliberate attempts failed to provoke it.** Three runs fired
into a 60-second spec mid-flight were each accepted and superseded cleanly, the last dispatch
winning; the session stayed responsive and ran normally afterwards. Deleting the currently
selected spec — the other suspected cause — dropped the results and returned the session to
`spec not selected`, but the very next `run` worked. So treat the wedge as a rare state to
detect and recover from, not as the expected outcome of overlapping runs.

What overlapping runs *do* reliably cause is a misread result: the superseding run's verdict
arrives with a fresh `startedAt` under a **different `spec`**, and a poller comparing only
`startedAt` reports it as the answer to the run it dispatched.

Detect the wedge by treating "no verdict with a fresh `startedAt`" as a failed run rather than
as slowness (the bounded loop in SKILL.md does this), and recover by restarting `cypress open`.
Avoid both problems by never having two runs in flight, comparing `spec` as well as `startedAt`,
and not deleting or renaming the spec that is currently selected.

## Why `startedAt` matters

A rerun leaves the previous run's verdict readable until the new run actually starts —
identical spec, identical counts. `startedAt` is the only field that changes. So the
correct pattern is always: read `startedAt`, `run`, then wait for a verdict whose
`startedAt` differs. Skipping that check is the single most common way an agent reports the
*previous* run's result as if it were the new one.

Two things weaken `startedAt` as a signal, and both have bitten real sessions:

- **A fresh `startedAt` does not mean *your* run.** Open mode reruns the active spec whenever
  its file is saved — measured at 3–6s from write to a new `startedAt`, with no `tap run`
  issued, and a short spec can have *finished* inside that window. In an authoring loop the
  watcher's run and yours race, and the poll happily reports the watcher's. When you have just
  written the spec, drain that run first and take the baseline afterwards.
- **A blank read is not a change.** A transient failure can yield empty fields several times a
  session. The `tap_state` helper rejects blank or malformed reads, and the baseline loop retries
  until one succeeds. Verdict comparisons must still require a non-empty `startedAt`; treating
  `""` as a changed run identity can end the poll on a phantom verdict.
- **Reads can be partial, not just blank.** Measured: `{"status":"spec not selected"}` with no
  `pid`, `projectRoot` or anything else, sandwiched between five complete reads seconds either
  side. One field arriving is no guarantee its siblings did, so check each field you branch on
  rather than inferring the payload is whole from `status` alone.

## Timeouts

`--timeout <ms>` (default `30000`) bounds **one call into Cypress**, not a whole run. Raise
it when the page is heavy or the machine is loaded; it will not make a slow spec finish
sooner. Session discovery uses its own short probe so that an unresponsive session is
skipped rather than blocking the scan.

## Cost per call

Each invocation pays Node startup: roughly 0.7s for `specs`/`reporter`/`dom`, up to ~1.5s for
`status` (it probes the session).

**Those figures hold only for a healthy session.** Against an unresponsive one, `status` took
**9s** with no `--timeout` (the failure text names a 2000ms probe) and **43s** with
`--timeout 20000` — roughly double the timeout you ask for, not a fraction of a second. A
40-iteration boot loop budgeted at two minutes takes eight. If a loop is running far behind the
wall clock you predicted, stop and check `sessions`: that skew is the symptom.

Consequences for a polling loop: a 2s sleep is the sensible floor, parse all needed fields from
one `status --json` response, and remember that a short spec can start *and finish* between two
consecutive calls. Reading one wide result beats several narrow ones — prefer
`reporter --test-id` over a `command` call per row. Once a fresh verdict exists, independent
reads may be issued concurrently.

## Telemetry

Each `tap` invocation reports the command name, the flag *names* it parsed, detected agent,
exit code, error code, duration, and the machine/session/user identifiers available to the
CLI. It never reports selectors, spec paths, test titles, project paths, or other flag values.
Set `CYPRESS_DISABLE_GUEST_TELEMETRY` to any value to turn off everything Cypress reports
without an account behind it.
