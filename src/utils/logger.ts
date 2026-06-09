import chalk from 'chalk';

/**
 * Log an info message with a blue prefix.
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Log a success message with a green checkmark.
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Log a warning message with a yellow exclamation.
 */
export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Log an error message with a red X.
 */
export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

/**
 * Log a step in a pipeline with a numbered prefix.
 */
export function step(num: number, total: number, message: string): void {
  const prefix = chalk.dim(`[${num}/${total}]`);
  console.log(prefix, message);
}

/**
 * Log a progress message with a spinner-like prefix.
 */
export function progress(message: string): void {
  console.log(chalk.cyan('→'), message);
}

/**
 * Log a debug message (only when DEBUG env var is set).
 */
export function debug(message: string): void {
  if (process.env.DEBUG) {
    console.log(chalk.dim('  debug:'), chalk.dim(message));
  }
}

/**
 * Format duration in seconds to human-readable string.
 */
export function formatDuration(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format a status value with appropriate color.
 */
export function formatStatus(status: string): string {
  switch (status) {
    case 'completed': return chalk.green('✓');
    case 'partial': return chalk.yellow('◐');
    case 'error': return chalk.red('✗');
    case 'pending': return chalk.dim('⏳');
    case 'transcribing': return chalk.cyan('⟳');
    case 'analyzing': return chalk.magenta('⟳');
    default: return chalk.dim('?');
  }
}
