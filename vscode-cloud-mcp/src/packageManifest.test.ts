import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

type PackageManifest = {
  activationEvents: string[]
  bugs?: { url?: string }
  contributes: {
    commands: Array<{ command: string }>
    configuration?: unknown
    mcpServerDefinitionProviders: Array<{ id: string; label: string }>
  }
  devDependencies: Record<string, string>
  displayName: string
  homepage: string
  license: string
  name: string
  publisher: string
  repository?: { url?: string; directory?: string }
  scripts: Record<string, string>
  version: string
}

const manifest = JSON.parse(
  readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
) as PackageManifest

describe('extension manifest', () => {
  it('uses the available Marketplace identity', () => {
    assert.equal(manifest.publisher, 'Cypress-io')
    assert.equal(manifest.name, 'cypress-cloud-mcp-integration')
    assert.equal(manifest.displayName, 'Cypress Cloud MCP Integration')
    assert.equal(manifest.version, '1.0.0')
    assert.equal(
      `${manifest.publisher}.${manifest.name}`,
      'Cypress-io.cypress-cloud-mcp-integration'
    )
  })

  it('contributes the MCP provider and connection command', () => {
    assert.deepEqual(manifest.activationEvents, ['onStartupFinished'])
    assert.deepEqual(manifest.contributes.mcpServerDefinitionProviders, [
      {
        id: 'cypress-cloud-mcp',
        label: 'Cypress Cloud',
      },
    ])
    assert.equal(
      manifest.contributes.commands.some(
        ({ command }) => command === 'cypressCloudMcp.connect'
      ),
      true
    )
  })

  it('does not expose authentication or endpoint configuration', () => {
    assert.equal(manifest.contributes.configuration, undefined)
    assert.equal(
      manifest.contributes.commands.some(({ command }) => {
        const normalized = command.toLowerCase()
        return normalized.includes('local') || normalized.includes('token')
      }),
      false
    )
    assert.equal(
      manifest.contributes.commands.some(({ command }) =>
        command.toLowerCase().includes('production')
      ),
      false
    )
  })

  it('uses Cypress-managed links and the public toolkit repository', () => {
    assert.equal(manifest.homepage, 'https://on.cypress.io/cloud-mcp')
    assert.equal(manifest.license, 'MIT')
    assert.equal(
      manifest.repository?.url,
      'https://github.com/cypress-io/ai-toolkit.git'
    )
    assert.equal(manifest.repository?.directory, 'vscode-cloud-mcp')
    assert.equal(
      manifest.bugs?.url,
      'https://github.com/cypress-io/ai-toolkit/issues'
    )
  })

  it('uses pinned build dependencies and Yarn-provided tooling', () => {
    assert.match(manifest.devDependencies['@types/vscode'], /^\d+\.\d+\.\d+$/)
    assert.match(manifest.devDependencies['@vscode/vsce'], /^\d+\.\d+\.\d+$/)
    assert.doesNotMatch(manifest.scripts.package, /\bnpx\b/)
  })
})
