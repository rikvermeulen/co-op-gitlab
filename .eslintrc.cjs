/** @type {import("eslint").Linter.Config} */

const config = {
  parser: '@typescript-eslint/parser',
  extends: ['prettier'],
  plugins: ['@typescript-eslint', 'unused-imports'],
  ignorePatterns: ['node_modules/*', 'dist/*'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
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
