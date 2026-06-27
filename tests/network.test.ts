/**
 * Network-dependent function tests — fetch-mocked, zero dependencies.
 *
 * Uses vi.fn() to mock globalThis.fetch for:
 * - parseSSE: Server-Sent Events parsing
 * - fetchWithRedirects: manual redirect following
 * - detectDuration: YouTube page scraping for video duration
 * - transcribeVideo: cache check → SSE transcription flow
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseSSE, fetchWithRedirects } from '../src/utils/http.js';
import { detectDuration } from '../src/pipeline/duration.js';

// ── Helpers ────────────────────────────────────────────────────────

/** Build a fake Response with a ReadableStream body from text chunks */
function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  let i = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]));
        i++;
      } else {
        controller.close();
      }
    },
  });
  return new Response(stream);
}

/** Build a minimal Response for fetch mocking */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function textResponse(text: string, status = 200): Response {
  return new Response(text, { status });
}

function redirectResponse(location: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: { Location: location },
  });
}

// ── parseSSE ───────────────────────────────────────────────────────

describe('parseSSE', () => {
  it('parses a single event', async () => {
    const response = sseResponse([
      'event: done\ndata: {"result": true}\n\n',
    ]);

    const events: Array<{ event: string; data: string }> = [];
    for await (const e of parseSSE(response)) events.push(e);

    expect(events.length).toBe(1);
    expect(events[0].event).toBe('done');
    expect(JSON.parse(events[0].data)).toEqual({ result: true });
  });

  it('parses multiple events', async () => {
    const response = sseResponse([
      'event: validating\ndata: {}\n\n',
      'event: transcribing\ndata: {}\n\n',
      'event: done\ndata: {"title":"Test"}\n\n',
    ]);

    const events: Array<{ event: string; data: string }> = [];
    for await (const e of parseSSE(response)) events.push(e);

    expect(events.length).toBe(3);
    expect(events.map(e => e.event)).toEqual(['validating', 'transcribing', 'done']);
  });

  it('handles events split across chunks', async () => {
    // The event is split: first chunk has the event line, second has the data
    const response = sseResponse([
      'event: done\n',
      'data: {"ok":true}\n\n',
    ]);

    const events: Array<{ event: string; data: string }> = [];
    for await (const e of parseSSE(response)) events.push(e);

    expect(events.length).toBe(1);
    expect(events[0].event).toBe('done');
  });

  it('handles multi-line data fields', async () => {
    const response = sseResponse([
      'event: message\ndata: line1\ndata: line2\n\n',
    ]);

    const events: Array<{ event: string; data: string }> = [];
    for await (const e of parseSSE(response)) events.push(e);

    expect(events.length).toBe(1);
    expect(events[0].data).toBe('line1\nline2');
  });

  it('defaults to "message" event type', async () => {
    const response = sseResponse([
      'data: hello\n\n',
    ]);

    const events: Array<{ event: string; data: string }> = [];
    for await (const e of parseSSE(response)) events.push(e);

    expect(events[0].event).toBe('message');
  });

  it('flushes trailing data without final newline', async () => {
    const response = sseResponse([
      'event: final\ndata: leftover',
    ]);

    const events: Array<{ event: string; data: string }> = [];
    for await (const e of parseSSE(response)) events.push(e);

    expect(events.length).toBe(1);
    expect(events[0].data).toBe('leftover');
  });

  it('skips empty data events', async () => {
    const response = sseResponse([
      'event: ping\n\n',        // empty data → skipped
      'event: done\ndata: ok\n\n',
    ]);

    const events: Array<{ event: string; data: string }> = [];
    for await (const e of parseSSE(response)) events.push(e);

    expect(events.length).toBe(1);
    expect(events[0].event).toBe('done');
  });
});

// ── fetchWithRedirects ─────────────────────────────────────────────

describe('fetchWithRedirects', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns response on 200', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));

    const res = await fetchWithRedirects('https://example.com/api');
    const data = await res.json();
    expect(data).toEqual({ ok: true });
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
  });

  it('follows redirects up to maxRedirects', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(redirectResponse('https://example.com/step2'))
      .mockResolvedValueOnce(redirectResponse('https://example.com/step3'))
      .mockResolvedValueOnce(jsonResponse({ final: true }));

    const res = await fetchWithRedirects('https://example.com/start');
    const data = await res.json();
    expect(data).toEqual({ final: true });
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(3);
  });

  it('throws on too many redirects', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValue(redirectResponse('https://example.com/loop'));

    await expect(fetchWithRedirects('https://example.com/start', {}, 3))
      .rejects.toThrow('Too many redirects');
  });

  it('handles relative redirect URLs', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(redirectResponse('/relative/path'))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const res = await fetchWithRedirects('https://example.com/start');
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(2);
    // Second call should resolve to absolute URL
    const secondUrl = vi.mocked(globalThis.fetch).mock.calls[1][0];
    expect(secondUrl).toBe('https://example.com/relative/path');
  });
});

// ── detectDuration ─────────────────────────────────────────────────

describe('detectDuration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('extracts duration from ytInitialPlayerResponse', async () => {
    const fakeHtml = `<html><script>var ytInitialPlayerResponse = {"videoDetails":{"lengthSeconds":"3600"}};</script></html>`;
    globalThis.fetch = vi.fn().mockResolvedValue(textResponse(fakeHtml));

    const duration = await detectDuration('test123');
    expect(duration).toBe(3600);
  });

  it('uses fallback regex when ytInitialPlayerResponse is missing', async () => {
    const fakeHtml = `<html><script>var config = {"lengthSeconds":"1800","other":"data"};</script></html>`;
    globalThis.fetch = vi.fn().mockResolvedValue(textResponse(fakeHtml));

    const duration = await detectDuration('test123');
    expect(duration).toBe(1800);
  });

  it('returns null when page has no duration data', async () => {
    const fakeHtml = `<html><body>No video data here</body></html>`;
    globalThis.fetch = vi.fn().mockResolvedValue(textResponse(fakeHtml));

    const duration = await detectDuration('test123');
    expect(duration).toBeNull();
  });

  it('returns null on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(textResponse('Not Found', 404));

    const duration = await detectDuration('test123');
    expect(duration).toBeNull();
  });

  it('returns null on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const duration = await detectDuration('test123');
    expect(duration).toBeNull();
  });

  it('parses the correct video URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(textResponse('<html></html>'));

    await detectDuration('dQw4w9WgXcQ');
    const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
    expect(calledUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
});
