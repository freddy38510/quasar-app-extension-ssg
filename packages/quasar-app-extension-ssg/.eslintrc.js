/**
 * supported versions of node.js
 *
 * see engines field in https://github.com/quasarframework/quasar/blob/legacy-app/app-webpack/package.json
 * and https://github.com/quasarframework/quasar/blob/legacy-app/app-vite/package.json
 */
process.env.BROWSERSLIST = ['node >= 14.15.0'];

const { defineConfig } = require('eslint-define-config');
const { join, resolve } = require('path');

const browserModules = [
  'src/boot/*.js', // quasar boot files
  'src/**/entry/+(app|client)*.js', // quasar client entry + deps
  'src/webpack/sockets/*.js', // webpack-dev-server custom socket clients
];

const esModules = [
  ...browserModules,
  'src/vite/runtime*.js', // ssg runtimes
  'src/**/entry/*.js', // quasar entries + deps
];

module.exports = defineConfig({
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
  },
  extends: [
    'airbnb-base',
    'plugin:n/recommended-script', // node commonjs
  ],
  settings: {
    'import/resolver': {
      node: {}, // default node resolver
      exports: {}, // add package.json#exports support
    },
  },
  rules: {
    'n/no-extraneous-require': 'off',
    'n/no-missing-require': 'off',
    'n/no-process-exit': 'off',
    'no-void': 'off',
    'no-underscore-dangle': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'no-console': 'off',
    'no-param-reassign': ['error', { props: false }],
    'import/no-extraneous-dependencies': ['error',
      {
        devDependencies: [
          // allow devDependencies for these modules
          '**/.eslintrc.js',
          '**/scripts/*.js',
        ],
        packageDir: [
          __dirname,
          resolve(__dirname, '../..'), // devDependencies at monorepo root package
        ],
      },
    ],

  },
  overrides: [
    {
      files: ['packages/quasar-app-extension-ssg/**/*.js'],
      excludedFiles: esModules,
      extends: [
        // check the compatibility of JavaScript code with the supported versions of Node.js
        'plugin:ecmascript-compat/recommended',
      ],
    },
    {
      files: esModules,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      extends: [
        'plugin:n/recommended-module', // node ESmodule
      ],
      rules: {
        'n/no-extraneous-import': 'off',
        'n/no-missing-import': 'off',
        'n/no-unsupported-features/es-syntax': 'off',
        'import/extensions': ['error', 'ignorePackages'], // extension is mandatory
      },
    },
    {
      files: browserModules,
      env: {
        browser: true,
      },
      rules: {
        'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      },
    },
    {
      files: ['src/**/entry/*.js'],
      extends: ['plugin:lodash-template/recommended-with-script'],
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
        'import/parsers': {
          'lodash-template/script': ['.js'], // parse imported templates
        },
      },
      rules: {
        'max-len': ['error', 120],
        'import/no-unresolved': ['error', { ignore: ['\\./*'] }], // ignore missing local deps
      },
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: join(__dirname, './jsconfig.json'),
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        'n/no-missing-import': 'off',
      },
    },
  ],
});
