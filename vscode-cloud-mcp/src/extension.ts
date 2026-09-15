// eslint-disable-next-line node/no-missing-import -- VS Code provides this module at runtime.
import * as vscode from 'vscode'
import {
  DOCS_URL,
  MCP_SERVER_LIST_COMMAND,
  PRODUCTION_MCP_URL,
  SERVER_LABEL,
  SERVER_PROVIDER_ID,
} from './cloudMcpServer'

const WELCOME_SHOWN_KEY = 'mcpProviderWelcomeShownV3'

const createServerDefinition = (): vscode.McpHttpServerDefinition =>
  new vscode.McpHttpServerDefinition(
    SERVER_LABEL,
    vscode.Uri.parse(PRODUCTION_MCP_URL)
  )

const markWelcomeShown = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  await context.globalState.update(WELCOME_SHOWN_KEY, true)
}

const openMcpServers = async (): Promise<void> => {
  await vscode.commands.executeCommand(MCP_SERVER_LIST_COMMAND)
}

const showWelcome = async (context: vscode.ExtensionContext): Promise<void> => {
  if (context.globalState.get(WELCOME_SHOWN_KEY)) {
    return
  }

  await markWelcomeShown(context)

  const connect = 'Connect'
  const choice = await vscode.window.showInformationMessage(
    'Connect Cypress Cloud MCP to make its tools available in Chat.',
    connect
  )

  if (choice === connect) {
    await openMcpServers()
  }
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider(SERVER_PROVIDER_ID, {
      provideMcpServerDefinitions: () => [createServerDefinition()],
      resolveMcpServerDefinition: (server) => server,
    }),
    vscode.commands.registerCommand('cypressCloudMcp.connect', async () => {
      await markWelcomeShown(context)
      await openMcpServers()
    }),
    vscode.commands.registerCommand('cypressCloudMcp.openDocs', async () => {
      await vscode.env.openExternal(vscode.Uri.parse(DOCS_URL))
    })
  )

  void showWelcome(context)
}

export function deactivate(): void {}
