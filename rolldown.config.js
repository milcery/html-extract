import { defineConfig } from 'rolldown'

export default defineConfig([
  {
    platform: 'node',
    input: 'src/main.ts',
    external: ['cheerio'],
    output: [
      {
        format: 'cjs',
        file: 'dist/html-extract.cjs',
        // minify: true,
      },
      {
        format: 'esm',
        file: 'dist/html-extract.mjs',
        // minify: true,
      },
    ],
  },
  {
    platform: 'browser',
    input: 'src/main.browser.ts',
    output: {
      name: 'HtmlExtract',
      format: 'iife',
      file: 'dist/html-extract.browser.js',
      inlineDynamicImports: true,
      globals: {
        '@atlach/jq/lib/jquery': 'jQuery',
      },
    },
  },
])
