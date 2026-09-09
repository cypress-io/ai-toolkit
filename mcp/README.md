# Model Context Protocol Definitions

This directory contains the MCP configuration for each agent type - unfortunately different agents use different syntax for certain things like environment variable interpolation, so it ends up being a bit duplicative.

These MCP definitions default to use OAuth - you can instead use a Personal Access Token (PAT) by following instructions [here](https://docs.cypress.io/cloud/integrations/cloud-mcp#Configure-AI-Assistant).

For VS Code and GitHub Copilot, use the [Cypress Cloud MCP Integration](../vscode-cloud-mcp/README.md) extension instead of copying these JSON files.
