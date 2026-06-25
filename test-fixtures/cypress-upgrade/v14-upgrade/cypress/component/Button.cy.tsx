import * as React from 'react'
import { Button } from './Button'

it('renders', () => {
  cy.mount(<Button label="Go" />)
  cy.get('button').should('have.text', 'Go')
})
