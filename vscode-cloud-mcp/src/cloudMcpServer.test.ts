import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  DOCS_URL,
  MCP_SERVER_LIST_COMMAND,
  PRODUCTION_MCP_URL,
  SERVER_PROVIDER_ID,
} from './cloudMcpServer'

describe('production endpoint', () => {
  it('is the hosted Cypress Cloud MCP endpoint', () => {
    assert.equal(PRODUCTION_MCP_URL, 'https://mcp.cypress.io/mcp')
  })

  it('uses stable identifiers for provider discovery and connection', () => {
    assert.equal(SERVER_PROVIDER_ID, 'cypress-cloud-mcp')
    assert.equal(MCP_SERVER_LIST_COMMAND, 'workbench.mcp.listServer')
  })

  it('uses the Cypress-managed documentation shortlink', () => {
    assert.equal(DOCS_URL, 'https://on.cypress.io/cloud-mcp')
  })
})
