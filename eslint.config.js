/**
 * ESLint flat config for the **hand-written** SPA (TypeScript + React 19 + Vite 8).
 *
 * - **`src/api/**` is ignored** — OpenAPI generator output is not style-gated here.
 * - **`cypress/**` + `cypress.config.mjs` ignored** — E2E specs use relaxed globals; Cypress provides its own lint story.
 * - **`react-hooks`** uses the flat recommended preset (includes React Compiler compatibility rules such as
 *   `react-hooks/incompatible-library` for TanStack Table / RHF where we document suppressions inline).
 * - **`eslint-config-prettier` last** so formatting disagreements defer to Prettier (`yarn format:check`).
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['dist', 'node_modules', '.yarn/**/*', 'cypress/**/*', 'cypress.config.mjs']),
	{
		files: ['**/*.{ts,tsx}'],
		ignores: ['src/api/**/*'], // Ignore generated API files
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended,
			reactRefresh.configs.vite,
			reactHooks.configs.flat.recommended,
			prettier, // Must be last to override other configs
		],
		plugins: {
			'react-hooks': reactHooks,
		},
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			// Allow unused vars that start with underscore
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			// Semicolons are handled by Prettier
		},
	},
	{
		// Context files can export hooks alongside components
		files: ['src/contexts/**/*.{ts,tsx}'],
		rules: {
			'react-refresh/only-export-components': 'off',
		},
	},
]);
