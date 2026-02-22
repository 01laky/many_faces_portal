import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // baseUrl - can be disabled by setting CYPRESS_BASE_URL to empty string
    // This allows running tests even when server is not running (they will fail though)
    // Default port matches Vite dev server port (8081)
    baseUrl: process.env.CYPRESS_SKIP_BASE_URL
      ? undefined
      : process.env.CYPRESS_BASE_URL || 'http://localhost:8081',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    env: {
      apiUrl: 'http://localhost:8000',
    },
  },
});
