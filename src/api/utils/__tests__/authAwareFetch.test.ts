import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authAwareFetch } from '../authAwareFetch';

describe('authAwareFetch', () => {
  const fetchMock = vi.fn();
  const dispatchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    dispatchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    const storage = {
      getItem: vi.fn(() => 'stored-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', storage as unknown as Storage);
    vi.stubGlobal('window', { dispatchEvent: dispatchMock } as unknown as Window);
    fetchMock.mockResolvedValue(new Response('ok', { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns fetch response unchanged on success', async () => {
    const res = await authAwareFetch('https://api.test/x', { method: 'GET' });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/x', { method: 'GET' });
  });

  it('dispatches auth:unauthorized on 401 when token option and stored token exist', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));

    await authAwareFetch('https://api.test/x', { token: 'jwt-1' });

    expect(dispatchMock).toHaveBeenCalledOnce();
    const event = dispatchMock.mock.calls[0]![0] as CustomEvent;
    expect(event.type).toBe('auth:unauthorized');
  });

  it('does not dispatch when 401 but no token option', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));

    await authAwareFetch('https://api.test/x', {});

    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('does not dispatch when local storage has no auth_token', async () => {
    vi.mocked(localStorage.getItem).mockReturnValueOnce(null);
    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));

    await authAwareFetch('https://api.test/x', { token: 'jwt-1' });

    expect(dispatchMock).not.toHaveBeenCalled();
  });
});
