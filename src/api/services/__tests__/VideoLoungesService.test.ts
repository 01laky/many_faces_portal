import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../config/env', () => ({
  env: { apiUrl: 'http://test-api', defaultFacePrefix: 'public' },
}));

import {
  listVideoLounges,
  getVideoLounge,
  createVideoLounge,
  joinPublicVideoLounge,
  joinVideoLoungeLive,
  leaveVideoLoungeLive,
  heartbeatVideoLoungeLive,
  refreshVideoLoungeLiveToken,
  startVideoLoungeLive,
  getVideoLoungeLive,
  VideoLoungeApiError,
} from '../VideoLoungesService';

describe('VideoLoungesService', () => {
  const token = 't1';

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        )
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('VL-FE-04: listVideoLounges GET faces/{id}/video-lounges with bearer', async () => {
    const fetchMock = vi.mocked(fetch);
    await listVideoLounges(7, token);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(
      /^http:\/\/test-api\/public\/api\/faces\/7\/video-lounges\?page=1&pageSize=10$/
    );
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer t1');
  });

  it('VL-FE-03: joinVideoLoungeLive POST body joinMode', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          sessionId: 1,
          joinMode: 'Listener',
          token: 'x',
          serverUrl: 'wss://x',
          roomName: 'r',
          isStub: true,
          expiresAtUtc: new Date().toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    await joinVideoLoungeLive(7, 3, token, 'Listener');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://test-api/public/api/faces/7/video-lounges/3/live/join'
    );
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ joinMode: 'Listener' });
  });

  it('VL-FE-21: joinVideoLoungeLive throws VideoLoungeApiError on 409', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Room is full' }), { status: 409 })
    );
    await expect(joinVideoLoungeLive(1, 2, token, 'Full')).rejects.toMatchObject({
      status: 409,
      name: 'VideoLoungeApiError',
    });
  });

  it('VL-FE-18: leaveVideoLoungeLive POST live/leave', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ left: true }), { status: 200 }));
    await leaveVideoLoungeLive(7, 3, token);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://test-api/public/api/faces/7/video-lounges/3/live/leave'
    );
  });

  it('VL-FE-19: refreshVideoLoungeLiveToken POST refresh-token', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          token: 'n',
          serverUrl: 'wss://',
          roomName: 'r',
          isStub: true,
          expiresAtUtc: new Date().toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    await refreshVideoLoungeLiveToken(7, 3, token, 'Viewer');
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://test-api/public/api/faces/7/video-lounges/3/live/refresh-token'
    );
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toEqual({
      joinMode: 'Viewer',
    });
  });

  it('getVideoLoungeLive GET live roster', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          hasLiveSession: true,
          liveParticipantCount: 1,
          liveViewerCount: 0,
          liveSpeakerCount: 1,
          liveParticipants: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    const snap = await getVideoLoungeLive(7, 3, token);
    expect(snap.hasLiveSession).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://test-api/public/api/faces/7/video-lounges/3/live'
    );
  });

  it('startVideoLoungeLive POST live/start', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ sessionId: 9 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    await startVideoLoungeLive(7, 3, token);
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST');
  });

  it('heartbeatVideoLoungeLive POST live/heartbeat', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await heartbeatVideoLoungeLive(7, 3, token);
    expect(fetchMock.mock.calls[0][0]).toContain('/live/heartbeat');
  });

  it('createVideoLounge POST with maxParticipants', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 5 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    await createVideoLounge(7, token, {
      title: 'L',
      isPublic: true,
      maxParticipants: 12,
    });
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string).maxParticipants).toBe(
      12
    );
  });

  it('getVideoLounge GET single lounge', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    await getVideoLounge(7, 99, token);
    expect(fetchMock.mock.calls[0][0]).toBe('http://test-api/public/api/faces/7/video-lounges/99');
  });

  it('joinPublicVideoLounge POST join', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    await joinPublicVideoLounge(7, 3, token);
    expect(fetchMock.mock.calls[0][0]).toBe('http://test-api/public/api/faces/7/video-lounges/3/join');
  });
});
