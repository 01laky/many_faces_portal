/**
 * Cypress 10+ ESM config (`cypress.config.mjs`) so Node does not run the TS/webpack pipeline that used to
 * compile `cypress.config.ts` (simpler CI, fewer `downlevelIteration` surprises).
 *
 * - **baseUrl** matches `vite preview` on port **4173** over **HTTP** — see `vite.config.ts` `preview.https: false`.
 * - **E2E_API_URL** points at the ASP.NET demo (`many_faces_backend`) for optional API-chain specs; default matches local Kestrel.
 */
import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		baseUrl: 'http://127.0.0.1:4173',
		specPattern: 'cypress/e2e/**/*.cy.js',
		supportFile: false,
		video: false,
		viewportWidth: 1280,
		viewportHeight: 720,
	},
	env: {
		E2E_API_URL: process.env.E2E_API_URL ?? 'http://127.0.0.1:8000',
	},
});
