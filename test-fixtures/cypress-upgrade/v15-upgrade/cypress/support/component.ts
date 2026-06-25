// Angular component-testing harness. Angular 17 + zone.js 0.13 (from package.json)
// are below the v15 minimums (Angular 18.0.0+, zone.js 0.14.0+).
import { mount } from 'cypress/angular'

Cypress.Commands.add('mount', mount)
