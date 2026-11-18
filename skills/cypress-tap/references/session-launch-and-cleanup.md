# Launching and cleaning up a headless session

If you start `cypress open`, you own it: run it headless in the background, track its pid, and
stop it when you are done. The commands below are for macOS and Linux.

## Launch

`--headless` needs `--e2e` or `--component` and a browser (`--browser` or `defaultBrowser`), and
`--project <path>` if Cypress is installed globally (not `--global`). If `npx --no-install cypress open --help`
does not list `--headless`, tell the user instead of opening a headed session.

Note the existing session pids first so you can tell yours apart, then launch in the background
(a foreground `open` never returns). Use your testing type in both the flag and the log name:

```bash
npx --no-install cypress tap sessions
LOG="/tmp/cypress-open-$(basename "$PWD")-e2e.log"
nohup npx --no-install cypress open --headless --e2e --browser electron > "$LOG" 2>&1 &
echo "launch pid: $!  log: $LOG"   # keep both in case no session ever appears
```

Wait (bounded, polling every couple of seconds) for a new pid to appear in `tap sessions` for
your project and testing type. That is your session: keep the pid in your notes, since each
shell call is fresh, and pass `--session <pid>` on every call from now on. Then poll
`tap status --session <pid>` until it reaches `spec not selected`. If more than one new pid
matches (the user may have opened one meanwhile), ask the user which is yours rather than
guessing.

If it never becomes ready, or `status` reports `error`, read the log, stop the session, and
report the failure. If no session appeared, stop the launch pid's children first, then the
launch pid itself (`pkill -P <launch pid>; kill <launch pid>`): it is only the `npx` wrapper.

## Stop

Before your final answer, and on any failure, stop the session you started:

```bash
kill <pid>
sleep 3                                  # give Cypress time to shut down cleanly
npx --no-install cypress tap sessions   # confirm it is gone
rm -f "<log>"
```

If it is still listed, stop its child processes and force it: `pkill -P <pid>; kill -9 <pid>`.

Never stop a session you did not start; it may be the user's. If `tap sessions` shows one you
cannot account for, tell the user rather than killing it. Stop any dev server you started too.
