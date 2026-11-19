# Launching and cleaning up a headless session

If you start `cypress open`, you own it: run it headless in the background, track its pids, and
stop it when you are done. The commands below are for macOS and Linux. On Windows, do not
self-start: ask the user to open a session (or attach to one they own) and never stop it.

An interrupted or cancelled turn can leave this detached tree running, because the harness
killing your shell does not reap it. Stop is therefore mandatory on every exit path, including
failure and early abort.

## Launch

`--headless` needs `--e2e` or `--component` and a browser (`--browser` or `defaultBrowser`), and
`--project <path>` if Cypress is installed globally (not `--global`). If
`npx --no-install cypress open --help` does not list `--headless`, the installed Cypress predates
headless open (it is not covered by the 15.21+ `tap` floor, and may not be in any shipping
release yet). Tell the user, and either ask them to open a session for you or, only with their
explicit OK, run a headed `cypress open` the same way (drop `--headless`; expect a window).

Note the existing session pids first so you can tell yours apart, then launch in the background
(a foreground `open` never returns). `set -m` gives the launch its own process group, whose id
is the launch pid, so the whole tree (npx, the Cypress CLI, the app, and its browser) can be
stopped with one signal. Do not add `--detached`: it moves the app into a process group of its
own, outside the one you will stop. Run the whole block below as **one** shell call so `set -m`, `nohup … &`, and `$!` share a
job-control context. Use your testing type in the flag:

```bash
npx --no-install cypress tap sessions
LOG="$(mktemp -t cypress-open.XXXXXX)"
set -m
nohup npx --no-install cypress open --headless --e2e --browser electron > "$LOG" 2>&1 &
echo "launch pid (= process group): $!  log: $LOG"
```

Wait (bounded, polling every couple of seconds) for a new pid to appear in `tap sessions` for
your project and testing type. That is your **session pid**: pass `--session <session pid>` on
every call from now on. Keep both the launch pid and the session pid in your notes, since each
shell call is fresh. Then poll `tap status --session <session pid>` until it reaches
`spec not selected`. If more than one new pid matches (the user may have opened one meanwhile),
ask the user which is yours rather than guessing.

If it never becomes ready, or `status` reports `error`, read the log, stop the launch (below),
and report the failure.

## Stop

Before your final answer, and on any failure, stop the whole process group you launched. Use
the **launch pid** here, with the leading `-` that targets the group. Your notes can go stale
after a summary or resume, and a reused pgid would hit unrelated processes, so first confirm
the group is still your Cypress launch; if it is not, skip the group kill and fall back to the
session pid:

```bash
ps -o pgid=,command= -g <launch pid>     # expect npx/cypress open --headless; else skip
kill -TERM -- -<launch pid>
sleep 3                                  # give Cypress time to shut down cleanly
npx --no-install cypress tap sessions   # confirm your session pid is gone
rm -f "<log>"
```

If your session pid is still listed, force the group (after re-running the `ps` check): `kill -KILL -- -<launch pid>`. If you
launched without `set -m` and so have no process group, stop the session pid instead
(`kill <session pid>`, then `kill -9 <session pid>` if it is still listed after a few seconds).

Never stop a session you did not start; it may be the user's. If `tap sessions` shows one you
cannot account for, tell the user rather than killing it. Stop any dev server you started too.
