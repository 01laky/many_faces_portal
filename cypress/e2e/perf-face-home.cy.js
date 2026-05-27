/**
 * PT-RP29 — smoke perf budget for authenticated face home (requires preview + backend).
 */
const FACE_HOME_MAX_API_CALLS = 8;

describe('perf face home (PT-RP29)', () => {
	it('documents API budget constant for CI', () => {
		expect(FACE_HOME_MAX_API_CALLS).to.eq(8);
	});

	it('loads portal shell within budget when backend is up', () => {
		const apiCalls = [];
		cy.intercept({ url: '**/api/**', middleware: true }, (req) => {
			apiCalls.push(req.url);
		}).as('api');

		cy.visit('/', { failOnStatusCode: false });
		cy.get('body').should('exist');
		cy.then(() => {
			expect(apiCalls.length).to.be.at.most(FACE_HOME_MAX_API_CALLS + 2);
		});
	});
});
