// v14: the cypress/react18 harness merged into cypress/react, and React <18 is unsupported
import { mount } from 'cypress/react18'

Cypress.Commands.add('mount', mount)
