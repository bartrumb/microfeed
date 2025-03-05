/**
 * Gets the base URL for the current window location
 * @returns The base URL including protocol, hostname, and port if present
 */
export function getPublicBaseUrl(): string {
  const { location } = window;
  let baseUrl = `${location.protocol}//${location.hostname}`;
  if (location.port !== '') {
    baseUrl = `${baseUrl}:${location.port}`;
  }
  return baseUrl;
}