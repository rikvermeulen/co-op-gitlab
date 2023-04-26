/** @type {import("eslint").Linter.Config} */

const config = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'unused-imports',
    'tailwindcss',
    'prettier',
    'import',
    'simple-import-sort',
  ],
  extends: [
    'airbnb-typescript',
    'next/core-web-vitals',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  ignorePatterns: ['node_modules/*', '.eslintrc.js', 'dist/*'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        'prettier/prettier': [
          'error',
          {
            singleQuote: true,
            endOfLine: 'auto',
          },
        ],
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@next/next/no-html-link-for-pages': ['off'],
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
        browser: true,
        node: true,
        es2021: true,
      },
    },
  ],
};

module.exports = config;
