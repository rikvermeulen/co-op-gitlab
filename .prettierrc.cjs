/** @type {import("prettier").Config} */
const config = {
  arrowParens: 'always',
  singleQuote: true,
  jsxSingleQuote: false,
  semi: true,
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 100,
  pluginSearchDirs: false,
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '@/server(.*)$',
    '',
    '^types$',
    '^@/types/(.*)$',
    '',
    '^@/middlewares/(.*)$',
    '^@/controllers/(.*)$',
    '^@/services(.*)$',
    '^@/util/(.*)$',
    '^@/helpers/(.*)$',
    '',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  pluginSearchDirs: false,
};

module.exports = config;
