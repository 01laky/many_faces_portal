/** API error codes from tenant messenger when face moderation applies. */
export type MessengerModerationErrorCode = 'face_banned' | 'account_suspended';

export function parseMessengerModerationErrorCode(
  payload: { code?: string } | null | undefined
): MessengerModerationErrorCode | null {
  const code = payload?.code?.trim().toLowerCase();
  if (code === 'face_banned') return 'face_banned';
  if (code === 'account_suspended') return 'account_suspended';
  return null;
}

export function messengerModerationErrorMessageKey(
  code: MessengerModerationErrorCode | null
): string | null {
  switch (code) {
    case 'face_banned':
      return 'messenger.errors.faceBanned';
    case 'account_suspended':
      return 'messenger.errors.accountSuspended';
    default:
      return null;
  }
}

export function shouldShowPlatformAdministratorBadge(
  isPlatformAdministrator?: boolean | null,
  otherUserGlobalRole?: string | null
): boolean {
  if (isPlatformAdministrator === true) return true;
  return (otherUserGlobalRole ?? '').toUpperCase() === 'SUPER_ADMIN';
}

export function platformAdministratorBadgeLabelKey(): string {
  return 'messenger.badges.platformAdministrator';
}
