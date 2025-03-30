//@ts-check

import pluginJs from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tslint from 'typescript-eslint';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  {
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2019,
        sourceType: 'module',
      },
    },
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  prettierPlugin,
  ...tslint.configs.recommended,
  { ignores: ['./dist'] },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': ['error'],
    },
  },
];
