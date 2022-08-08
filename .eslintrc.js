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
      files: [
        'src/boot/*.js',
        'src/**/WebSocketClient.js',
        'src/**/SockJSClient.js',
      ],

      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
};
