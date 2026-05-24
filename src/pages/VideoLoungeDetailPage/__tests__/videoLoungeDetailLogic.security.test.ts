import { describe, expect, it } from 'vitest';
import { shouldLeaveVideoLoungeOnSessionEnd } from '../videoLoungeDetailLogic';

describe('videoLoungeDetailLogic (PSH1-T-C07)', () => {
  it('PSH1-T-C07: leave live session when auth ends during live phase', () => {
    expect(shouldLeaveVideoLoungeOnSessionEnd('live')).toBe(true);
    expect(shouldLeaveVideoLoungeOnSessionEnd('lobby')).toBe(false);
  });
});
