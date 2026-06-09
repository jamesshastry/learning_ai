import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import yaml from 'js-yaml';

/**
 * Read a YAML file and parse it. Returns undefined if file doesn't exist.
 */
export function readYaml<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  const content = readFileSync(filePath, 'utf-8');
  return yaml.load(content) as T;
}

/**
 * Write an object as YAML to a file, creating directories as needed.
 */
export function writeYaml(filePath: string, data: unknown): void {
  ensureDir(dirname(filePath));
  const content = yaml.dump(data, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Read a text/markdown file. Returns undefined if file doesn't exist.
 */
export function readText(filePath: string): string | undefined {
  if (!existsSync(filePath)) return undefined;
  return readFileSync(filePath, 'utf-8');
}

/**
 * Write text to a file, creating directories as needed.
 */
export function writeText(filePath: string, content: string): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Read a JSON file. Returns undefined if file doesn't exist.
 */
export function readJson<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Write JSON to a file, creating directories as needed.
 */
export function writeJson(filePath: string, data: unknown): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Append a line to a file (creates the file if it doesn't exist).
 */
export function appendLine(filePath: string, line: string): void {
  ensureDir(dirname(filePath));
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
  const newContent = existing.endsWith('\n') || existing === ''
    ? existing + line + '\n'
    : existing + '\n' + line + '\n';
  writeFileSync(filePath, newContent, 'utf-8');
}

/**
 * Read all lines from a file, filtering out empty lines.
 */
export function readLines(filePath: string): string[] {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Build the path for a course directory.
 */
export function coursePath(projectRoot: string, courseName: string): string {
  return resolve(projectRoot, 'courses', courseName);
}

/**
 * Build the path for a lecture directory within a course.
 */
export function lecturePath(
  projectRoot: string,
  courseName: string,
  lectureId: string,
  slug: string
): string {
  const paddedId = lectureId.padStart(2, '0');
  return resolve(projectRoot, 'courses', courseName, 'lectures', `${paddedId}-${slug}`);
}
