import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.data']),
  {
    // Browser application
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // House rule: all styling lives in external CSS Modules so any surface can be
      // restyled from outside the component's own stylesheet.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="style"]',
          message:
            'Inline styles are not allowed. Put the rule in the component CSS Module and use a class.',
        },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['useAuth', 'useToast'] },
      ],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Node API
    files: ['server/**/*.js', '*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
