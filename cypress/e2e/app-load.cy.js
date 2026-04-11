/**
 * Smoke test for the static preview server (`yarn build && yarn preview`).
 * Validates that the production bundle boots far enough to paint `body` — no auth, no API dependency.
 */
describe('FE preview (built SPA)', () => {
  it('loads the shell', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });
});
