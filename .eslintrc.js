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

  extends: [
    'airbnb-base',
  ],

  rules: {
    'no-param-reassign': ['error', { props: false }],
    'import/no-unresolved': ['error', { commonjs: true }],
  },

  overrides: [
    {
      files: ['src/boot/*.js', 'src/dev/WebSocketClient.js', 'src/dev/SockJSClient.js'],

      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
};
