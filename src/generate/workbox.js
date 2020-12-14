const path = require('path')
const { merge } = require('webpack-merge')
const { generateSW, injectManifest } = require('workbox-build')
const { log } = require('../helpers/logger')

module.exports = async function (api, quasarConf) {
  const mode = quasarConf.pwa.workboxPluginMode
  let defaultOptions

  if (mode === 'GenerateSW') {
    const pkg = require(api.resolve.app('package.json'))
    const assets = require(path.join(quasarConf.build.distDir, 'quasar.client-manifest.json')).all
    const assetsExt = assets.map(asset => path.extname(asset).slice(1)).join()

    defaultOptions = {
      cacheId: pkg.name || 'quasar-pwa-app',
      globDirectory: quasarConf.ssg.__distDir,
      // globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff,woff2}'],
      globPatterns: [`**/*.{${assetsExt},html}`],
      globIgnores: [
        'service-worker.js',
        'workbox-*.js',
        'asset-manifest.json'
      ],
      navigateFallback: false, // quasarConf.ssg.fallback,
      sourcemap: false,
      directoryIndex: 'index.html',
      dontCacheBustURLsMatching: /(\.js$|\.css$|fonts\/)/,
      modifyURLPrefix: {
        '': quasarConf.build.publicPath
      }
    }

    log('[GenerateSW] Generating a service-worker file...')
  } else {
    defaultOptions = {
      swSrc: api.resolve.app(quasarConf.sourceFiles.serviceWorker)
    }

    log('[InjectManifest] Using your custom service-worker written file...')
  }

  let opts = {
    ...defaultOptions,
    ...quasarConf.pwa.workboxOptions
  }

  // Let user specify their own options
  // opts.globIgnores = opts.exclude || []

  delete opts.exclude

  if (quasarConf.ssr.pwa && quasarConf.ssr.pwa !== true) {
    opts = merge(opts, quasarConf.ssr.pwa)
  }

  if (mode === 'GenerateSW') {
    if (opts.navigateFallback === false) {
      delete opts.navigateFallback
    } else {
      opts.navigateFallbackDenylist = opts.navigateFallbackDenylist || []
      opts.navigateFallbackDenylist.push(/service-worker\.js$/, /workbox-(.)*\.js$/)
    }
  }

  opts.globDirectory = quasarConf.ssg.__distDir
  opts.swDest = path.join(quasarConf.ssg.__distDir, 'service-worker.js')

  if (mode === 'GenerateSW') {
    await generateSW(opts)
  } else {
    await injectManifest(opts)
  }
}
