# Troubleshooting

`tap` reports failures as prose on stderr and exits `1`. The output states the condition, the
specifics, then what to do — there are no error codes to match on, so **branch on the exit
code** and read the text.

## Cannot find or reach a session

| Reported | Why | Do |
| --- | --- | --- |
| Could not find a Cypress session to tap into. | No session record at all | Start `cypress open`; if you just did, it is still booting — poll `status` |
| No Cypress session matched the provided session id. | `--session <pid>` named nothing | `tap sessions` for the live pids. **`status` is the exception** — it reports `not connected` and exits `0` for an unknown pid, so a poller never learns the pid was wrong |
| Could not reach the Cypress session. | Records exist but nothing answers, or the connection dropped mid-command | Confirm Cypress is still open with a browser; rerun |
| The Cypress session is running, but no test browser is open. | Session up, no browser attached | `tap run <spec>` (it launches one), or launch one in the app |
| The Cypress session is running an unsupported browser. | Firefox or WebKit | Reopen with `--browser electron` / `chrome` / `edge` |
| The Cypress session is reachable, but the page running it is not responding. | Renderer wedged: paused in DevTools, infinite loop, out of memory. **Or you did not mean this session at all** — auto-selection does not skip wedged sessions | `tap sessions`, then `-s <pid>` for one that is responsive; restart the wedged Cypress. Raising `--timeout` only helps a *slow* page — see below |

`tap sessions` is the diagnostic of last resort: it never fails, and it reports browser
attachment and renderer health per session instead of erroring.

`status` deliberately collapses no session, an unknown pid, and a stale session record into
`not connected` with exit `0`. An unresponsive runner instead makes `status` exit `1` with the
"page running it is not responding" failure; `sessions` can confirm
`rendererResponsive: false`.

**A wedged session you have never heard of can break every command.** With no `--session`,
selection prefers the cwd's project and otherwise takes the lowest pid — and unlike an
unsupported browser, an unresponsive session is *not* filtered out first. So a stale Cypress
left running in an unrelated project can answer, and every call fails against it while a healthy
session sits beside it. This is the first thing to rule out when `tap` "stops working" for no
reason: `tap sessions`, then bind `-s <pid>` to the pid that is responsive.

**Raising `--timeout` does not un-wedge a renderer; it just costs more.** Measured against a
genuinely wedged session: the default `status` failed after **9s** (its message names a 2000ms
probe), and `--timeout 20000` failed after **43s** — about twice the value you pass. Raise
`--timeout` for a *heavy but live* page; restart Cypress for a wedged one.

## Version mismatch

| Reported | Do |
| --- | --- |
| The targeted Cypress session is newer than this CLI. | Update the CLI: `npm install --save-dev cypress@latest` |
| The targeted Cypress session is older than this CLI. | Update Cypress in the running project, restart it |

Both name the two versions involved. They happen when a globally-installed `cypress` binary
taps a project pinned to a different version. Running `npx cypress tap` from inside the project
is the simplest way to keep both halves compatible — but it is not a requirement, and it fails
outright when the project's Cypress predates `tap`:

| Reported | Why | Do |
| --- | --- | --- |
| `Unknown command "tap"` plus the `cypress` usage text | Not a tap failure — `npx` resolved a Cypress older than 15.21, usually the target project's pinned copy | Run `tap` from a checkout whose Cypress has it and pass `-s <pid>`. `tap` is a client and needs only to be version-compatible with the session, not installed in the project it inspects |

That message is easy to misread inside a script: the wrapper reports the step as failed, so a
loop looks like it could not start a run when the real problem is which binary answered.

**It is worse than that, and this is the single most common way to lose time with `tap`.**
Commander prints the usage text to **stdout**, so the idiomatic dispatch check

```bash
npx cypress tap run "$SPEC" >/dev/null || { echo "dispatch failed"; exit 2; }
```

throws away the only evidence and leaves a bare `dispatch failed` with no cause. Because cwd
selects the binary on *every* call, this reappears the moment any `cd` runs earlier in a
compound command or inside the script — the first ten invocations work and the eleventh does
not. Two habits remove it for good:

- Pin the binary in a bash/zsh function that forwards `"$@"`, or `cd` to that checkout as the
  first line of the script, instead of relying on ambient cwd:

  ```bash
  tap_cli () {
    npx --prefix "/tap-capable/checkout" cypress tap -s 73952 "$@"
  }
  ```
- When a dispatch fails, print stdout before deciding what went wrong. `Unknown command "tap"`
  and a real dispatch failure are indistinguishable once stdout is gone.

Confirm which binary is answering at any time with `npx cypress tap --help`: it needs no
session, and it fails the same way when cwd is wrong.

## Spec and run problems

| Reported | Why | Do |
| --- | --- | --- |
| No spec has run yet. | Read a result before running anything | `tap run <spec>`, wait for a verdict |
| The spec has not started yet. | Spec is still `loading`; Mocha has not started | Keep polling; the run-level loop owns the timeout |
| The spec … is currently running. | App read attempted mid-run | Poll `status` until `passed`/`failed` |
| The Cypress session has no spec matching that path. | Path is not in the specs list | `tap specs` for the exact path; if the file exists but is unlisted, widen `specPattern` |
| The Cypress session could not start the spec. | The `runSpec` request failed | `tap status`, then retry |
| That testing type is not configured for this project. | Spec belongs to a type the config does not define | Configure it, or open Cypress in a type the project supports. Note the session may never appear at all — see below |
| The Cypress session has no project open. | Session sitting with no project | Open a project in Cypress |

**A session for an unconfigured testing type never registers** — `cypress open --component`
against a project with no `component` block leaves a live Cypress process that `tap sessions`
does not list, so there is nothing to target and no "not configured" report to read. Worse, if
an e2e session for that same project is running, auto-selection answers with *that* one, whose
`passed` verdict reads like your component run succeeded. Check the `TYPE` column on `status`
before believing a result, and configure the testing type before expecting to tap it.

**`run` succeeds but nothing runs** — `status` stays at `spec not selected` while `run` keeps
answering `▶ <spec>` with exit `0`. The session has stopped accepting run requests; seen once
after two runs were put in flight at once. `sessions` still shows it healthy. Restart
`cypress open`; the CLI cannot un-wedge it.

This state is **rare and has not reproduced**: firing three runs into a spec mid-flight, and
deleting the spec that was currently selected, were both re-tested deliberately and neither
wedged the session — runs superseded cleanly and the next `run` worked. Keep one run in flight
as discipline, but when a run seems lost, first rule out the two likelier explanations: a
verdict that belongs to a *superseding* run (compare `spec`, not just `startedAt`), and a
wedged or wrong session answering your calls (see above).

A spec that **fails to build** is not an error — `status` reports `failed` with the reason in
`error` and no test counts. Read `error`; it holds the bundler/compile failure. `reporter` is
empty, and app reads may still succeed against an empty frame, so neither is the diagnostic.

**A run you did not start** — `status` moves to `loading`/`running` on its own, or `startedAt`
changes before your `run` lands. Open mode watches spec files and reruns the active spec when
one is saved; measured here, `startedAt` moved within 3–6s of a write, sometimes with the
rerun already finished. This is not a fault, but
it breaks the verdict rule if the baseline `startedAt` was captured before the edit, and pairs
with your own dispatch to put two runs in flight. After writing a spec, let the watcher's run
reach a verdict, take the baseline from *there*, and only then dispatch — or let the watcher's
run be the one you read.

**Results disappear between commands** — `reporter` answers "No spec has run yet" and `status`
drops to `spec not selected`, on a session that was fine a moment ago. Results live only in the
app's memory, so an interrupted run, a restart, or deleting/renaming the spec that ran clears
them. Nothing is broken: rerun the spec. The lesson is ordering — read everything you need out
of a run *before* editing the spec, because the edit both drops the old results and starts a
new run.

## Ids that matched nothing

| Reported | Do |
| --- | --- |
| No test in this spec matched that id. | `tap reporter` (no `--test-id`) lists the ids |
| No attempt of this test matched that number. | `--attempt` is 1-based; the message names how many exist |
| No command in this test matched that id. | `tap reporter --test-id <id>` lists the rows |
| That command id matches more than one row of the test. | Qualify it as `<hookId>:<number>`, e.g. `h1:3` |
| No snapshot of this command matched that name or index. | The message lists the available snapshots; `--at` takes a name or 1-based index |
| That command has no DOM snapshot to pin. | Rerun the spec (snapshots are evicted per `numTestsKeptInMemory`), or pick a row whose `command` output lists snapshots |

## App-under-test reads

A selector matching nothing is not a CLI failure. `dom` and `inspect` report `found:false`
with exit `0`; treat that as an absent element, not a broken session. `aria` returns an empty
tree for either a miss or a matched element with no accessibility node, so confirm absence
with `dom` or `inspect`.

**Every expected element appears absent after a verdict** — first verify that the live frame is
actually the app. A trailing pending/skipped test can leave the runner on a blank placeholder
while `aria`, `dom`, and `inspect` continue to exit `0` with plausible empty/not-found results.
Sanity-check a known app anchor. If the run ended on a pending test and the frame is blank, pin
a snapshot from the last real command, inspect it, then `pin --clear`.

| Reported | Why | Do |
| --- | --- | --- |
| Failed to determine the app under test in the Cypress session. | No app frame in the runner page | Rerun the spec; or `pin` a command to read an earlier snapshot |
| ⚠ selector … matched N elements but must be unique | Ambiguous selector (exit `1`, matches listed on stdout) | Re-run with `--at <0-based index>` or a unique selector from the list |
| Expected `--at` to be a whole number, 0 or greater. | Bad flag value | Fix the value; these are checked before a session is even resolved |

## Invocation problems

Unknown command, unknown flag, missing argument, missing required option — each prints what
you gave, then the generated help for the command you called. `--help` works with no session
running, so `npx cypress tap <command> --help` is always available as the source of truth.

`MISSING_COMPANION_OPTION`-style failures name both flags: e.g. `--attempt` without
`--test-id` (pass the test id, or drop `--attempt` for the spec-wide view).

## When nothing above fits

"An error occurred." / "The Cypress session failed while running the command." mean the
failure carried no actionable condition. Get the diagnostic:

```bash
DEBUG=cypress:cli:tap,cypress:cli:cypress-sessions npx cypress tap <command> …
```

That prints the underlying stack, the resolved session, and the calls made — the detail to
attach to a GitHub issue.
