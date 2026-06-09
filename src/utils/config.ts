import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';
import yaml from 'js-yaml';

export type LLMProvider = 'claude' | 'gemini' | 'none';

export interface LearnConfig {
  anthropicApiKey: string;
  geminiApiKey: string;
  llmProvider: LLMProvider;
  editor: string;
  model: string;
  maxConcurrentTranscriptions: number;
  projectRoot: string;
}

/**
 * Find the project root by walking up from cwd looking for package.json
 * with our project name, or fall back to cwd.
 */
function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== '/') {
    const pkgPath = resolve(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        if (pkg.name === 'learning-ai') return dir;
      } catch {
        // Not valid JSON, keep searching
      }
    }
    dir = resolve(dir, '..');
  }
  return process.cwd();
}

/**
 * Determine which LLM provider to use based on available API keys
 * and explicit configuration.
 */
function resolveProvider(
  explicitProvider: string | undefined,
  anthropicKey: string,
  geminiKey: string
): LLMProvider {
  // Explicit override takes precedence
  if (explicitProvider === 'claude' || explicitProvider === 'gemini' || explicitProvider === 'none') {
    return explicitProvider;
  }

  // Auto-detect based on available keys
  if (anthropicKey) return 'claude';
  if (geminiKey) return 'gemini';
  return 'none';
}

/**
 * Get the default model name for a given provider.
 */
function defaultModel(provider: LLMProvider): string {
  switch (provider) {
    case 'claude': return 'claude-sonnet-4-6';
    case 'gemini': return 'gemini-2.5-flash';
    case 'none': return '';
  }
}

/**
 * Load configuration from .env and optional learn.yaml
 */
export function loadConfig(): LearnConfig {
  const projectRoot = findProjectRoot();

  // Load .env from project root
  loadDotenv({ path: resolve(projectRoot, '.env') });

  // Load optional learn.yaml
  let yamlConfig: Record<string, unknown> = {};
  const yamlPath = resolve(projectRoot, 'learn.yaml');
  if (existsSync(yamlPath)) {
    try {
      const content = readFileSync(yamlPath, 'utf-8');
      yamlConfig = (yaml.load(content) as Record<string, unknown>) ?? {};
    } catch {
      // Invalid YAML, use defaults
    }
  }

  const defaults = (yamlConfig.defaults ?? {}) as Record<string, unknown>;

  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? '';
  const geminiKey = process.env.GEMINI_API_KEY ?? '';
  const explicitProvider = (defaults.provider as string) ?? process.env.LLM_PROVIDER;

  const provider = resolveProvider(explicitProvider, anthropicKey, geminiKey);

  if (provider === 'none') {
    // Not an error — transcribe-only mode is valid
  }

  return {
    anthropicApiKey: anthropicKey,
    geminiApiKey: geminiKey,
    llmProvider: provider,
    editor: (defaults.editor as string) ?? process.env.EDITOR ?? 'code',
    model: (defaults.model as string) ?? defaultModel(provider),
    maxConcurrentTranscriptions: (defaults.max_concurrent_transcriptions as number) ?? 2,
    projectRoot,
  };
}
