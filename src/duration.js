function formatDuration(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(
      `formatDuration: expected a finite number, received ${String(value)}`,
    );
  }

  if (value < 0) {
    throw new TypeError(
      `formatDuration: expected a non-negative number, received ${value}`,
    );
  }

  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }

  return `${seconds}s`;
}

module.exports = { formatDuration };
