/** Cypress perf budgets for face home (PT-RP29). */
export const FACE_HOME_MAX_API_CALLS = 8;
export const FACE_HOME_MAX_TRANSFER_KB = 512;

export function assertFaceHomeBudget(apiCallCount, transferKb = 0) {
	expect(apiCallCount, 'face home API call budget').to.be.at.most(FACE_HOME_MAX_API_CALLS);
	if (transferKb > 0) {
		expect(transferKb, 'face home transfer budget KB').to.be.at.most(FACE_HOME_MAX_TRANSFER_KB);
	}
}
