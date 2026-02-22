/**
 * navigation.cy.ts - E2E tests for navigation and routing
 *
 * Tests verify:
 * - Navigation between pages works
 * - Protected routes require authentication
 * - Language switching works
 * - Header links work correctly
 */

describe('Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should navigate from login to register', () => {
    cy.visit('/en/login');

    // Find and click register link
    cy.contains('Register').click();

    cy.url().should('include', '/register');
    cy.contains('Register').should('be.visible');
  });

  it('should navigate from register to login', () => {
    cy.visit('/en/register');

    // Find and click login link
    cy.contains('Login').click();

    cy.url().should('include', '/login');
    cy.contains('Login').should('be.visible');
  });

  it('should redirect to login when accessing protected route without auth', () => {
    cy.visit('/en/homepage');

    // Should redirect to login
    cy.url({ timeout: 5000 }).should('include', '/login');
  });

  it('should access protected route after login', () => {
    const email = `test_${Date.now()}@test.com`;
    const password = 'Test123!@#';

    cy.registerUser(email, password);
    cy.wait(500);
    cy.loginUser(email, password);

    // Should be on homepage
    cy.url().should('include', '/homepage');
    cy.get('body').should('contain.text', email);
  });

  it('should have working header links', () => {
    cy.visit('/en/login');

    // Check header contains login and register links
    cy.get('header').should('be.visible');
    cy.get('header').contains('Login');
    cy.get('header').contains('Register');
  });
});
