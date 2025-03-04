/**
 * Converts milliseconds to a human-readable date string in the specified timezone
 * @param ms - Milliseconds since Unix epoch
 * @param timezone - Optional IANA timezone string (e.g., 'America/New_York')
 * @returns Date string in the format "Day Month Date Year"
 */
export function humanizeMs(ms: number, timezone: string | null = null): string {
  const date = new Date(ms);
  let newDate: Date;
  try {
    newDate = new Date(date.toLocaleDateString('en-US', { timeZone: timezone || undefined }));
  } catch (e) {
    newDate = date;
  }
  return newDate.toDateString();
}

/**
 * Converts seconds to HH:MM:SS format
 * @param seconds - Number of seconds
 * @returns Time string in HH:MM:SS format
 */
export function toHHMMSS(seconds: number): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substring(11, 19);
}

/**
 * Converts a datetime-local string to milliseconds
 * @param str - Datetime string in format "YYYY-MM-DDTHH:mm"
 * @returns Milliseconds since Unix epoch
 */
export function datetimeLocalStringToMs(str: string): number {
  return Date.parse(str);
}

/**
 * Converts milliseconds to datetime-local string
 * @param ms - Milliseconds since Unix epoch
 * @returns Datetime string in format "YYYY-MM-DDTHH:mm"
 */
export function msToDatetimeLocalString(ms: number): string {
  const dt = new Date(ms);
  return datetimeLocalToString(dt);
}

/**
 * Converts milliseconds to UTC string
 * @param ms - Milliseconds since Unix epoch
 * @returns UTC string in format "Day, DD Mon YYYY HH:mm:ss GMT"
 */
export function msToUtcString(ms: number): string {
  const dt = new Date(ms);
  return dt.toUTCString();
}

/**
 * Converts milliseconds to RFC3339 format
 * @param ms - Milliseconds since Unix epoch
 * @returns RFC3339 string (ISO 8601)
 */
export function msToRFC3339(ms: number): string {
  const dt = new Date(ms);
  return dt.toISOString();
}

/**
 * Converts RFC3339 string to milliseconds
 * @param str - RFC3339 string (ISO 8601)
 * @returns Milliseconds since Unix epoch
 */
export function rfc3399ToMs(str: string): number {
  const dt = new Date(str);
  return dt.getTime();
}

/**
 * Converts Date object to milliseconds
 * @param dt - Date object
 * @returns Milliseconds since Unix epoch
 */
export function datetimeLocalToMs(dt: Date): number {
  return dt.getTime();
}

/**
 * Converts Date object to datetime-local string
 * @param dt - Date object
 * @returns Datetime string in format "YYYY-MM-DDTHH:mm"
 */
export function datetimeLocalToString(dt: Date): string {
  // Create a new Date object to avoid modifying the original
  const newDt = new Date(dt);
  newDt.setMinutes(newDt.getMinutes() - newDt.getTimezoneOffset());
  return newDt.toISOString().slice(0, 16);
}