/* eslint-disable no-void */
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const { join, isAbsolute } = require('path')
const { merge } = require('webpack-merge')
const appRequire = require('./helpers/app-require')
const getUniqueArray = require('./helpers/get-unique-array')

const extendQuasarConf = function extendQuasarConf (conf, api) {
  conf.ssg = merge({
    concurrency: 10,
    interval: 0,
    fallback: '404.html',
    cache: {
      ignore: [],
      globbyOptions: {
        gitignore: true
      }
    },
    rendererOptions: {}
  }, conf.ssg ? conf.ssg : {})

  // Set SSG distDir
  conf.ssg.__distDir = conf.build.distDir || join(api.appDir, 'dist', 'ssg')

  if (!isAbsolute(conf.ssg.__distDir)) {
    conf.ssg.__distDir = join(api.appDir, conf.ssg.__distDir)
  }

  // Set SSG buildDir
  if (!conf.ssg.buildDir) {
    if (conf.ssg.cache !== false) {
      conf.ssg.buildDir = api.resolve.app('node_modules/.cache/quasar-app-extension-ssg')
    } else {
      conf.ssg.buildDir = api.resolve.app('.ssg-build')
    }
  }

  if (!isAbsolute(conf.ssg.buildDir)) {
    conf.ssg.buildDir = join(api.appDir, conf.ssg.buildDir)
  }

  // Overrides it to expect build output folder in SSR mode being our SSG buildDir
  conf.build.distDir = conf.ssg.buildDir

  // Set inline critical css
  if (conf.ssg.criticalCss === void 0) {
    conf.ssg.criticalCss = api.prompts.criticalCss
  }

  // Set SSG cache.ignore
  if (conf.ssg.cache !== false) {
    const ignore = [
      join(conf.ssg.__distDir, '/**'),
      join(conf.ssg.buildDir, '/**'),
      'dist/**',
      'public/**',
      'src-ssr/**',
      'src-cordova/**',
      'src-electron/**',
      'src-bex/**',
      'node_modules/**',
      '.**/*',
      '.*',
      'README.md'
    ]

    if (typeof conf.ssg.cache.ignore === 'function') {
      conf.ssg.cache.ignore = conf.ssg.cache.ignore(ignore)
    } else if (Array.isArray(conf.ssg.cache.ignore)) {
      conf.ssg.cache.ignore = getUniqueArray(conf.ssg.cache.ignore.concat(ignore))
    }

    // Needed for PWA InjectManifest mode
    conf.sourceFiles.serviceWorker = conf.sourceFiles.serviceWorker || 'src-pwa/custom-service-worker.js'
  }

  if (conf.ssg.routes === void 0) {
    conf.ssg.routes = ['/']
  }

  // Client takeover to set body classes like desktop/mobile, touch/no-touch, etc...
  // The server can't know the platform used from the browser at build time.
  conf.boot.push({ server: false, path: '~quasar-app-extension-ssg/src/boot/body-classes' })

  conf.build.transpileDependencies.push(/quasar-app-extension-ssg[\\/]src/)

  conf.build.htmlFilename = conf.ssg.fallback

  conf.build.ssrPwaHtmlFilename = conf.ssg.fallback

  conf.build.vueRouterMode = 'history'
}

const chainWebpack = function ({ isClient, isServer }, chain, api, quasarConf) {
  if (isClient) {
    if (!api.ctx.mode.pwa) {
      const injectHtml = appRequire('@quasar/app/lib/webpack/inject.html', api.appDir)

      const cfg = merge(quasarConf, {
        build: {
          distDir: join(quasarConf.build.distDir, 'www')
        }
      })

      injectHtml(chain, cfg)
    } else {
      // handle workbox after build instead of webpack
      // This way all assets could be precached, including generated html
      chain.plugins.delete('workbox')

      if (quasarConf.pwa.workboxPluginMode === 'InjectManifest') {
        const filename = chain.output.get('filename')

        // compile custom service worker to /service-worker.js
        chain
          .entry('service-worker')
          .add(api.resolve.app(quasarConf.sourceFiles.serviceWorker))

        chain.output.filename((pathData) => {
          return pathData.chunk.name === 'service-worker' ? '[name].js' : filename
        })
      }
    }
  }

  if (isServer) {
    const SsrArtifacts = require('./webpack/plugin.ssr-artifacts')

    chain.plugin('ssr-artifacts')
      .use(SsrArtifacts, [quasarConf, api])
  }
}

module.exports = function (api) {
  api.registerCommand('generate', () =>
    require('./bin/ssg-generate')(api)
  )

  api.registerCommand('inspect', () =>
    require('./bin/inspect')(api)
  )

  api.registerCommand('serve', () => require('./bin/server')(api))

  // Make sure we are running from command "quasar ssg"
  if (api.ctx.prod && api.ctx.mode.ssr && process.argv[2] === 'ssg') {
    let quasarConf = {}

    api.extendQuasarConf((conf, api) => {
      extendQuasarConf(conf, api)

      quasarConf = conf
    })

    api.chainWebpack((chain, { isClient, isServer }, api) => chainWebpack({ isClient, isServer }, chain, api, quasarConf))

    // We do not use webserver for SSG
    api.chainWebpackWebserver((chain) => chain.plugins.delete('progress'))
  }
}
