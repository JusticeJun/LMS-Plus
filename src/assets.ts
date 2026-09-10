// Resolve packaged images without requiring new extension permissions.
// In the local preview Vite serves the same assets directly.
export function assetUrl(path: string): string {
  const runtime = (
    globalThis as typeof globalThis & {
      chrome?: { runtime?: { getURL: (path: string) => string } };
    }
  ).chrome?.runtime;
  return runtime ? runtime.getURL(path.replace(/^\//, '')) : path;
}
