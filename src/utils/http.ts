import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';

const USAGE_DIR = resolve(homedir(), '.learning-ai');
const USAGE_FILE = resolve(USAGE_DIR, 'usage.json');

interface UsageData {
  date: string;
  transcriptions: number;
  questions: number;
}

/**
 * Parse Server-Sent Events from a readable stream.
 * Yields events as { event, data } pairs.
 */
export async function* parseSSE(
  response: Response
): AsyncGenerator<{ event: string; data: string }> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = 'message';
  let currentData = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        // Per SSE spec: strip at most one leading space after the colon
        currentEvent = line.startsWith('event: ') ? line.slice(7) : line.slice(6);
      } else if (line.startsWith('data:')) {
        // Per SSE spec: strip at most one leading space after the colon
        const value = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
        currentData += (currentData ? '\n' : '') + value;
      } else if (line === '') {
        // Empty line marks end of an event
        if (currentData) {
          yield { event: currentEvent, data: currentData };
        }
        currentEvent = 'message';
        currentData = '';
      }
    }
  }

  // Process any remaining content in buffer as a final line
  if (buffer) {
    if (buffer.startsWith('event:')) {
      currentEvent = buffer.startsWith('event: ') ? buffer.slice(7) : buffer.slice(6);
    } else if (buffer.startsWith('data:')) {
      const value = buffer.startsWith('data: ') ? buffer.slice(6) : buffer.slice(5);
      currentData += (currentData ? '\n' : '') + value;
    }
  }

  // Flush any remaining data
  if (currentData) {
    yield { event: currentEvent, data: currentData };
  }
}

/**
 * Fetch a URL with automatic redirect following and timeout.
 */
export async function fetchWithRedirects(
  url: string,
  options: RequestInit = {},
  maxRedirects = 5
): Promise<Response> {
  let currentUrl = url;
  let redirects = 0;

  while (redirects < maxRedirects) {
    const response = await fetch(currentUrl, {
      ...options,
      redirect: 'manual',
      signal: options.signal ?? AbortSignal.timeout(30000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`Redirect without location header from ${currentUrl}`);

      // Handle relative redirects
      currentUrl = location.startsWith('http')
        ? location
        : new URL(location, currentUrl).toString();
      redirects++;
      continue;
    }

    return response;
  }

  throw new Error(`Too many redirects (${maxRedirects}) for ${url}`);
}

/**
 * Get today's date as YYYY-MM-DD.
 */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Load usage data for today. Returns default if no data for today.
 */
function loadUsage(): UsageData {
  if (!existsSync(USAGE_FILE)) {
    return { date: today(), transcriptions: 0, questions: 0 };
  }

  try {
    const data = JSON.parse(readFileSync(USAGE_FILE, 'utf-8')) as UsageData;
    if (data.date !== today()) {
      // New day, reset counters
      return { date: today(), transcriptions: 0, questions: 0 };
    }
    return data;
  } catch {
    return { date: today(), transcriptions: 0, questions: 0 };
  }
}

/**
 * Save usage data.
 */
function saveUsage(data: UsageData): void {
  if (!existsSync(USAGE_DIR)) {
    mkdirSync(USAGE_DIR, { recursive: true });
  }
  writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Record a transcription use. Returns the remaining count.
 */
export function recordTranscription(): number {
  const usage = loadUsage();
  usage.transcriptions++;
  saveUsage(usage);
  return 50 - usage.transcriptions;
}

/**
 * Check if transcription rate limit has been reached.
 */
export function isRateLimited(): boolean {
  const usage = loadUsage();
  return usage.transcriptions >= 50;
}

/**
 * Get current usage stats.
 */
export function getUsage(): UsageData {
  return loadUsage();
}
