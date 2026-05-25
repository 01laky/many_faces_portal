/**
 * Optional integration spec: hits **many_faces_backend** REST endpoints with `cy.request` (no browser OAuth redirect).
 *
 * Why `before(function () { ... this.skip() })`: the parent monorepo CI job often builds `many_faces_portal` alone.
 * Probing `/swagger/index.html` is a cheap liveness check — if the API is down we **skip** the whole suite
 * instead of failing red, while full-stack pipelines still get regression coverage of register → token →
 * capabilities → refresh.
 */
const api = Cypress.env('E2E_API_URL') || 'http://127.0.0.1:8000';

describe('OAuth API chain (optional)', () => {
	before(function () {
		cy.request({ url: `${api}/swagger/index.html`, failOnStatusCode: false, timeout: 5000 }).then(
			(resp) => {
				if (resp.status !== 200) {
					this.skip();
				}
			}
		);
	});

	it('register → password token → refresh → capabilities', () => {
		const email = `e2e_${Date.now()}@test.com`;
		const password = 'Test123!@#';

		cy.request('POST', `${api}/api/oauth2/register`, {
			email,
			password,
			firstName: 'E2E',
			lastName: 'User',
		}).then((r) => {
			expect(r.status).to.eq(200);
		});

		cy.request('POST', `${api}/api/oauth2/token`, {
			grantType: 'password',
			clientId: 'be-demo-client',
			clientSecret: 'be-demo-secret-very-strong-key',
			username: email,
			password,
		}).then((r) => {
			expect(r.status).to.eq(200);
			const body = r.body;
			expect(body.accessToken).to.be.a('string').and.not.be.empty;
			expect(body.refreshToken).to.be.a('string').and.not.be.empty;

			cy.request({
				method: 'GET',
				url: `${api}/public/api/me/capabilities`,
				headers: { Authorization: `Bearer ${body.accessToken}` },
			}).then((cap) => {
				expect(cap.status).to.eq(200);
				expect(cap.body).to.have.property('permissions');
			});

			cy.request('POST', `${api}/api/oauth2/token`, {
				grantType: 'refresh_token',
				clientId: 'be-demo-client',
				clientSecret: 'be-demo-secret-very-strong-key',
				refreshToken: body.refreshToken,
			}).then((ref) => {
				expect(ref.status).to.eq(200);
				expect(ref.body).to.have.property('accessToken');
			});
		});
	});
});
