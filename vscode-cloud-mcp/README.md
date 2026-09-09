# Cypress Cloud MCP

Connect GitHub Copilot and other VS Code agents to
[Cypress Cloud](https://on.cypress.io/cloud-mcp) through the
Model Context Protocol (MCP).

This extension makes the hosted Cypress Cloud MCP server available directly in
VS Code. Your agent can investigate recorded test results without requiring you
to copy diagnostic information from Cypress Cloud.

## Use Cypress Cloud MCP

After installing the extension:

1. Select **Connect** in the welcome message. You can also run
   **Cypress Cloud MCP: Connect** from the Command Palette.
2. Select **Cypress Cloud** from VS Code's MCP server list and start it.
3. Confirm VS Code's trust and sign-in prompts, then complete the Cypress Cloud
   browser sign-in.
4. Open Chat in VS Code and select agent mode.
5. Ask your agent to investigate Cypress Cloud data. For example: "List my
   Cypress Cloud projects."

The available tools can inspect:

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

## Documentation

See the
[Cypress Cloud MCP documentation](https://on.cypress.io/cloud-mcp)
for supported tools, example prompts, and troubleshooting.
