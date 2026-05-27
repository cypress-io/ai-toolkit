I'm preparing for a Cypress v16 upgrade. v16 changes the default
keystrokeDelay from 10ms to 0ms. I want to surface any timing
sensitivity in my tests NOW, on the current version, so nothing
surprises me on upgrade day.

Background — keystrokeDelay has three levels of precedence
(each overrides the one above):
  1. Global:      Cypress.Keyboard.defaults({ keystrokeDelay: N })
                  in a support file
  2. Suite/test:  describe('...', { keystrokeDelay: N }, () => {})
                  it('...', { keystrokeDelay: N }, () => {})
  3. Per-command: cy.type('text', { delay: N })

IMPORTANT — why setting keystrokeDelay: 0 in cypress.config does NOT
work on the current Cypress version:
cy.type() resolves its delay as: `config('keystrokeDelay') || Keyboard.getConfig().keystrokeDelay`

The ONLY reliable way to get true 0ms behavior today is via Keyboard.defaults().
(v16 fixes this and the config setting will work correctly post-upgrade.)

Step 1: Search all files for Cypress.Keyboard.defaults( and report any
existing keystrokeDelay value. Also check cypress.config for a top-level
keystrokeDelay entry and flag it if found.

For each instance found, suggest setting it to 0 and note that setting
keystrokeDelay inside a spec file will affect downstream specs unless it
is reset after the spec completes.

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
