# Cypress Cloud MCP

Marketplace ID: [`Cypress-io.vscode-cypress-cloud-mcp`](https://marketplace.visualstudio.com/items?itemName=Cypress-io.vscode-cypress-cloud-mcp)

Connect to
[Cypress Cloud](https://on.cypress.io/cloud) through the [Cypress Cloud MCP](https://on.cypress.io/cloud-mcp) to give GitHub Copilot and other VS Code agents a window into your application's health and stability.

Cloud MCP gives your AI agent real-time access to your test results. It allows agents to query run statuses, identify flaky tests, and retrieve failure details—including Test Replay links—directly within your agentic workflow.

## Use Cypress Cloud MCP

After installing the extension:

1. Select **Connect** in the welcome message. You can also run
   **Cypress Cloud MCP: Connect** from the Command Palette.
2. Select **Cypress Cloud** from VS Code's MCP server list and start it.
3. Confirm VS Code's trust and sign-in prompts, then complete the Cypress Cloud
   browser sign-in.
4. Open Chat in VS Code and select agent mode.
5. Ask your agent to investigate Cypress Cloud data. For example: "Pull my last Cypress Cloud run for this branch."

The available tools return:

- Projects and recorded runs
- Failed and flaky tests
- Test Replay links
- Cypress Accessibility reports
- UI Coverage reports

Results are limited to the organizations and projects that your Cypress Cloud
account can access.

## Authentication

The extension contributes the server definition and delegates OAuth to VS Code.
VS Code manages the browser sign-in, access token, and refresh token through its
native MCP authentication flow.

The extension connects only to `https://mcp.cypress.io/mcp`. User and workspace
settings cannot redirect authentication to another server.

## Local development

This directory is a VS Code extension, not an MCP JSON definition, so it lives
next to `mcp/` rather than inside it. Open `vscode-cloud-mcp/` as the workspace
folder (or use the launch config in `.vscode/launch.json`) so
`--extensionDevelopmentPath` points at this package:

1. Run `yarn` and `yarn compile` in `vscode-cloud-mcp/`.
2. Press F5 (**Run Extension**) to launch an Extension Development Host.
3. In the new window, run **Cypress Cloud MCP: Connect** and start the
   **Cypress Cloud** MCP server.

## Build, pack, and release

Run these commands from `vscode-cloud-mcp/`. Yarn uses the pinned
`@vscode/vsce` in this package — do not call `npx vsce` or `yarn publish`
(that publishes to npm).

### Build

```sh
yarn
yarn compile
yarn test
```

`yarn watch` rebuilds on change. `yarn vscode:prepublish` also compiles, and
`vsce` runs it automatically before packing or publishing.

### Pack

Create a `.vsix` you can sideload without publishing:

```sh
yarn package
```

That writes `vscode-cypress-cloud-mcp-<version>.vsix` in this directory. The
`--no-dependencies` flag is required: this extension has no runtime
dependencies, and vsce would otherwise try to bundle `node_modules`.

Inspect the archive, then install it in a VS Code or Insiders window:

```sh
yarn vsce ls
code --install-extension ./vscode-cypress-cloud-mcp-<version>.vsix
```

`.vscodeignore` keeps TypeScript sources, tests, maps, and `node_modules` out
of the VSIX. The packaged extension runs from compiled `out/extension.js`.

### Release

Marketplace ID is `Cypress-io.vscode-cypress-cloud-mcp`. Do not change
`publisher` or `name` after the first publish — that creates a new listing
instead of updating this one.

1. Bump `version` in `package.json` (semver). The Marketplace rejects reuse of
   a version that was already published.
2. Run `yarn test`.
3. Pack and sideload the VSIX (`yarn package`) to confirm the Connect flow
   still works.
4. Publish with a token that can manage the `Cypress-io` publisher on the
   [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage):

```sh
yarn release
```

`yarn release` runs `vsce publish --no-dependencies`. vsce prompts for a
Personal Access Token unless you already ran `yarn vsce login Cypress-io` or
exported `VSCE_PAT`. Create the PAT in Azure DevOps with **Marketplace >
Manage** (see [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)).

To publish a VSIX you already packed:

```sh
yarn vsce publish --packagePath ./vscode-cypress-cloud-mcp-<version>.vsix
```

After publish, confirm the listing at
[Cypress-io.vscode-cypress-cloud-mcp](https://marketplace.visualstudio.com/items?itemName=Cypress-io.vscode-cypress-cloud-mcp)
shows the new version.

## Documentation

See the
[Cypress Cloud MCP documentation](https://on.cypress.io/cloud-mcp)
for supported tools, example prompts, and troubleshooting.
