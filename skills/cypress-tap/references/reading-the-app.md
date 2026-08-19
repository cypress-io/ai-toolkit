# Reading the app under test: `dom`, `aria`, `inspect`, `pin`

These four read the actual page inside the Cypress runner — the app your tests drive, not the
Cypress UI. They serve two jobs equally: **authoring** (discover what is on the page, and which
queries and selectors will work, before writing a command) and **debugging** (see what the app
looked like when something failed).

## They need a settled run

All four refuse unless the selected spec has reached `passed` or `failed`:

- **while `loading`** → `SPEC_NOT_STARTED`. The spec is selected but Mocha has not started.
- **while `running`** → "The spec … is currently running." The page is in flux (commands
  executing, snapshots swapping, navigation in progress), so any read would capture a
  transient state.
- **before any spec has run** → "No spec has run yet." There is no app under test yet, only
  the runner shell.

So the loop is always: `run` → poll `status` until a verdict with a fresh `startedAt` → read.

**The refusal is a backstop, not a synchronization primitive.** In the window between `run`
returning and the new run actually starting, the lifecycle still reports the previous
verdict — so a read in that window **succeeds, exits `0`, and describes the previous run's
page**. Confirmed against a live session: with the app sitting on the network-requests page,
`run`ning a different spec and immediately reading `.network-btn` returned that button.
Whether you get the stale page or the "currently running" refusal is a matter of timing, and
short specs can even finish between two calls (each invocation costs about a second). Wait
for the changed `startedAt`; do not lean on the refusal.

**A verdict does not guarantee that the live frame still contains the app.** Reproduced with
a passing spec whose final test was `it.skip`: after the green verdict, the runner showed its
blank placeholder and `aria`, `dom`, and `inspect` all exited `0` with plausible absence
results. Removing the trailing pending test restored live reads; pinning a snapshot from the
last real command exposed the correct page immediately.

Before concluding that an expected element is absent, sanity-check a known app anchor (or read
`body` and confirm it is your app). If the run ended on a pending/skipped test and the live frame
is blank, use `command` to find a snapshot from the last executed test, `pin` it, perform the
reads, then `pin --clear`. Do not interpret a successful read of the blank runner placeholder
as application state.

## `dom` — the page as HTML

```bash
npx cypress tap dom                                  # <body> and its subtree
npx cypress tap dom --selector html                  # the whole document
npx cypress tap dom -e '[data-cy=cart-item]'         # one element's subtree
npx cypress tap dom -e '#app' -m 80000               # raise the character cap
```

Output is the element's `outerHTML`, dedented to the margin, and nothing else — no framing,
so it pipes cleanly. Capped at **30 000 characters** browser-side (`-m/--max-chars`); a clipped
result ends with `(output truncated)`. Prefer narrowing the selector over raising the cap.

Treat truncation as a correctness hazard, not just a display limit. A chrome-heavy app can
spend the entire budget on nav and sidebar markup before reaching the region you asked about,
and even `--selector '#main'` can clip. Searching a clipped result then reports text as absent
when it was only cut off — so **never conclude an element or string is missing from a
truncated read**. Check for the marker first, then narrow to the smallest enclosing element
(or raise `-m`) and read again.

`--selector html` is how you get `<head>`; the default `body` skips the script and style text
that would otherwise dominate the read.

## `aria` — the accessibility tree

```bash
npx cypress tap aria                                 # from <body>
npx cypress tap aria -e '[role=dialog]'              # subtree at an element
npx cypress tap aria -m 500                          # raise the node cap
```

```
main
  heading  Your cart
  list
    listitem
      link  Blue shirt
      button  Remove  [disabled]
    listitem
      link  Red hat
      button  Remove
  textbox  Promo code = SAVE10  [invalid]
  button  Checkout
```

One line per node, indented by depth: role, accessible name, `= value` for value-bearing
controls, and notable states in brackets (`focused`, `disabled`, `required`, `invalid`,
`checked`, `expanded`, `selected`, `pressed`, `readonly`, `hidden`, `modal`, `busy`).

Most structural and text-only roles are dropped, including `StaticText`, `generic`,
`paragraph`, `InlineTextBox`, `LineBreak`, and `none`, which is what makes the tree compact.
The filtering is not exhaustive: unnamed `LabelText` nodes can still appear as bare
`LabelText` lines. **`aria` is not how you read body copy.** Use `dom` for text content and
`aria` for structure, semantics and control state. Capped at **200 nodes**
(`-m/--max-nodes`).

This is the best first read for "what can a user do on this page right now", and for
designing accessibility-aware queries when the project uses commands such as Cypress Testing
Library's role and label queries. Cypress's built-in `cy.get()` takes a CSS selector.

## `inspect` — one element in detail

```bash
npx cypress tap inspect -e '[data-cy=submit]'
```

```
ATTRIBUTES (3)
  data-cy  submit
  class    btn btn-primary
  disabled

ACCESSIBILITY
  role    button
  name    Place order
  states  disabled

BOX
  x 412   y 780   width 148   height 44

STYLES (24)
  display        inline-flex
  visibility     visible
  opacity        1
  pointer-events none
  …
```

`--selector` is **required** here. The style list is a curated ~24 properties that answer
"why does it look or behave this way": layout and positioning, box metrics, visibility,
color and type, `z-index`, `overflow`, `pointer-events`, `cursor`. It exposes useful factors
behind "the click did nothing" and "the assertion says it is not visible", but Cypress still
decides full actionability, including coverage, animation, and detachment.

## One element, or nothing

`dom`, `aria` and `inspect` all require the selector to match **exactly one** element. A
selector matching more is refused — no silent first-match — and answered with the matches:

```
⚠ selector 'li' matched 26 elements but must be unique
provide --at with an index to select an element from the list or update the selector.
index  selector
0      '.dropdown'
1      '.dropdown-menu > :nth-child(1)'
…
9      '.dropdown-menu > :nth-child(9)'

showing the first 10 of 26 matches — --at takes any index up to 25.
```

Exit code is `1`, and the list is on stdout. Recover either way: re-run with a unique selector
from the table, or with `--at <index>`. **`--at` here is 0-based** and indexes
`document.querySelectorAll(selector)`.

A selector matching nothing is different: the command succeeds with exit `0`. `dom` and
`inspect` report `found:false`, meaning the requested element is absent. `aria` instead returns
an empty tree both when the selector misses and when the matched element has no accessibility
node, so use `dom` or `inspect` to establish absence. Do not restart or retry the same selector
unless app state is expected to change.

Only the first 10 matches get a derived selector (deriving one is expensive on a large page),
and the output says so; `--at` still accepts any index up to `count - 1`. A `-` in the selector column means no unique
CSS selector could be derived for that match.

## `pin` — read the app as it was at an earlier command

The live frame only ever shows the *final* state of the run. `pin` puts a command's captured
DOM snapshot into that frame, so `dom`, `aria` and `inspect` then read **that moment**
instead.

```bash
npx cypress tap pin --test-id r4 --command-id 5          # last snapshot of the command
npx cypress tap pin -t r4 -c 5 --at before               # by snapshot name
npx cypress tap pin -t r4 -c 5 --at 1                    # by 1-based position
npx cypress tap pin --clear                              # release, restore the live page
```

```
⚲ PINNED - (2/2) after
TEST BODY · r4
   5  wait  @login  @login
```

- `--test-id` and `--command-id` are both required (unless `--clear`); get them from
  `reporter` — see `reading-results.md`.
- **`--at` on `pin` is a snapshot name or a 1-based index** — not the 0-based element index
  the reads use. `command --test-id … --command-id …` lists a row's snapshots by both.
- Re-running `pin` on the already-pinned command switches snapshots without releasing.
- `status` reports the active pin, so a later read never surprises you.
- Always `pin --clear` when done — otherwise every later `dom`/`aria`/`inspect` silently
  describes the pinned past.

Snapshots are captured in open mode only, and kept only for the most recent tests
(`numTestsKeptInMemory`). "That command has no DOM snapshot to pin" means the row captured
none or its test was evicted — rerun the spec for fresh snapshots, or raise
`numTestsKeptInMemory`.

A pinned snapshot is a DOM snapshot: styling and structure are faithful, but nothing runs.
No scripts, no network, no live state.

Elements the driver interacted with carry a `data-cypress-el="true"` attribute in snapshots.
That is Cypress instrumentation, not application markup — `inspect` will list it, and it is
not a finding.

### The failure-diagnosis loop

The full loop — failing ids from `--json`, `reporter --test-id`, `command`, then `pin` +
`inspect` — is in SKILL.md under Recipes. The part that belongs here: `pin` is what turns a
post-mortem into an inspection, because it puts the app back into the state the failing
command saw. Without it, `dom`/`aria`/`inspect` can only ever describe the end of the run.

## Harvesting selectors while authoring

There is no CLI command that lists selectors on demand — the session has an internal
`resolve-selector` command, but the CLI does not register hidden commands, so
`cypress tap resolve-selector …` answers `Unknown command`. The ambiguity report *is* the
selector-discovery tool, and you reach it by reading with a deliberately loose selector:

```bash
npx cypress tap inspect --selector 'li'      # or dom / aria — any of the three
```

You get a unique selector for each of the first 10 matches, a total count, and `-` for any match
no unique selector could be derived for. Exit code is `1`, which is expected here — you invoked
it for the list, not for the read. Uses while authoring:

- Turn an element you spotted in `dom`/`aria` into a selector that resolves to exactly one node.
- See the shape of a repeated region (list items, table rows, cards) in one call.
- Learn that the resolver could not derive a unique selector, in which case prefer a semantic
  query or add a stable `data-*` hook instead of inventing a fragile CSS path.

Narrow the input if it matches hundreds: derivation is capped at 10 matches, and `--at` still
reads any index beyond that.
