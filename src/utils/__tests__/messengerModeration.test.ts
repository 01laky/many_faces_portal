import { describe, it, expect } from 'vitest';
import {
  messengerModerationErrorMessageKey,
  parseMessengerModerationErrorCode,
  platformAdministratorBadgeLabelKey,
  shouldShowPlatformAdministratorBadge,
} from '../messengerModeration';

describe('messengerModeration', () => {
  it('maps face_banned and account_suspended API codes', () => {
    expect(parseMessengerModerationErrorCode({ code: 'face_banned' })).toBe('face_banned');
    expect(parseMessengerModerationErrorCode({ code: 'account_suspended' })).toBe(
      'account_suspended'
    );
    expect(messengerModerationErrorMessageKey('face_banned')).toBe('messenger.errors.faceBanned');
  });

  it('shows platform administrator badge for super-admin senders', () => {
    expect(shouldShowPlatformAdministratorBadge(true)).toBe(true);
    expect(shouldShowPlatformAdministratorBadge(false, 'SUPER_ADMIN')).toBe(true);
    expect(shouldShowPlatformAdministratorBadge(false, 'USER')).toBe(false);
    expect(platformAdministratorBadgeLabelKey()).toBe('messenger.badges.platformAdministrator');
  });
});
