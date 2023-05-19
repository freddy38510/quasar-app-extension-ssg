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
        devDependencies: true,
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
      files: [
        '**/src/boot/**',
        '**/src/**/WebSocketClient.js',
        '**/src/**/SockJSClient.js',
      ],
      rules: {
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: [
        '**/src/vite/entry/**',
        '**/src/webpack/build/templates/**',
      ],
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
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
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
