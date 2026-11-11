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
 *   primitives   the smallest pieces, no OpenFn words      (primitives, types from model)
 *   patterns     the shape of a screen, no OpenFn nouns    (primitives, patterns)
 *   domain       anything in OpenFn's words                (primitives, domain, model)
 *   pages        one screen; draws, and nothing else       (any component, model)
 *   wrappers     XPage.query.tsx / XPage.fixtures.tsx      (anything)
 *
 * Data comes from the API: src/api/ holds the client and a hook per resource,
 * and src/fake-api/ is the pretend server that answers it, seeded from
 * fixtures. Only wrappers and src/app call the hooks, and only src/api/source.ts
 * reaches the fake server, so going real is deleting src/fake-api/.
 *
 * Patterns and domain both sit on primitives, side by side, and neither
 * imports the other: a pattern gets OpenFn content through slots, and the
 * page is where a pattern and the domain components that fill it meet.
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
const api = {
  group: ['**/api', '**/api/**'],
  message: `Only a page's wrapper (XPage.query.tsx) and src/app call the API's hooks. Take the data as a prop and an onX callback instead. ${docs}#the-seam`,
}
const fakeApi = {
  group: ['**/fake-api', '**/fake-api/**'],
  message: `src/fake-api is the pretend server. Only src/api/source.ts sends it requests, so going real is deleting the folder. Call the resource's hook in src/api instead. ${docs}#the-api`,
}
const tanstack = {
  name: '@tanstack/react-query',
  message: `TanStack Query lives in src/api: call the resource's hook from there, so every page loads the same data the same way. ${docs}#the-api`,
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
  message: `${layer} only import from the layers below them (primitives < patterns and domain < pages). If you need something from a higher layer, the component is probably in the wrong layer. ${docs}#the-layers`,
})
// Domain draws with primitives only. Where a domain component would sit in a
// pattern's frame, it hands its pieces to the page instead, and the page puts
// them in the pattern's slots.
const noPatternsInDomain = {
  group: ['**/patterns', '**/patterns/**'],
  message: `Domain components are built from primitives (and other domain components) only. If this belongs in a pattern's frame, let the page draw the pattern and pass this component in as a slot; if the pattern is really one small piece, it's a primitive. ${docs}#domain-draws-with-primitives`,
}
// Patterns don't know OpenFn either; this says why, since it's the import
// that's tempting.
const slot = `Patterns can't know OpenFn's nouns, so they stay reusable everywhere; take the content as a slot instead (children or a ReactNode prop) and let whoever uses the pattern pass the domain component in. ${docs}#patterns-take-openfn-content-through-slots`
const noOpenFnInPatterns = [
  { group: ['**/domain', '**/domain/**'], message: slot },
  { group: ['**/model', '**/model/**'], message: `Model types are OpenFn nouns too. ${slot}` },
]
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
          paths: [tanstack],
          patterns: [
            fixtures,
            wrappers,
            app,
            api,
            fakeApi,
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
        { paths: [router, tanstack], patterns: [fixtures, wrappers, app, api, fakeApi, noPatternsInDomain, above('Domain components', ['pages'])] },
      ],
    },
  },
  {
    files: ['src/components/patterns/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [router, tanstack], patterns: [fixtures, wrappers, app, api, fakeApi, ...noOpenFnInPatterns, above('Patterns', ['pages'])] },
      ],
    },
  },
  {
    // A page's own test (XPage.test.tsx) is held to the page's rules: it feeds props, as any host would.
    files: ['src/pages/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.tsx', '**/*.fixtures.{ts,tsx}', '**/*.query.{ts,tsx}', '**/*.query.test.tsx'],
    rules: {
      'no-restricted-imports': ['error', { paths: [router, tanstack], patterns: [fixtures, wrappers, app, api, fakeApi] }],
    },
  },
  {
    // Wrappers and the app call the API's hooks; neither reaches the fake server or TanStack Query itself.
    // Their tests run them on the fake server, as a page's XPage.query.test.tsx does.
    files: ['src/pages/**/*.{fixtures,query}.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: [tanstack], patterns: [fakeApi] }],
    },
  },
  {
    // The data code: the client, and a file per resource with its types, mapper, keys and hooks.
    files: ['src/api/**/*.{ts,tsx}'],
    ignores: ['src/api/source.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [router],
          patterns: [
            fakeApi,
            {
              group: ['**/components', '**/components/**', '**/pages', '**/pages/**', '**/app', '**/app/**', '**/fixtures', '**/fixtures/**'],
              message: `src/api talks to the server and maps its answers onto model/ types. It draws nothing and never reads fixtures: those are the fake server's database. ${docs}#the-api`,
            },
          ],
        },
      ],
      // A hook hands back the same empty list every render, or an effect watching it sees new data.
      'no-restricted-syntax': [
        'error',
        {
          selector: "LogicalExpression[operator='??'][left.property.name='data'] > ArrayExpression.right[elements.length=0]",
          message: 'Write `query.data ?? none` (from ./client): a fresh `[]` is a new list every render. See `none` in src/api/client.ts.',
        },
      ],
    },
  },
  {
    // The pretend server: fixtures are its database, model/ its vocabulary.
    files: ['src/fake-api/**/*.{ts,tsx}'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [router, tanstack],
          patterns: [
            {
              group: ['**/components', '**/components/**', '**/pages', '**/pages/**', '**/app', '**/app/**', '**/api', '**/api/**'],
              message: `The fake server only knows its database (fixtures) and model/. It answers HTTP; it never reaches into the app. ${docs}#the-api`,
            },
          ],
        },
      ],
    },
  },
])
