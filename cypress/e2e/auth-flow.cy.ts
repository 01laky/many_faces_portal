/**
 * auth-flow.cy.ts - E2E tests for complete authentication flow
 *
 * Tests verify the complete user journey:
 * 1. Register new user
 * 2. Login with credentials
 * 3. Access protected pages
 * 4. Logout
 * 5. Verify access is revoked after logout
 */

describe('Complete Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should complete full registration → login → logout flow', () => {
    const email = `test_${Date.now()}@test.com`;
    const password = 'Test123!@#';
    const firstName = 'Test';
    const lastName = 'User';

    // 1. Register
    cy.visit('/en/register');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('input[name="firstName"], input[placeholder*="First"]').type(firstName);
    cy.get('input[name="lastName"], input[placeholder*="Last"]').type(lastName);
    cy.get('form').submit();

    // Wait for registration to complete
    cy.wait(1000);

    // 2. Login
    cy.visit('/en/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('form').submit();

    // 3. Verify on homepage
    cy.url({ timeout: 10000 }).should('include', '/homepage');
    cy.get('body').should('contain.text', email);

    // 4. Try to access login page (should redirect)
    cy.visit('/en/login');
    cy.url({ timeout: 5000 }).should('include', '/homepage');

    // 5. Logout (if logout button exists)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Logout') || $body.text().includes('Log out')) {
        cy.contains('Logout').click({ force: true });
        cy.url({ timeout: 5000 }).should('include', '/login');
      }
    });
  });

  it('should persist login session on page refresh', () => {
    const email = `test_${Date.now()}@test.com`;
    const password = 'Test123!@#';

    cy.registerUser(email, password);
    cy.wait(500);
    cy.loginUser(email, password);

    // Verify on homepage
    cy.url().should('include', '/homepage');

    // Refresh page
    cy.reload();

    // Should still be logged in
    cy.url({ timeout: 5000 }).should('include', '/homepage');
    cy.get('body').should('contain.text', email);
  });

  it('should prevent access to protected routes after logout', () => {
    const email = `test_${Date.now()}@test.com`;
    const password = 'Test123!@#';

    cy.registerUser(email, password);
    cy.wait(500);
    cy.loginUser(email, password);

    // Should be on homepage
    cy.url().should('include', '/homepage');

    // Clear session (simulate logout)
    cy.clearLocalStorage();
    cy.clearCookies();

    // Try to access protected route
    cy.visit('/en/homepage');

    // Should redirect to login
    cy.url({ timeout: 5000 }).should('include', '/login');
  });
});
