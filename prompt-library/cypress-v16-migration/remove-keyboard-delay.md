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
  3. Config:      a top-level keystrokeDelay entry in cypress.config
  4. Global:      Cypress.Keyboard.defaults({ keystrokeDelay: N })
                  in a support file

Levels 2 and 3 are both read through the same resolved config value, so
a suite/test override wins over the cypress.config value when both are
set. Level 4 only applies as a fallback when that resolved value is
unset — and whether a resolved value of 0 counts as "set" is exactly
what changes on v16 (see below).

IMPORTANT — why setting keystrokeDelay: 0 in cypress.config does NOT
work on the current Cypress version:
cy.type() resolves its delay as: `config('keystrokeDelay') || Keyboard.getConfig().keystrokeDelay`

Because `||` treats 0 as falsy, a `keystrokeDelay: 0` in cypress.config
is silently ignored today and falls through to Keyboard.getConfig().
The ONLY reliable way to get true 0ms behavior today is via Keyboard.defaults().

On v16 this resolution changes to nullish coalescing
(`config('keystrokeDelay') ?? Keyboard.getConfig().keystrokeDelay ?? 0`),
so a non-null cypress.config value — including 0 — takes effect and
overrides Keyboard.defaults(). If you leave a non-zero keystrokeDelay in
cypress.config today, it will silently override the Keyboard.defaults(0)
added in Step 2 the moment you upgrade to v16.

Step 1: Search all files for Cypress.Keyboard.defaults( and report any
existing keystrokeDelay value. Also check cypress.config for a top-level
keystrokeDelay entry and flag it if found.

For each instance found, suggest setting it to 0. A cypress.config
keystrokeDelay of 0 is harmless today (it's ignored, as explained above)
but keeping it in sync with Keyboard.defaults(0) now avoids a surprise
regression in typing speed when the project upgrades to v16. Also note
that setting keystrokeDelay inside a spec file will affect downstream
specs unless it is reset after the spec completes.

Step 2: In the global support file for E2E tests and for component tests
(verify the support file paths in the cypress.config file) — add the
following line at the top, outside any describe/it/before blocks:

  Cypress.Keyboard.defaults({ keystrokeDelay: 0 })

This is the only effective way to make the current Cypress version
behave like v16 today.

Step 3: Ask the user how they would like to verify the change:

  Option 1) **Recommended** — run all Cypress tests
  Option 2) Find all instances of cy.type() and run those specs/tests
            in isolation

Step 4: If there are any failed tests, isolate each failing test and
add a { delay: N } option directly to the cy.type() command.

Recommend the user review failures to determine the minimum delay they
want between keystrokes.
