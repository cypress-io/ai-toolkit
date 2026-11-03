I'm preparing for a Cypress v16 upgrade. v16 changes the default
keystrokeDelay from 10ms to 0ms. I want to surface any timing
sensitivity in my tests NOW, on the current version, so nothing
surprises me on upgrade day.

Background — keystrokeDelay has four sources, highest precedence first
(each overrides the one below it):
  1. Per-command: cy.type('text', { delay: N }) — always wins, on
                  both the current version and v16; it is never
                  overridden by config or Keyboard.defaults()
  2. Suite/test:  describe('...', { keystrokeDelay: N }, () => {})
                  it('...', { keystrokeDelay: N }, () => {})
  3. Config:      a keystrokeDelay entry in cypress.config — at the
                  top level, or scoped under e2e: / component:
  4. Global:      Cypress.Keyboard.defaults({ keystrokeDelay: N })
                  in a support file

Levels 2 and 3 are both read through the same resolved config value, so
a suite/test override wins over the cypress.config value when both are
set. Level 4 only applies as a fallback when that resolved value is
unset — and whether a resolved value of 0 counts as "set" is exactly
what changes on v16 (see below).

IMPORTANT — a non-zero override already matters today, not just after v16:
cy.type() resolves its delay as: `config('keystrokeDelay') || Keyboard.getConfig().keystrokeDelay`

Because `||` treats 0 as falsy, a config value of 0 is ignored today (use
Keyboard.defaults(), or an explicit { delay: 0 } per command, instead).
But a *non-zero* config or suite/test value is truthy, so it already
overrides Keyboard.defaults() today — this isn't a v16-only regression.

On v16, resolution switches to nullish coalescing
(`config('keystrokeDelay') ?? Keyboard.getConfig().keystrokeDelay ?? 0`),
so that same non-zero value keeps winning after the upgrade; only a
value of exactly 0 changes behavior (ignored today, effective on v16).

Step 1: Search all files for Cypress.Keyboard.defaults( and any existing
keystrokeDelay value. Check cypress.config for a keystrokeDelay entry
(top-level or under e2e:/component:), and specs for suite/test-level
{ keystrokeDelay: N } options on describe(...)/it(...). Flag every
instance found.

Suggest zeroing or removing any non-zero value found: a config or
suite/test override already outranks Keyboard.defaults() today (see
above), and an existing non-zero Keyboard.defaults() call should simply
match v16's new 0ms default. Note that setting keystrokeDelay inside a
spec file affects downstream specs unless it's reset after the spec
completes. Confirm every non-zero value is cleared before moving on to
Step 2 — it will otherwise keep masking the change made there.

Step 2: In the global support file for E2E tests and for component tests
(verify the support file paths in the cypress.config file) — add the
following line at the top, outside any describe/it/before blocks:

  Cypress.Keyboard.defaults({ keystrokeDelay: 0 })

Step 3: Ask the user how they would like to verify the change:

  Option 1) **Recommended** — run all Cypress tests
  Option 2) Find all instances of cy.type() and run those specs/tests
            in isolation

Step 4: If there are any failed tests, isolate each failing test and
add a { delay: N } option directly to the cy.type() command.

Recommend the user review failures to determine the minimum delay they
want between keystrokes.
