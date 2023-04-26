/** @type {import("eslint").Linter.Config} */

const config = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'unused-imports', 'prettier', 'import', 'simple-import-sort'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['node_modules/*', 'dist/*'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
    'import/order': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
        alwaysTryTypes: true,
      },
    },
  },
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
};

module.exports = config;
