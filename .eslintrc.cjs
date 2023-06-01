/** @type {import("eslint").Linter.Config} */

const config = {
  parser: '@typescript-eslint/parser',
  extends: ['prettier'],
  plugins: ['@typescript-eslint', 'unused-imports'],
  ignorePatterns: ['node_modules/*', 'dist/*'],
  rules: {},
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
        alwaysTryTypes: true,
      },
    },
  },
};

module.exports = config;
