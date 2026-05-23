import { describe, it, expect, vi } from 'vitest';
import { runLegacyLocalStorageMigration } from '../legacyStorageMigration';
import { GRADIENT_ANIMATION_STORAGE_KEY } from '../gradientAnimationPreferenceStorage';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
    removeItem: (k) => {
      m.delete(k);
    },
    clear: () => m.clear(),
    get length() {
      return m.size;
    },
    key: (i: number) => Array.from(m.keys())[i] ?? null,
  } as Storage;
}

describe('legacyStorageMigration LS-M', () => {
  it('LS-M1: removes auth_user when token valid', async () => {
    const storage = memoryStorage({ auth_user: '{"id":"1"}' });
    await runLegacyLocalStorageMigration(storage, memoryStorage());
    expect(storage.getItem('auth_user')).toBeNull();
  });

  it('LS-M2: always deletes stale auth_user key', async () => {
    const storage = memoryStorage({ auth_user: 'not-json{{{' });
    await runLegacyLocalStorageMigration(storage, memoryStorage());
    expect(storage.getItem('auth_user')).toBeNull();
  });

  it('LS-M3: migrates i18nextLng to callback for authed profile update', async () => {
    const storage = memoryStorage({ i18nextLng: 'sk' });
    const onMigrateGuestLanguage = vi.fn();
    await runLegacyLocalStorageMigration(storage, memoryStorage(), { onMigrateGuestLanguage });
    expect(onMigrateGuestLanguage).toHaveBeenCalledWith('sk');
    expect(storage.getItem('i18nextLng')).toBeNull();
  });

  it('LS-M4: removes selected_face_id after server sync callback', async () => {
    const storage = memoryStorage({ selected_face_id: '42' });
    const onMigrateLastFaceId = vi.fn();
    await runLegacyLocalStorageMigration(storage, memoryStorage(), { onMigrateLastFaceId });
    expect(onMigrateLastFaceId).toHaveBeenCalledWith(42);
    expect(storage.getItem('selected_face_id')).toBeNull();
  });

  it('LS-M5: idempotent — second run no-op', async () => {
    const storage = memoryStorage({ auth_user: '{}', i18nextLng: 'de' });
    const cb = vi.fn();
    await runLegacyLocalStorageMigration(storage, memoryStorage(), {
      onMigrateGuestLanguage: cb,
    });
    await runLegacyLocalStorageMigration(storage, memoryStorage(), {
      onMigrateGuestLanguage: cb,
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('LS-M6: guest gradient localStorage → sessionStorage', async () => {
    const local = memoryStorage({ [GRADIENT_ANIMATION_STORAGE_KEY]: '1' });
    const session = memoryStorage();
    await runLegacyLocalStorageMigration(local, session);
    expect(local.getItem(GRADIENT_ANIMATION_STORAGE_KEY)).toBeNull();
    expect(session.getItem(GRADIENT_ANIMATION_STORAGE_KEY)).toBe('1');
  });
});
