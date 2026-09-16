# Model Context Protocol Definitions

This directory contains the MCP configuration for each agent type - unfortunately different agents use different syntax for certain things like environment variable interpolation, so it ends up being a bit duplicative.

These MCP definitions default to use OAuth - you can instead use a Personal Access Token (PAT) by following instructions [here](https://docs.cypress.io/cloud/integrations/cloud-mcp#Configure-AI-Assistant).

Use the first-class installer for your agent when one exists, instead of copying these JSON files:

| Tool | When to use |
| --- | --- |
| [Cypress Claude Connector](https://docs.cypress.io/cloud/integrations/cloud-mcp#Claude-Desktop) | For Claude Desktop app users |
| [Cypress Cursor Plugin](../README.md#plugin) | For Cursor users |
| [Cypress VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Cypress-io.vscode-cypress-cloud-mcp) | For VS Code users |

Extension source: [`../vscode-cloud-mcp`](../vscode-cloud-mcp/).
