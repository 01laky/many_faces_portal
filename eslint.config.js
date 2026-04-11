import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.yarn/**/*', 'cypress/**/*', 'cypress.config.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/api/**/*'], // Ignore generated API files
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactRefresh.configs.vite,
      prettier, // Must be last to override other configs
    ],
    plugins: {
      // Canary `flat.recommended` enables many experimental rules; keep classic
      // hooks checks until the codebase opts into the full preset.
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
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
])
