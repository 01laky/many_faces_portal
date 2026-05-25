/**
 * login.cy.ts - E2E tests for login functionality
 *
 * Tests verify:
 * - Login page loads correctly
 * - Form validation works
 * - Successful login redirects to homepage
 * - Failed login shows error message
 * - Already authenticated users are redirected
 */

describe('Login Page', () => {
	beforeEach(() => {
		// Clear any existing session/localStorage
		cy.clearLocalStorage();
		cy.clearCookies();
	});

	it('should load login page', () => {
		cy.visit('/en/login');

		cy.contains('Login').should('be.visible');
		cy.get('input[type="email"]').should('be.visible');
		cy.get('input[type="password"]').should('be.visible');
		cy.get('button[type="submit"]').should('be.visible');
	});

	it('should show validation errors for empty form', () => {
		cy.visit('/en/login');

		// Try to submit empty form
		cy.get('form').submit();

		// Should show validation errors (depends on form validation implementation)
		// Check for email and password required messages
		cy.get('body').should('contain.text', 'required');
	});

	it('should show error for invalid email format', () => {
		cy.visit('/en/login');

		cy.get('input[type="email"]').type('invalid-email');
		cy.get('input[type="password"]').type('Test123!');
		cy.get('form').submit();

		// Should show email validation error
		cy.get('body').should('contain.text', 'valid email');
	});

	it('should successfully login with valid credentials', () => {
		// First register a user
		const email = `test_${Date.now()}@test.com`;
		const password = 'Test123!@#';

		cy.registerUser(email, password);

		// Wait for registration to complete
		cy.wait(500);

		// Now try to login
		cy.visit('/en/login');

		cy.get('input[type="email"]').type(email);
		cy.get('input[type="password"]').type(password);
		cy.get('form').submit();

		// Should redirect to homepage
		cy.url({ timeout: 10000 }).should('include', '/homepage');

		// Should show user info (if implemented)
		cy.get('body').should('contain.text', email);
	});

	it('should show error for invalid credentials', () => {
		cy.visit('/en/login');

		cy.get('input[type="email"]').type('invalid@test.com');
		cy.get('input[type="password"]').type('WrongPassword123!');
		cy.get('form').submit();

		// Wait a bit for async login to complete and toast to appear
		cy.wait(1000);

		// Should show error toast message - check body text or toast elements
		cy.get('body', { timeout: 10000 }).should(($body) => {
			const text = $body.text();
			// Check for various error messages
			const hasError =
				text.includes('Login failed') ||
				text.includes('failed') ||
				text.includes('error') ||
				text.includes('invalid') ||
				text.includes('credentials') ||
				text.includes('Unauthorized');
			expect(hasError).to.be.true;
		});
	});

	it('should redirect authenticated user to homepage', () => {
		// Register and login first
		const email = `test_${Date.now()}@test.com`;
		const password = 'Test123!@#';

		cy.registerUser(email, password);
		cy.wait(500);
		cy.loginUser(email, password);

		// Try to visit login page again
		cy.visit('/en/login');

		// Should redirect to homepage
		cy.url({ timeout: 5000 }).should('include', '/homepage');
	});
});
