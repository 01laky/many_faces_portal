import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../config/env', () => ({
  env: { apiUrl: 'http://test-api', defaultFacePrefix: 'public' },
}));

import {
  listChatRooms,
  getChatRoom,
  createChatRoom,
  joinPublicChatRoom,
  requestJoinChatRoom,
  getChatRoomMessages,
} from '../ChatRoomsService';

describe('ChatRoomsService', () => {
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

  it('listChatRooms should GET faces/{id}/chat-rooms with bearer', async () => {
    const fetchMock = vi.mocked(fetch);
    await listChatRooms(7, token);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(
      /^http:\/\/test-api\/public\/api\/faces\/7\/chat-rooms\?page=1&pageSize=10$/
    );
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer t1');
  });

  it('getChatRoom should GET single room', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    await getChatRoom(7, 99, token);
    expect(fetchMock.mock.calls[0][0]).toBe('http://test-api/public/api/faces/7/chat-rooms/99');
  });

  it('createChatRoom should POST body', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 5 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    await createChatRoom(7, token, { title: 'A', description: null, isPublic: false });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      title: 'A',
      description: null,
      isPublic: false,
    });
  });

  it('joinPublicChatRoom should POST join', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    await joinPublicChatRoom(7, 3, token);
    expect(fetchMock.mock.calls[0][0]).toBe('http://test-api/public/api/faces/7/chat-rooms/3/join');
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST');
  });

  it('requestJoinChatRoom should POST join-requests', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    await requestJoinChatRoom(7, 3, token);
    expect(fetchMock.mock.calls[0][0]).toBe('http://test-api/public/api/faces/7/chat-rooms/3/join-requests');
  });

  it('getChatRoomMessages should append query string', async () => {
    const fetchMock = vi.mocked(fetch);
    await getChatRoomMessages(7, 3, token, { pageSize: 25, beforeId: 100 });
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://test-api/public/api/faces/7/chat-rooms/3/messages?pageSize=25&beforeId=100'
    );
  });

  it('listChatRooms should throw on non-ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('nope', { status: 500 }));
    await expect(listChatRooms(1, token)).rejects.toThrow();
  });
});
