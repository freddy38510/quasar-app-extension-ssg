const { join, isAbsolute } = require('path');
const { merge } = require('webpack-merge');
const appPaths = require('@quasar/app-vite/lib/app-paths');
const QuasarConfFile = require('@quasar/app-vite/lib/quasar-config-file');
const { hasPackage } = require('../api');

function getUniqueArray(original) {
  return Array.from(new Set(original));
}

function extendQuasarConf(conf) {
  // Set SSG compilationDir
  if (conf.ssg.compilationDir === void 0) {
    conf.ssg.compilationDir = conf.ssg.cache !== false
      ? appPaths.resolve.app('node_modules/.cache/quasar-app-extension-ssg')
      : appPaths.resolve.app('.ssg-compilation');
  }
  if (!isAbsolute(conf.ssg.compilationDir)) {
    conf.ssg.compilationDir = join(appPaths.appDir, conf.ssg.compilationDir);
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
      join(conf.ssg.compilationDir, '/**'),
      join(conf.build.distDir, '/**'),
      'dist/**',
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
      conf.ssg.cache.ignore = getUniqueArray(
        conf.ssg.cache.ignore.concat(ignore),
      );
    }
  }

  if (conf.ssg.inlineCriticalCss === void 0) {
    const extensionJson = require(
      '@quasar/app-vite/lib/app-extension/extension-json',
    );

    conf.ssg.inlineCriticalCss = extensionJson.getPrompts('ssg').inlineCriticalCss;
  }

  // force disable inlineCriticalCss feature in development
  if (conf.ctx.dev) {
    conf.ssg.inlineCriticalCss = false;
  }

  if (conf.ssg.shouldPrefetch === void 0) {
    conf.ssg.shouldPrefetch = () => false;
  }

  if (conf.ssg.shouldPreload === void 0) {
    conf.ssg.shouldPreload = ({ type, isLazilyHydrated }) => type === 'script' && !isLazilyHydrated;
  }

  // Apply corrections to the body tag classes at client-side
  // because the client platform (mobile, desktop, ios, etc) is unknown at build-time.
  if (hasPackage('quasar', '< 2.11.2')) {
    conf.boot.push({
      server: false,
      path: 'quasar-app-extension-ssg/src/boot/ssg-corrections.js',
    });
  }

  // Replace pwa html file by fallback html file
  conf.ssr.ssrPwaHtmlFilename = conf.ssg.fallback;
}

module.exports = class ExtendedQuasarConfFile extends QuasarConfFile {
  #ctx;

  constructor({ ctx, host, port }) {
    super({ ctx, host, port });

    this.#ctx = ctx;
  }

  async read() {
    // needed to set publicPath correctly
    this.#ctx.modeName = 'ssr';

    const cfg = merge(
      {
        ssg: {
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
          robotoFontDisplay: 'optional',
        },
      },
      await super.read(),
    );

    // restore ssg mode name
    this.#ctx.modeName = 'ssg';

    if (cfg.ctx) {
      cfg.ctx.modeName = 'ssg';
    }

    Object.assign(cfg.build.env, {
      MODE: this.#ctx.modeName,
    });

    extendQuasarConf(cfg);

    return cfg;
  }
};
