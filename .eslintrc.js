const { dirname, join } = require('path');

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: ['airbnb-base'],
  rules: {
    'no-param-reassign': ['error', { props: false }],
    'import/no-unresolved': ['error', { commonjs: true }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/src/**/entry/**/*.js', '**/src/boot/**/*.js'],
        packageDir: [
          dirname(require.resolve('@quasar/app-vite/package.json')),
          dirname(require.resolve('@quasar/app-webpack/package.json')),
          join(__dirname, 'packages/quasar-app-extension-ssg'),
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['**/src/vite/**'],
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
    {
      files: ['**/src/**/entry/**/*.js'],
      parserOptions: {
        ecmaVersion: 2022,
      },
      extends: [
        'plugin:lodash-template/recommended-with-script',
      ],
      settings: {
        'lodash-template/globals': [
          // shared
          'ssr',
          'sourceFiles',
          'store',
          'ctx',
          'boot',
          'extras',
          'animations',
          'framework',
          'css',
          'preFetch',
          'build',
          'ssg',
          // vite
          'metaConf',
          // webpack
          '__vueDevtools',
          '__needsAppMountHook',
          '__storePackage',
          '__css',
          '__loadingBar',
        ],
      },
      rules: {
        'max-len': ['error', 120],
        'import/no-unresolved': ['error', { ignore: ['\\./*'] }],
      },
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
    },
  ],
};
