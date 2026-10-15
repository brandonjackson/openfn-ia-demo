import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // The data seam: components get records and permission booleans as props
    // (pages load them), so wiring the backend only touches pages. Stories
    // may use fixtures. An import that still crosses the seam is on the wiring
    // list and says why: `// eslint-disable-next-line no-restricted-imports -- wiring: …`.
    files: ['src/components/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/mock-data', '**/mock-data/**'],
              message:
                'Components take data as props; load it in the page. Types live in src/types/, helpers in src/utils/.',
            },
          ],
        },
      ],
    },
  },
])
