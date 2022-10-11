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
      files: ['src/vite/**'],

      parserOptions: {
        ecmaVersion: 2022,
      },
    },
    {
      files: [
        'src/boot/**',
        'src/**/WebSocketClient.js',
        'src/**/SockJSClient.js',
      ],

      rules: {
        'import/no-unresolved': 'off',
      },
    },
    {
      files: [
        'src/templates/**',
        'src/vite/entry/**',
        'src/webpack/build/templates/**',
      ],

      parserOptions: {
        ecmaVersion: 2022,
      },

      extends: [
        'airbnb-base',
        'plugin:lodash-template/recommended-with-script',
      ],

      settings: {
        'lodash-template/ignoreRules': [],
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
        'no-param-reassign': ['error', { props: false }],
        'import/no-unresolved': 'off',
        // 'import/extensions': 'off',
        // 'no-unused-expressions': ['error', { allowShortCircuit: true }],
        'max-len': ['error', 150],
        'lodash-template/scriptlet-indent': [
          'error',
          2,
          {
            startIndent: 0,
          },
        ],
        'lodash-template/no-template-tag-in-start-tag': [
          'error',
          {
            arrowEvaluateTag: false,
          },
        ],
      },
    },
  ],
};
