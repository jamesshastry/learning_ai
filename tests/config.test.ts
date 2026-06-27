/**
 * Config and HTTP utility tests.
 *
 * Tests the configuration loading logic and HTTP helper functions.
 */
import { describe, it, expect } from 'vitest';
import { defaultModel } from '../src/utils/config.js';

// ── defaultModel ───────────────────────────────────────────────────

describe('defaultModel', () => {
  it('returns claude model for claude provider', () => {
    expect(defaultModel('claude')).toBe('claude-sonnet-4-6');
  });

  it('returns gemini model for gemini provider', () => {
    expect(defaultModel('gemini')).toBe('gemini-2.5-flash');
  });

  it('returns empty string for none provider', () => {
    expect(defaultModel('none')).toBe('');
  });
});
