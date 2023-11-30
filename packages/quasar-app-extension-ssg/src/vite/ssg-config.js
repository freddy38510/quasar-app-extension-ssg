const { join } = require('path');
const appPaths = require('@quasar/app-vite/lib/app-paths');
const {
  createViteConfig,
  extendViteConfig,
  mergeViteConfig,
} = require('@quasar/app-vite/lib/config-tools');
const pwaConfig = require('@quasar/app-vite/lib/modes/pwa/pwa-config');
const quasarVitePluginPwaResources = require(
  '@quasar/app-vite/lib/modes/pwa/vite-plugin.pwa-resources',
);
const { plugin: ssgVitePlugin } = require('./plugins/vite.ssg');
const { viteVersion } = require('./helpers/banner-global');

module.exports = {
  viteClient: (quasarConf) => {
    let cfg = createViteConfig(quasarConf, 'ssr-client');

    cfg = mergeViteConfig(cfg, {
      define: {
        'process.env.CLIENT': true,
        'process.env.SERVER': false,
        __QUASAR_SSR_PWA__: quasarConf.ssr.pwa === true,
      },
      server: {
        middlewareMode: 'ssr',
      },
      build: {
        ssrManifest: true,
        outDir: join(quasarConf.ssg.compilationDir, 'client'),
      },
    });

    if (quasarConf.ssr.pwa === true) {
      cfg.plugins.push(quasarVitePluginPwaResources(quasarConf));
    }

    // dev has js entry-point, while prod has index.html
    if (quasarConf.ctx.dev) {
      cfg.build.rollupOptions = cfg.build.rollupOptions || {};
      cfg.build.rollupOptions.input = appPaths.resolve.app(
        '.quasar/client-entry.js',
      );
    }

    cfg.plugins.push(ssgVitePlugin(quasarConf, 'ssr-client'));

    if (viteVersion.charAt(0) > 2) {
      cfg.appType = 'custom';
      cfg.build.modulePreload = { polyfill: quasarConf.build.polyfillModulePreload };
      cfg.server.middlewareMode = true;

      if (cfg.server.hmr === true || cfg.server.hmr === void 0) {
        cfg.server.hmr = { port: 24681 };
      }

      delete cfg.build.polyfillModulePreload; // deprecated
    }

    return extendViteConfig(cfg, quasarConf, { isClient: true });
  },

  viteServer: (quasarConf) => {
    // https://nodejs.org/api/process.html#processsetsourcemapsenabledval
    const isSourceMapSupported = 'setSourceMapsEnabled' in process;

    let cfg = createViteConfig(quasarConf, 'ssr-server');

    cfg = mergeViteConfig(cfg, {
      define: {
        'process.env.CLIENT': false,
        'process.env.SERVER': true,
        __QUASAR_SSR_PWA__: quasarConf.ssr.pwa === true,
      },
      server: {
        hmr: false, // let client config deal with it
        middlewareMode: 'ssr',
      },
      ssr: {
        noExternal: [
          /\/esm\/.*\.js$/,
          /\.(es|esm|esm-browser|esm-bundler).js$/,
        ],
      },
      build: {
        ssr: true,
        outDir: join(quasarConf.ssg.compilationDir, 'server'),
        // keep stack traces readable in any cases
        minify: isSourceMapSupported ? !quasarConf.ctx.debug : false,
        sourcemap: isSourceMapSupported,
        rollupOptions: {
          input: appPaths.resolve.app('.quasar/server-entry.js'),
        },
      },
      publicDir: false, // No need to copy public files to SSR directory
    });

    cfg.plugins.push(ssgVitePlugin(quasarConf, 'ssr-server'));

    if (viteVersion.charAt(0) > 2) {
      if (!cfg.legacy) {
        cfg.legacy = {};
      }

      cfg.appType = 'custom';
      cfg.build.modulePreload = { polyfill: quasarConf.build.polyfillModulePreload };
      cfg.legacy.buildSsrCjsExternalHeuristics = true;
      cfg.server.middlewareMode = true;
      cfg.ssr.format = 'cjs';

      delete cfg.build.polyfillModulePreload; // deprecated
    }

    return extendViteConfig(cfg, quasarConf, { isServer: true });
  },

  workbox: (quasarConf) => {
    // we need to detour the distDir temporarily
    const originalCompilationDir = quasarConf.build.distDir;
    quasarConf.build.distDir = quasarConf.ssg.distDir;

    const opts = pwaConfig.workbox(quasarConf);

    // restore distDir
    quasarConf.build.distDir = originalCompilationDir;

    return opts;
  },
  customSw: (quasarConf) => {
    const promise = pwaConfig.customSw(quasarConf);

    return promise.then((cfg) => {
      cfg.define['process.env.PWA_FALLBACK_HTML'] = JSON.stringify(
        quasarConf.ssg.fallback,
      );

      if (quasarConf.ctx.dev) {
        const customSWEnsureSSGModePlugin = require('./plugins/esbuild.custom-sw-ensure-ssg-mode');

        cfg.plugins = cfg.plugins || [];

        cfg.plugins.unshift(customSWEnsureSSGModePlugin(quasarConf));
      }

      return cfg;
    });
  },
};
