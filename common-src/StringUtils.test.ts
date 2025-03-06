import { randomShortUUID, buildAudioUrlWithTracking, removeHostFromUrl } from "./StringUtils";

describe('StringUtils', () => {
  test('randomShortUUID', () => {
    expect(randomShortUUID().length).toBe(11);
    expect(randomShortUUID(20).length).toBe(20);
  });

  test('buildAudioUrlWithTracking', () => {
    const audioUrl: string = 'https://www.audio.com/audio.mp3';
    let trackingUrls: string[] = [
      'http://firsturl.com/123',
      'https://secondurl.com/abc/',
      'https://thridurl.com/aaa/bbb',
      'www.noprotocal.com/asdfsad',
    ];
    const finalUrl: string = 'https://firsturl.com/123/secondurl.com/abc/thridurl.com/aaa/bbb/www.noprotocal.com/asdfsad/www.audio.com/audio.mp3';
    expect(buildAudioUrlWithTracking(audioUrl, trackingUrls)).toBe(finalUrl);

    trackingUrls = [];
    expect(buildAudioUrlWithTracking(audioUrl, trackingUrls)).toBe(audioUrl);

    trackingUrls = ['http://firsturl.com/123/'];
    expect(buildAudioUrlWithTracking(audioUrl, trackingUrls)).toBe("https://firsturl.com/123/www.audio.com/audio.mp3");

    trackingUrls = [''];
    expect(buildAudioUrlWithTracking(audioUrl, trackingUrls)).toBe(audioUrl);
  });

  test('removeHostFromUrl', () => {
    const url: string = 'https://www.audio.com/project/hello/audio.mp3';
    expect(removeHostFromUrl(url)).toBe('project/hello/audio.mp3');
    const badUrl: string = 'asfafffaf';
    expect(removeHostFromUrl(badUrl)).toBe(badUrl);
  });
});