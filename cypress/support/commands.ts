/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to register a new user
			 * @example cy.registerUser('test@example.com', 'Password123!', 'John', 'Doe')
			 */
			registerUser(
				email: string,
				password: string,
				firstName?: string,
				lastName?: string
			): Chainable<void>;

			/**
			 * Custom command to login a user
			 * @example cy.loginUser('test@example.com', 'Password123!')
			 */
			loginUser(email: string, password: string): Chainable<void>;

			/**
			 * Custom command to logout a user
			 * @example cy.logoutUser()
			 */
			logoutUser(): Chainable<void>;
		}
	}
}

Cypress.Commands.add(
	'registerUser',
	(email: string, password: string, firstName = 'Test', lastName = 'User') => {
		cy.request({
			method: 'POST',
			url: `${Cypress.env('apiUrl')}/api/oauth2/register`,
			body: {
				email,
				password,
				firstName,
				lastName,
			},
			failOnStatusCode: false,
		}).then((response) => {
			// Wait a bit for registration to complete in backend
			cy.wait(300);
		});
	}
);

Cypress.Commands.add('loginUser', (email: string, password: string) => {
	// Navigate to login page
	cy.visit('/en/login');

	// Fill in login form
	cy.get('input[type="email"]').clear().type(email);
	cy.get('input[type="password"]').clear().type(password);

	// Submit form
	cy.get('form').submit();

	// Wait for redirect after successful login
	cy.url({ timeout: 10000 }).should('include', '/homepage');
});

Cypress.Commands.add('logoutUser', () => {
	// Look for logout button/link and click it
	// This depends on your UI implementation
	cy.get('body').then(($body) => {
		if ($body.text().includes('Logout') || $body.text().includes('Log out')) {
			cy.contains('Logout').click({ force: true });
		} else if ($body.find('[data-cy="logout"]').length > 0) {
			cy.get('[data-cy="logout"]').click();
		}
	});

	// Wait for redirect to login page
	cy.url({ timeout: 5000 }).should('include', '/login');
});

export {};
