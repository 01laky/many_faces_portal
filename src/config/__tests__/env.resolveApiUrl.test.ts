import { describe, it, expect } from 'vitest';
import { resolveApiUrl } from '../env';

describe('resolveApiUrl', () => {
  const fallback = 'https://localhost:8001';

  it('uses same origin on portal nginx HTTP port 9080 (LAN)', () => {
    expect(
      resolveApiUrl(fallback, true, {
        port: '9080',
        origin: 'http://172.20.10.14:9080',
      })
    ).toBe('http://172.20.10.14:9080');
  });

  it('uses same origin on portal nginx HTTPS port 9081', () => {
    expect(
      resolveApiUrl(fallback, true, {
        port: '9081',
        origin: 'https://172.20.10.14:9081',
      })
    ).toBe('https://172.20.10.14:9081');
  });

  it('keeps env fallback for direct Vite port 8081', () => {
    expect(
      resolveApiUrl(fallback, true, {
        port: '8081',
        origin: 'https://localhost:8081',
      })
    ).toBe(fallback);
  });
});
