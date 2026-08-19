---
name: cypress-tap
description: >-
  Drives a running Cypress open-mode session through `cypress tap` to run and
  rerun specs, wait for fresh results, inspect reporter and command logs, and
  query or rewind the app under test through DOM, accessibility, styles, and
  snapshots. Use when authoring or debugging Cypress e2e or component specs,
  discovering selectors, diagnosing failures, or verifying test behavior
  without GUI interaction. Not for one-shot headless runs. Requires Cypress
  15.21+, a Chromium-family browser, and a running `cypress open` session.
---

# Driving Cypress with `cypress tap`

`cypress tap` controls an already-running `cypress open` session. Use it to iterate on specs,
inspect the reporter and command log, and read the app under test without GUI interaction.
Use `cypress run` instead for a one-shot headless batch.

## Prerequisites

- A Cypress build containing `tap` (versioned 15.21.0+) must be compatible with the session.
  The version floor does not guarantee that a stable package has been published; verify the
  actual binary with `npx cypress tap --help`.
- The session must use Electron, Chrome, Chromium, or Edge. Firefox and WebKit are unsupported.
- `cypress open` and any configured `baseUrl` dev server must already be running.
- The cwd chooses both the Cypress binary and the automatically selected session. When the
  target project pins an older Cypress, run `tap` from a compatible checkout and pass
  `--session <pid>` on every call.

## Choose the workflow

- **No session:** start `cypress open`, then poll `status` until it includes a `pid`.
- **Run or rerun:** `specs` → capture `startedAt` → `run` → wait for a fresh verdict.
- **Author a spec:** run a probe spec → `aria` → targeted `dom` → `inspect`.
- **Diagnose a failure:** `reporter` → `reporter --test-id` → `command` → `pin` → app reads.
- **One noninteractive batch:** use `cypress run`, not `tap`.

## Required reading by task

- Before starting, selecting, running, or polling a session, read
  [references/session-lifecycle.md](references/session-lifecycle.md).
- Before using `specs`, `run`, `reporter`, or `command`, read
  [references/reading-results.md](references/reading-results.md).
- Before using `dom`, `aria`, `inspect`, or `pin`, read
  [references/reading-the-app.md](references/reading-the-app.md).
- When a command fails, hangs, targets the wrong project, or returns surprising output, read
  [references/troubleshooting.md](references/troubleshooting.md).
- For spec authoring, flake hunting, run reporting, and failure diagnosis, read
  [references/recipes.md](references/recipes.md).

Read only the references required for the current task.

## Core commands

- `sessions`: reachable sessions, project roots, testing types, browsers, and renderer health.
- `status`: lifecycle stage, selected spec, run identity, counts, build error, and active pin.
- `specs`: runnable project-relative spec paths for the session's testing type.
- `run <spec>`: dispatches a spec and returns immediately.
- `reporter`: spec overview and test ids; with `--test-id`, the complete test attempt.
- `command`: one command-log row with network data, snapshots, and console properties.
- `pin`: rewinds the app frame to a command snapshot.
- `dom`, `aria`, `inspect`: read the settled app or currently pinned snapshot.

All commands accept `--session <pid>`, `--json`, and `--timeout <ms>`. Use
`npx cypress tap <command> --help` for command-specific flags; help needs no running session.

## The non-negotiable verdict rule

`run` confirms dispatch, not execution, and returns before the new run starts. During that gap,
`status` and app reads can still return the previous run's plausible verdict and page.

For every explicit run:

1. Read the current `startedAt`.
2. Dispatch exactly one spec.
3. Poll one `status --json` response at a time.
4. Accept only `passed` or `failed` with a non-empty, changed `startedAt` **and** the expected
   `spec`.
5. Bound the loop and fail if no matching fresh verdict arrives.

Saving the active spec triggers an automatic watcher run. After editing, either use that run or
let it settle before taking a baseline and dispatching another. Never intentionally put two runs
in flight.

Blank and partial status payloads occur transiently. Treat missing fields as "keep waiting," not
as a state change. Require every field used in a comparison to be present.

Lifecycle order:

`not connected` → `browser not selected` → `spec not selected` → `loading` → `running` →
`passed` | `failed`

Only `passed` and `failed` are verdicts. A build failure is `failed` with the diagnostic in
`status.error`, possibly before any tests exist.

## Minimal run loop

Read all synchronization fields from one status response. Each invocation starts Node, so sleep
at least two seconds and do not make separate status calls per field.

```bash
tap_state () {
  local json
  json=$(npx cypress tap status --json 2>/dev/null) || return 1
  printf '%s' "$json" | node -e "
    try {
      const v = JSON.parse(require('fs').readFileSync(0, 'utf8'))
      if (!v || typeof v.status !== 'string' || !v.status) process.exit(1)
      if (['passed', 'failed'].includes(v.status) && (!v.startedAt || !v.spec)) process.exit(1)
      console.log([v.status, v.startedAt ?? '', v.pid ?? '', v.spec ?? ''].join('|'))
    } catch { process.exit(1) }
  "
}

SPEC=cypress/e2e/login.cy.ts
while ! IFS='|' read -r _ before _ _ < <(tap_state); do sleep 2; done
npx cypress tap run "$SPEC" || exit 1

fresh=0
for _ in $(seq 1 120); do
  if IFS='|' read -r stage started_at _ ran_spec < <(tap_state); then
    case "$stage" in
      passed|failed)
        if [ -n "$started_at" ] && [ "$started_at" != "$before" ] \
          && [ "$ran_spec" = "$SPEC" ]; then
          fresh=1
          break
        fi
        ;;
    esac
  fi
  sleep 2
done
[ "$fresh" -eq 1 ] || { echo "no fresh verdict" >&2; exit 1; }

npx cypress tap status
npx cypress tap reporter
```

Copy `SPEC` from `tap specs`; do not guess paths. This snippet uses process substitution
(`< <(...)`) and therefore requires bash or zsh, not POSIX `sh`. Baseline capture retries until
it gets a structurally complete status; otherwise a transient blank read could make the previous
run's verdict appear fresh after dispatch.

## Critical correctness rules

1. **Target the intended session.** If several sessions exist, or auto-selection behaves oddly,
   inspect `sessions` and pass `--session <pid>`. Auto-selection can choose another project or an
   unresponsive session.
2. **Preserve the binary location.** Cwd controls `npx` resolution on every call. If using a
   separate tap-capable checkout, bind it once:

   ```bash
   tap_cli () {
     npx --prefix "/path/to/tap-capable-checkout" cypress tap -s 73952 "$@"
   }
   ```

3. **Do not parse failed commands.** Results use stdout and failures use stderr, but a failure
   generally leaves stdout empty. Check the exit code before parsing JSON. An ambiguous selector
   is the intentional exception: it exits `1` and prints matches on stdout.
4. **Do not discard dispatch stdout while checking compatibility.** An older Cypress prints
   `Unknown command "tap"` and usage text to stdout; redirecting it hides the cause.
5. **Redirect potentially large JSON.** `reporter --test-id --json` and `command --json` can be
   hundreds of kilobytes. Save them to a file and parse the file.
6. **Check truncation before concluding absence.** `dom` and `aria` cap output. Narrow the
   selector or raise the limit when `(output truncated)` appears.
7. **Sanity-check the live frame before concluding absence.** A trailing pending/skipped test
   can leave the settled runner on a blank placeholder while app reads still exit `0`. Confirm a
   known app anchor. If the frame is blank, pin a snapshot from the last real command and read
   that state instead.
8. **Read results before editing or deleting the spec.** Results and snapshots live in the
   Cypress app's memory and can disappear on rerun, restart, rename, or deletion.
9. **Clear pins.** After inspecting a command snapshot, run `pin --clear`; otherwise later app
   reads continue to describe the pinned past.

## Output contract

- Human output is for reading; `--json` is for parsing and may contain much more data.
- Exit `0` means success and exit `1` means failure, except `status` exits `0` for every known
  lifecycle stage, including `not connected`.
- `dom`, `aria`, and `inspect` require exactly one selected element. Ambiguity exits `1` with
  candidate selectors. A miss is not a CLI failure: `dom` and `inspect` report `found:false`;
  `aria` returns an empty tree both for a miss and for an element with no accessibility node.
- Failures are prose without stable error codes. Branch on exit status, not message text.

## Performance defaults

- Use one `status --json` call per poll and sleep at least two seconds.
- Bound every loop by attempts; a degraded session can make each call much slower than expected.
- Prefer one wide `reporter --test-id` read over one `command` call per row.
- After a fresh verdict and live-frame sanity check, independent `aria`, `dom`, and `inspect`
  reads may run concurrently.
- If calls are unexpectedly slow, inspect `sessions` for `rendererResponsive: false`; increasing
  `--timeout` does not recover a wedged renderer.
