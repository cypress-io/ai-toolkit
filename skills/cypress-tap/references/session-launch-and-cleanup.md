# Launching and cleaning up a headless session

If you start `cypress open`, you own it: run it headless in the background, track its pids, and
stop it when you are done. The commands below are for macOS and Linux.

## Launch

`--headless` needs `--e2e` or `--component` and a browser (`--browser` or `defaultBrowser`), and
`--project <path>` if Cypress is installed globally (not `--global`). If
`npx --no-install cypress open --help` does not list `--headless`, tell the user instead of
opening a headed session.

Note the existing session pids first so you can tell yours apart, then launch in the background
(a foreground `open` never returns). `set -m` gives the launch its own process group, whose id
is the launch pid, so the whole tree (npx, the Cypress CLI, the app, and its browser) can be
stopped with one signal. Do not add `--detached`: it moves the app into a process group of its
own, outside the one you will stop. Use your testing type in both the flag and the log name:

```bash
npx --no-install cypress tap sessions
LOG="/tmp/cypress-open-$(basename "$PWD")-e2e.log"
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
the **launch pid** here, with the leading `-` that targets the group:

```bash
kill -TERM -- -<launch pid>
sleep 3                                  # give Cypress time to shut down cleanly
npx --no-install cypress tap sessions   # confirm your session pid is gone
rm -f "<log>"
```

If your session pid is still listed, force the group: `kill -KILL -- -<launch pid>`. If you
launched without `set -m` and so have no process group, stop the session pid instead
(`kill <session pid>`, then `kill -9 <session pid>` if it is still listed after a few seconds).

Never stop a session you did not start; it may be the user's. If `tap sessions` shows one you
cannot account for, tell the user rather than killing it. Stop any dev server you started too.
