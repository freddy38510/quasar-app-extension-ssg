const { join, isAbsolute } = require('path');
const { merge } = require('webpack-merge');
const appPaths = require('@quasar/app-webpack/lib/app-paths');
const QuasarConfFile = require('@quasar/app-webpack/lib/quasar-conf-file');
const extensionJson = require('@quasar/app-webpack/lib/app-extension/extension-json');
const getUniqueArray = require('./helpers/get-unique-array');
const { hasPackage, ssgDeps } = require('../api');

function encode(obj) {
  return JSON.stringify(obj, (_, value) => (typeof value === 'function'
    ? `/fn(${value.toString()})`
    : value));
}

function extendQuasarConf(conf) {
  const prompts = extensionJson.getPrompts('ssg');

  conf.ssg = merge({
    concurrency: 10,
    interval: 0,
    fallback: '404.html',
    cache: {
      ignore: [],
      globbyOptions: {
        gitignore: true,
      },
    },
    routes: [],
    crawler: true,
    exclude: [],
  }, conf.ssg ? conf.ssg : {});

  // Set SSG buildDir
  if (conf.ssg.buildDir === void 0) {
    conf.ssg.buildDir = conf.ssg.cache !== false
      ? appPaths.resolve.app('node_modules/.cache/quasar-app-extension-ssg') : appPaths.resolve.app('.ssg-build');
  }

  if (!isAbsolute(conf.ssg.buildDir)) {
    conf.ssg.buildDir = join(appPaths.appDir, conf.ssg.buildDir);
  }

  // Set SSG distDir
  conf.ssg.distDir = conf.ssg.distDir || join(appPaths.appDir, 'dist', 'ssg');

  if (!isAbsolute(conf.ssg.distDir)) {
    conf.ssg.distDir = join(appPaths.appDir, conf.ssg.distDir);
  }

  // Set SSG cache.ignore
  if (conf.ssg.cache !== false) {
    const ignore = [
      join(conf.ssg.distDir, '/**'),
      join(conf.ssg.buildDir, '/**'),
      ...conf.build.distDir ? [join(conf.build.distDir, '/**')] : [],
      'dist/**',
      'public/**',
      'src-ssr/**',
      'src-cordova/**',
      'src-electron/**',
      'src-bex/**',
      'src/ssg.d.ts',
      'node_modules/**',
      '.**/*',
      '.*',
      'README.md',
    ];

    if (typeof conf.ssg.cache.ignore === 'function') {
      conf.ssg.cache.ignore = conf.ssg.cache.ignore(ignore);
    } else if (Array.isArray(conf.ssg.cache.ignore)) {
      conf.ssg.cache.ignore = getUniqueArray(conf.ssg.cache.ignore.concat(ignore));
    }
  }

  if (conf.ssg.inlineCriticalCss === void 0) {
    conf.ssg.inlineCriticalCss = prompts.inlineCriticalCss;
  }

  if (conf.ssg.inlineCssFromSFC === void 0) {
    conf.ssg.inlineCssFromSFC = prompts.inlineCssFromSFC;
  }

  if (conf.ctx.dev) {
    // force css inlining in development
    conf.build.extractCSS = false;
    conf.ssg.inlineCssFromSFC = true;

    // force disable beastcss
    // in development vue-style-loader remove styles at client-side before re-injecting it
    conf.inlineCriticalCss = false;
  }

  if (conf.ssg.shouldPrefetch === void 0) {
    conf.ssg.shouldPrefetch = () => false;
  }

  if (conf.ssg.shouldPreload === void 0) {
    conf.ssg.shouldPreload = () => false;
  }

  // Apply corrections to the body tag classes at client-side
  // because the client platform (mobile, desktop, ios, etc) is unknown at build-time.
  if (hasPackage('quasar', '< 2.11.2')) {
    conf.boot.push({ server: false, path: '~quasar-app-extension-ssg/src/boot/ssg-corrections.js' });
    conf.build.transpileDependencies.push(/quasar-app-extension-ssg[\\/]src[\\/]boot/);
  }

  conf.build.htmlFilename = conf.ssg.fallback;

  conf.build.ssrPwaHtmlFilename = conf.ssg.fallback;

  conf.build.vueLoaderOptions = {
    compilerOptions: {
      whitespace: 'condense',
    },
  };

  if (conf.ctx.dev) {
    conf.devServer.client = conf.devServer.client || {};

    if (conf.devServer.client.webSocketTransport === undefined || typeof conf.devServer.client.webSocketTransport === 'string') {
      let customClient;

      if (conf.devServer.webSocketServer === 'sockjs' || conf.devServer.client.webSocketTransport === 'sockjs') {
        customClient = require.resolve('./sockets/SockJSClient.js');
      } else {
        customClient = require.resolve('./sockets/WebSocketClient.js');
      }

      conf.devServer.client.webSocketTransport = customClient;
    }
  }
}

module.exports = class ExtendedQuasarConfFile extends QuasarConfFile {
  constructor(ctx, opts = {}) {
    super(ctx, opts);
  }

  async reboot() {
    const result = await super.reboot();

    if (this.webpackConfChanged !== false) {
      await this.addWebpackConf();
    }

    return result;
  }

  async compile() {
    const oldWatch = this.watch;

    extendQuasarConf(this.sourceCfg);

    this.webpackConfChanged = false;

    this.watch = false; // do not let Quasar set webpackConf prop

    this.ctx.modeName = 'ssr'; // needed to set publicPath correctly

    await super.compile();

    if (this.quasarConf.ssr.pwa) {
      const appDevDependencies = Object.keys(require(appPaths.resolve.app('package.json')).devDependencies);

      if (ssgDeps.pwa.some((dep) => !appDevDependencies.includes(dep))) {
        const nodePackager = require('@quasar/app-webpack/lib/helpers/node-packager');
        const defaultVersion = '^7.0.0';

        nodePackager.installPackage(
          ssgDeps.pwa.map((name) => `${name}@${defaultVersion}`),
          {
            isDevDependency: true, // new prop name
            isDev: true, // old prop name
            displayName: 'PWA dependencies for SSG',
          },
        );
      }
    }

    this.ctx.modeName = 'ssg';

    Object.assign(this.quasarConf.build.env, {
      MODE: this.ctx.modeName,
    });

    this.watch = oldWatch;

    // If watching for changes then determine the type of them (webpack or not).
    // The snapshot below should only contain webpack config:
    if (this.watch) {
      const cfg = this.sourceCfg;

      const newConfigSnapshot = [
        cfg.build ? encode(cfg.build) : '',
        cfg.ssr && cfg.ssr.pwa ? encode(cfg.ssr.pwa) : '',
        cfg.framework ? cfg.framework.autoImportComponentCase : '',
        cfg.devServer ? encode(cfg.devServer) : '',
        cfg.pwa ? encode(cfg.pwa) : '',
        cfg.htmlVariables ? encode(cfg.htmlVariables) : '',
      ].join('');

      if (this.oldConfigSnapshot) {
        this.webpackConfChanged = newConfigSnapshot !== this.oldConfigSnapshot;
      }

      this.oldConfigSnapshot = newConfigSnapshot;
    }
  }

  async addWebpackConf() {
    const createWebpackConfigs = require('./create-webpack-configs');
    this.webpackConf = await createWebpackConfigs(this.quasarConf);
  }
};
