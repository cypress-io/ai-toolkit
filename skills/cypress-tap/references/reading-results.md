# Reading results: `reporter` and `command`

These two reproduce the Cypress app's reporter panel in the terminal. Both are readable once
the lifecycle reaches `running` — you do not have to wait for a verdict (unlike the app reads
in `reading-the-app.md`). During `loading`, before Mocha starts, they report
`SPEC_NOT_STARTED`; before any spec has ever run they report "No spec has run yet."

## `specs` — what is runnable

```bash
npx cypress tap specs
```

```
SPECS (3)
  cypress/e2e/login.cy.ts     2 hours ago
  cypress/e2e/cart.cy.ts      yesterday
  cypress/e2e/search.cy.ts    3 days ago
```

Most recently modified first, which usually puts the spec you are working on at the top.
Paths are POSIX and project-relative — exactly the form `run` wants. Only the **open
testing type** is listed; a spec that exists but is missing here is outside the project's
`specPattern`.

`--json` adds `lastModifiedTimestamp` for sorting; the human view shows git's relative
phrasing only.

## `run` — start or rerun

```bash
npx cypress tap run cypress/e2e/login.cy.ts
```

```
▶ cypress/e2e/login.cy.ts

  testing type  e2e
  browser       Chrome
```

That output confirms what was *launched*, not what happened. Poll `status` for the outcome
(see `session-lifecycle.md`). Rerunning the same path is how you re-execute after editing
either the spec or the app.

A build failure reaches a `failed` verdict before tests exist. In that case `reporter` is an
empty run and the useful diagnostic is `status.error`, which carries the bundler or compile
failure.

## `reporter` — the spec overview

With no `--test-id`, you get the header stats plus every suite and test, each with the **test
id** the other commands take:

```bash
npx cypress tap reporter
```

```
cypress/e2e/login.cy.ts  (started at 10:42:19 AM)
✓ 4  ✖ 1  ○ --  01:07

Login > form
   r3  ✓ shows validation errors    412ms
   r4  ✖ submits valid credentials  2.1s
   r5  ○ remembers the user         (2 attempts)
```

Test ids are the runner's own (`r3`, `r4`, …). Suite sections are the full suite path joined
with ` > `, so titles can be pasted straight into a case-sensitive search. A retried test
shows its attempt count and lists each attempt underneath — captured from a live run of a
test configured with `{ retries: 2 }`:

```
tap skill check
   r3  ✖ retries then fails  24ms  (3 attempts)
         ✖ attempt 1  46ms
         ✖ attempt 2  16ms
         ✖ attempt 3  24ms
```

`--attempt` then selects one (1-based, attempt 1 = the first run); out of range, the failure
names how many exist: *"Looked for `--attempt` 4. Test "r3" has 3 attempts."*

## `reporter --test-id` — one test in full

```bash
npx cypress tap reporter --test-id r4
npx cypress tap reporter --test-id r4 --attempt 1   # an earlier retry
```

This is the whole panel for one attempt: the `cy.session`s it used, its spies/stubs, its
`cy.intercept` routes, the complete command log split into hook sections, and the error with
its code frame when it failed.

A failing hook may attach its error to the affected test while leaving the command log empty
because no Cypress command ran. Read the test's error panel before assuming an empty log means
the failure details were lost.

```
✖ Login > form > submits valid credentials  failed

ROUTES (1)
  METHOD  MATCHER          STUBBED  ALIAS  #
  POST    **/api/session   yes      login  1

BEFORE EACH · h1
   1  visit   /login

TEST BODY · r4
   1  get     [data-cy=email]
   2  -type   user@example.com
   3  get     [data-cy=submit]
   4  -click
   5  wait    @login  @login
   6  assert  expected '/login' to equal '/dashboard'  ✖

✖ AssertionError
  Timed out retrying after 4000ms: expected '/login' to equal '/dashboard'

  cypress/e2e/login.cy.ts:24:31
    22 |     cy.get('[data-cy=submit]').click()
    23 |     cy.wait('@login')
  > 24 |     cy.location('pathname').should('eq', '/dashboard')
       |                                   ^
```

`--attempt` is 1-based and requires `--test-id`; omit it for the latest attempt.

### Command ids

The number in the left column is the **command id** that `command` and `pin` take. Read them
carefully — the numbering is per hook section, so it restarts:

- A plain number (`5`) resolves to the **test body** first, then to a unique match elsewhere.
- Qualify it as `<hookId>:<number>` (`h1:3`) to target a hook row directly. The hook id is
  printed in the section heading — `BEFORE EACH · h1`, and for the test's own commands the
  section is headed by the test id itself (`TEST BODY · r4`), so `-c r4:2` also works.
- Event and system rows — `xhr`, `fetch`, uncaught exceptions, driver annotations — are
  unnumbered in the app, so `tap` gives them attempt-wide `e1`, `e2`, … ids instead. They
  render in italics with a parenthesized label.
- `cy.intercept` **registration** rows have no id at all: routes are not commands. They show
  up in the `ROUTES` table.
- A dash prefix on the name (`-type`, `-assert`) means the command was chained off the
  previous subject — a child command.

Hook sections are numbered independently and each carries its own id — `BEFORE ALL · h1`,
`BEFORE EACH · h2` — so the same row number appears in several sections. If an unqualified
number matches rows in two hooks and not in the test body, the command fails and names the
candidates:

```
That command id matches more than one row of the test.

"1" matches:

  h1:1 (before all)
  h2:1 (before each)
```

Re-run with the qualified id (`-c h2:1`).

### Reading the log to verify a spec you just wrote

The command log is not only a post-mortem. A passing test can pass for the wrong reason — an
assertion that read a different subject than you intended, a `cy.get()` that matched something
else, a stubbed route that never matched and let the real request through. The log shows each
command's message (the arguments and the yielded subject), each assertion as it actually read
(`expected <li> to have text Pay electric bill`), and the ROUTES table with per-route match
counts. After writing or changing a spec, read `reporter --test-id <id>` and check that story
against what you meant — a route with `#` of `-` never matched, and an assertion phrased against
an unexpected subject is a test that will not catch the regression it was written for.

## `command` — one row, top to bottom

```bash
npx cypress tap command --test-id r4 --command-id 5
npx cypress tap command -t r4 -c h1:3 -a 1
```

Gives the row itself under its section heading, then the panels available for that command:
network detail, DOM snapshots you can pin, console properties, mouse events, and an error when
present. Panels are command-dependent; do not assume every row has the same set.

```
TEST BODY
✖  5  wait  @login  @login  failed

NETWORK
  METHOD  POST
  URL     /api/session
  STATUS  401
  ALIAS   @login

SNAPSHOTS (2)
  #  NAME    TIME
  1  before  10:42:21.104
  2  after   10:42:25.339

CONSOLE PROPS
  Command   wait
  Yielded   {5 keys}
  Request   {4 keys}
  Response  {status: 401, body: {…}, headers: {12 keys}}
  3 sections collapsed — open all of it with --depth all
```

`SNAPSHOTS` is the answer to "can I pin this?" — an empty panel means there is nothing to
pin (the command captured none, or the driver has since evicted this test's details from
memory per `numTestsKeptInMemory`).

A failed row also carries an `ERROR` panel, and a row whose payload the driver gave nothing
for reads `(nothing here)`:

```
✖  4  -click  {timeout: 1000}  failed

SNAPSHOTS (2)
  #  NAME    TIME
  1  before  10:45:51.832
  2  after   10:45:52.825

CONSOLE PROPS
  (nothing here)

ERROR
  [1,414 characters withheld — pass --json to include it]
```

Click rows can also include a `MOUSE EVENTS` panel after `CONSOLE PROPS`. It lists the browser
mouse-event sequence produced by the action and may contain several rows even for one Cypress
`click` command. Its presence is normal and does not imply a failure; an `ERROR` panel follows
it when the command failed.

### Console props depth

Console properties have no bounded shape — a `cy.request` row carries its matcher, request,
response and every header. The renderer therefore opens **collapsed**: about three levels,
and any section too long to take in at a glance reads as `{n keys}` / `[n items]`.

- `--depth <n>` expands to `n` levels and lifts the length budget (you asked for levels).
- `--depth all` expands everything.
- `--json` returns every property in full, however long — the one flag `command` treats as
  changing the *result*, not just the rendering.

**`--depth` and `--json` do different jobs, and `--depth` cannot substitute.** `--depth`
expands *nesting*; a single long string stays withheld —
`[1,414 characters withheld — pass --json to include it]` renders identically under
`--depth all` (verified byte-for-byte). Only `--json` returns it.

**Under `--json`, a failing row's error is at `consoleProps.error`** — there is no top-level
`error` key on a `command` result, whose keys are `id`, `name`, `message`, `state`, `type`,
`hook`, `snapshots`, `consoleProps`. This is easy to get wrong because the human rendering
puts the error under its own `ERROR` heading *below* a `CONSOLE PROPS  (nothing here)` line, so
the structure it implies is the opposite of the structure you must parse:

```bash
npx cypress tap command -t r4 -c 3 --json > /tmp/cmd.json || exit 1
node -pe "require('/tmp/cmd.json').consoleProps.error"     # not .error
``` Shorter values are clamped to the terminal width in
the human view, with a trailing `…`; `--json` never clamps.

**Because `--json` never clamps, redirect large results to a file.** `reporter --test-id
--json` on one ordinary test of a chrome-heavy app measured 481 KB, and neither `reporter` nor
`command` has a `-m` to cap it. Treat that number as a property of the app rather than of the
command — the same read against a small static page measured 800 bytes. Redirect either way;
the point is to find out by measuring, not to predict. The shell preserves a pipe or command
substitution, but sending that much output through an agent's captured terminal output wastes
context and may hit the surrounding tool's display limits. A file keeps the payload intact and
out of the transcript:

```bash
npx cypress tap reporter --test-id r4 --json > /tmp/test.json || exit 1
node -e "const v=require('/tmp/test.json'); …"
```

**Command logs keep growing after the run ends.** An idle app goes on issuing background
requests that append to the last test's log — three consecutive reads of the same finished test
measured 481 KB, 504 KB, then 535 KB. Reproduced deliberately against a page fetching every
700ms: the same finished test read 2.8 KB, 8.9 KB, then 14.1 KB over 12 seconds, its row count
going 8 → 23 → 36. The growth is background traffic, not test activity. Do not treat the last
row as where the test stopped, and do not compare sizes across reads to infer that something
changed.

Event rows are addressable here too, and are often the most informative: `command -t r8 -c e1`
on an `xhr` row gives its `NETWORK` panel (method, URL, indicator, stubbed, alias), `request`
and `response` snapshots, and the matched `cy.intercept()` matcher in its console props.
