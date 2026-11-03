export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

export function getExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot).toLowerCase() : '';
}

export function baseName(name: string): string {
  const stripped = name.replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|\s]+/g, '_');
  return stripped || 'document';
}

export function withSuffix(filename: string, suffix: string, ext = 'pdf'): string {
  return `${baseName(filename)}-${suffix}.${ext}`;
}
