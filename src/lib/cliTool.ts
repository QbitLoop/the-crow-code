// CLI Tool for THE.CROW.CODE
// This module provides functions to generate installation commands

export interface CLIOptions {
  global?: boolean;
  projectPath?: string;
  tool?: 'claude' | 'cursor' | 'codex' | 'generic';
}

// Generate skill installation command
export function generateSkillInstallCommand(
  skillName: string,
  githubUrl: string,
  options: CLIOptions = {}
): string {
  const { global = false, tool = 'claude' } = options;
  
  const toolPaths: Record<string, string> = {
    claude: global ? '~/.claude/skills' : '.claude/skills',
    cursor: global ? '~/.cursor/skills' : '.cursor/skills',
    codex: global ? '~/.codex/skills' : '.codex/skills',
    generic: global ? '~/.ai/skills' : '.ai/skills'
  };

  const targetPath = toolPaths[tool] || toolPaths.claude;
  const repoName = githubUrl.split('/').pop()?.replace('.git', '') || skillName;

  return `mkdir -p ${targetPath} && cd ${targetPath} && git clone ${githubUrl} ${repoName}`;
}

// Generate MCP server installation command
export function generateMCPInstallCommand(
  serverName: string,
  installType: 'npm' | 'pip' | 'docker' | 'binary',
  packageName?: string
): string {
  const pkg = packageName || serverName;

  switch (installType) {
    case 'npm':
      return `npm install -g ${pkg}`;
    case 'pip':
      return `pip install ${pkg}`;
    case 'docker':
      return `docker pull ${pkg}`;
    case 'binary':
      return `curl -fsSL https://install.${pkg}.dev | sh`;
    default:
      return `npm install -g ${pkg}`;
  }
}

// Generate tool installation command
export function generateToolInstallCommand(
  toolName: string,
  platform: 'macos' | 'linux' | 'windows'
): string {
  const commands: Record<string, Record<string, string>> = {
    cursor: {
      macos: 'brew install --cask cursor',
      linux: 'curl -fsSL https://download.cursor.sh/install.sh | sh',
      windows: 'winget install Cursor.Cursor'
    },
    windsurf: {
      macos: 'brew install --cask windsurf',
      linux: 'curl -fsSL https://codeium.com/windsurf/install.sh | sh',
      windows: 'winget install Codeium.Windsurf'
    },
    ollama: {
      macos: 'brew install ollama',
      linux: 'curl -fsSL https://ollama.com/install.sh | sh',
      windows: 'winget install Ollama.Ollama'
    },
    claude: {
      macos: 'npm install -g @anthropic-ai/claude-code',
      linux: 'npm install -g @anthropic-ai/claude-code',
      windows: 'npm install -g @anthropic-ai/claude-code'
    }
  };

  return commands[toolName]?.[platform] || `# Install ${toolName} from official website`;
}

// Generate full setup script
export function generateSetupScript(skills: string[], mcpServers: string[]): string {
  const skillCommands = skills.map(skill => 
    `echo "Installing skill: ${skill}"`
  ).join('\n');

  const mcpCommands = mcpServers.map(server => 
    `echo "Installing MCP server: ${server}"`
  ).join('\n');

  return `#!/bin/bash
# THE.CROW.CODE Setup Script
# Generated setup script for your AI development environment

set -e

echo "THE.CROW.CODE - Setup Script"
echo "================================"

# Create directories
mkdir -p ~/.claude/skills
mkdir -p ~/.cursor/skills
mkdir -p ~/.mcp

# Install Skills
echo ""
echo "Installing Skills..."
${skillCommands}

# Install MCP Servers
echo ""
echo "Installing MCP Servers..."
${mcpCommands}

echo ""
echo "Setup complete!"
echo "Restart your AI coding tool to load the new skills."
`;
}

// Copy command to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Detect user's platform
export function detectPlatform(): 'macos' | 'linux' | 'windows' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  return 'linux';
}

// Detect installed AI tools
export function detectInstalledTools(): string[] {
  // This would ideally check for installed tools
  // For now, return common tools
  return ['claude', 'cursor', 'vscode'];
}

// CLI Command Builder Class
export class CLICommandBuilder {
  private commands: string[] = [];

  addSkillInstall(skillName: string, githubUrl: string, options?: CLIOptions): this {
    this.commands.push(generateSkillInstallCommand(skillName, githubUrl, options));
    return this;
  }

  addMCPInstall(serverName: string, installType: 'npm' | 'pip' | 'docker' | 'binary', packageName?: string): this {
    this.commands.push(generateMCPInstallCommand(serverName, installType, packageName));
    return this;
  }

  addToolInstall(toolName: string, platform?: 'macos' | 'linux' | 'windows'): this {
    const plat = platform || detectPlatform();
    this.commands.push(generateToolInstallCommand(toolName, plat));
    return this;
  }

  addComment(comment: string): this {
    this.commands.push(`# ${comment}`);
    return this;
  }

  addEmptyLine(): this {
    this.commands.push('');
    return this;
  }

  build(): string {
    return this.commands.join('\n');
  }

  buildScript(): string {
    return `#!/bin/bash\nset -e\n\n${this.commands.join('\n')}`;
  }
}

// Export default CLI tool functions
export default {
  generateSkillInstallCommand,
  generateMCPInstallCommand,
  generateToolInstallCommand,
  generateSetupScript,
  copyToClipboard,
  detectPlatform,
  detectInstalledTools,
  CLICommandBuilder
};
