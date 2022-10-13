/* eslint-disable global-require */

const { join } = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

const appPaths = require('./app-paths');
const { requireFromApp } = require('./helpers/packages');
const { plugin: ssgVitePlugin } = require('./plugins/vite.ssg');

const { createViteConfig, extendViteConfig, mergeViteConfig } = requireFromApp(
  '@quasar/app-vite/lib/config-tools.js',
);
const pwaConfig = requireFromApp('@quasar/app-vite/lib/modes/pwa/pwa-config');
const quasarVitePluginPwaResources = requireFromApp(
  '@quasar/app-vite/lib/modes/pwa/vite-plugin.pwa-resources',
);

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

    // In case if the app extension package is linked (yarn link) while developing it
    // make sure to resolve modules correctly.
    cfg.plugins.unshift(nodeResolve({
      moduleDirectories: [
        'node_modules',
        join(__dirname, '../../node_modules'),
        appPaths.resolve.app('node_modules'),
      ],
    }));

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

    return extendViteConfig(cfg, quasarConf, { isClient: true });
  },

  viteServer: (quasarConf) => {
    let cfg = createViteConfig(quasarConf, 'ssr-server');

    cfg = mergeViteConfig(cfg, {
      target: quasarConf.build.target.node,
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
        rollupOptions: {
          input: appPaths.resolve.app('.quasar/server-entry.js'),
        },
      },
    });

    cfg.plugins.push(ssgVitePlugin(quasarConf, 'ssr-server'));

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
