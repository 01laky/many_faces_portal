import { describe, it, expect } from 'vitest';
import {
	resolveChatRoomMountMessages,
	resolveChatRoomMountRoom,
} from '@/pages/ChatRoomDetailPage/chatRoomMountLogic';
import type { FaceChatRoomDto, FaceChatRoomMessageDto } from '@/api/services/ChatRoomsService';

const roomMember = {
	id: 1,
	name: 'Room',
	isMember: true,
	isHostViewer: false,
	isPublic: true,
	memberCount: 2,
} as FaceChatRoomDto;

const roomGuest = { ...roomMember, isMember: false } as FaceChatRoomDto;

const msgs = [
	{ id: 1, senderId: 'a', senderName: 'A', content: 'Hi', sentAt: '2026-01-01T10:00:00Z' },
] as FaceChatRoomMessageDto[];

describe('chatRoomMountLogic (PT-RP10)', () => {
	it('PT-RP10-U1: member receives fulfilled messages', () => {
		expect(resolveChatRoomMountMessages(roomMember, { status: 'fulfilled', value: msgs })).toEqual(
			msgs
		);
	});

	it('PT-RP10-U2: non-member gets empty messages', () => {
		expect(resolveChatRoomMountMessages(roomGuest, { status: 'fulfilled', value: msgs })).toEqual(
			[]
		);
	});

	it('PT-RP10-U3: host viewer receives read-only messages', () => {
		const host = { ...roomMember, isHostViewer: true, isMember: false } as FaceChatRoomDto;
		expect(resolveChatRoomMountMessages(host, { status: 'fulfilled', value: msgs })).toEqual(msgs);
	});

	it('rejected messages yield empty for member', () => {
		expect(
			resolveChatRoomMountMessages(roomMember, { status: 'rejected', reason: new Error('403') })
		).toEqual([]);
	});

	it('resolveChatRoomMountRoom maps fulfilled and rejected', () => {
		expect(resolveChatRoomMountRoom({ status: 'fulfilled', value: roomMember })).toEqual({
			room: roomMember,
			loadError: false,
		});
		expect(resolveChatRoomMountRoom({ status: 'rejected', reason: new Error('404') })).toEqual({
			room: null,
			loadError: true,
		});
	});
});
