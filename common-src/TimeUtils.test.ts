import { describe, expect, test } from '@jest/globals';
import { datetimeLocalStringToMs, msToDatetimeLocalString, humanizeMs } from "./TimeUtils";

describe('TimeUtils', () => {
  test('datetimeStringToMs', () => {
    const dtStr: string = '2022-10-31T18:49';
    const dtMs: number = 1667242140000;
    expect(datetimeLocalStringToMs(dtStr)).toBe(dtMs);
    expect(msToDatetimeLocalString(dtMs)).toBe(dtStr);
  });

  test('humanizeMs', () => {
    const ms: number = 1676508181000;
    // XXX: we don't know the timezone of the CI server.
    // const noTimezoneStr = 'Wed Feb 15 2023';
    expect(humanizeMs(ms).indexOf('2023') !== -1).toBe(true);

    const timezone: string = 'Europe/Paris';
    const timezoneStr: string = 'Thu Feb 16 2023';
    expect(humanizeMs(ms, timezone)).toBe(timezoneStr);
  });
});