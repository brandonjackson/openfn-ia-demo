import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/*
 * The layers, and what each may import. Everything only imports downward;
 * data comes in from the side, through a page's wrapper. The why, and a walk
 * through one page end to end, is in docs/architecture.md.
 *
 *   model        types, fixed vocabulary, pure functions   (imports nothing of ours)
 *   fixtures     fake records                              (model)
 *   primitives   no OpenFn words                           (primitives, types from model)
 *   domain       one OpenFn thing                          (primitives, domain, model)
 *   patterns     a region or layout of a screen            (primitives, domain, patterns, model)
 *   pages        one screen; draws, and nothing else       (any component, model)
 *   wrappers     XPage.fixtures.tsx: feeds a page          (anything)
 */

const docs = 'See docs/architecture.md'

const fixtures = {
  group: ['**/fixtures', '**/fixtures/**'],
  message: `Only a page's wrapper (XPage.fixtures.tsx) and stories read fixtures. Take the data as a prop instead, so the same component works on fixtures, a LiveView island or the API. ${docs}#the-seam`,
}
const wrappers = {
  group: ['**/*.fixtures'],
  message: `A wrapper feeds one page and nothing imports it but the routes in src/app. ${docs}#the-seam`,
}
const app = {
  group: ['**/app', '**/app/**'],
  message: `src/app is the routing and app state the wrappers use. Pass what you need down as a prop. ${docs}#the-seam`,
}
const router = {
  name: 'react-router-dom',
  message: `Only primitives and wrappers talk to the router, so a page can be mounted where there is no React Router (a LiveView island). Use the Link primitive for links, and take an onX prop or a URL as a prop for anything else. ${docs}#links-and-navigation`,
}
const above = (layer, names) => ({
  group: names.flatMap((n) => [`**/${n}`, `**/${n}/**`]),
  message: `${layer} only import from the layers below them (primitives < domain < patterns < pages). If you need something from a higher layer, the component is probably in the wrong layer. ${docs}#the-layers`,
})
const ourLayers = {
  group: ['**/components', '**/components/**', '**/pages', '**/pages/**', '**/fixtures', '**/fixtures/**', '**/app', '**/app/**'],
  message: `model/ is the vocabulary every layer shares, so it can't depend on any of them. ${docs}#model-and-fixtures`,
}

export default defineConfig([
  globalIgnores(['dist', 'storybook-static']),
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
    files: ['src/model/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: [router], patterns: [ourLayers] }],
    },
  },
  {
    files: ['src/fixtures/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [router],
          patterns: [
            {
              group: ['**/components', '**/components/**', '**/pages', '**/pages/**', '**/app', '**/app/**'],
              message: `Fixtures are the fake server: records shaped by model/, with no knowledge of how they're drawn. ${docs}#model-and-fixtures`,
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/primitives/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            fixtures,
            wrappers,
            app,
            above('Primitives', ['domain', 'patterns', 'pages']),
            {
              group: ['**/model', '**/model/**'],
              allowTypeImports: true,
              message: `Primitives know nothing about OpenFn. They may borrow a type from model/, but no vocabulary or logic: take labels, icons and values as props. ${docs}#the-layers`,
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/domain/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [router], patterns: [fixtures, wrappers, app, above('Domain elements', ['patterns', 'pages'])] },
      ],
    },
  },
  {
    files: ['src/components/patterns/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [router], patterns: [fixtures, wrappers, app, above('Patterns', ['pages'])] },
      ],
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.tsx', '**/*.fixtures.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: [router], patterns: [fixtures, wrappers, app] }],
    },
  },
])
