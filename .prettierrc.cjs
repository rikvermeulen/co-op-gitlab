/** @type {import("prettier").Config} */
/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
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
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
};

module.exports = config;
