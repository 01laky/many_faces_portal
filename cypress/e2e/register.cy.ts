/**
 * register.cy.ts - E2E tests for registration functionality
 *
 * Tests verify:
 * - Register page loads correctly
 * - Form validation works
 * - Successful registration creates user
 * - Failed registration shows error message
 */

describe('Register Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should load register page', () => {
    cy.visit('/en/register');

    cy.contains('Register').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty form', () => {
    cy.visit('/en/register');

    cy.get('form').submit();

    // Should show validation errors
    cy.get('body').should('contain.text', 'required');
  });

  it('should successfully register new user', () => {
    cy.visit('/en/register');

    const email = `test_${Date.now()}@test.com`;
    const password = 'Test123!@#';
    const firstName = 'Test';
    const lastName = 'User';

    // Fill in registration form
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('input[name="firstName"], input[placeholder*="First"]').type(firstName);
    cy.get('input[name="lastName"], input[placeholder*="Last"]').type(lastName);

    cy.get('form').submit();

    // Should redirect to login page after successful registration
    cy.url({ timeout: 10000 }).should('include', '/login');
  });

  it('should show error for duplicate email', () => {
    // First register a user
    const email = `test_${Date.now()}@test.com`;
    const password = 'Test123!@#';

    cy.registerUser(email, password);
    cy.wait(1000); // Wait longer for registration to complete

    // Try to register again with same email
    cy.visit('/en/register');

    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('input[name="firstName"], input[placeholder*="First"]').type('Test');
    cy.get('input[name="lastName"], input[placeholder*="Last"]').type('User');

    cy.get('form').submit();

    // Wait a bit for async registration to complete and toast to appear
    cy.wait(1500);

    // Should show error about duplicate email - check body text for error message
    cy.get('body', { timeout: 10000 }).should(($body) => {
      const text = $body.text();
      // Check for error toast message or form error
      const hasError =
        text.includes('already') ||
        text.includes('exists') ||
        text.includes('duplicate') ||
        text.includes('error') ||
        text.includes('failed') ||
        (text.includes('Email') && text.includes('taken')) ||
        text.includes('Bad Request') ||
        text.includes('Conflict');

      expect(hasError).to.be.true;
    });
  });
});
