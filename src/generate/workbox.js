const { join, extname } = require('path')
const { merge } = require('webpack-merge')
const { generateSW } = require('workbox-build')
const { log } = require('../helpers/logger')

module.exports = async function (api, quasarConf) {
  let defaultOptions

  const pluginMode = quasarConf.pwa.workboxPluginMode

  if (pluginMode === 'GenerateSW') {
    const pkg = require(api.resolve.app('package.json'))
    const assets = require(join(quasarConf.build.distDir, 'quasar.client-manifest.json')).all
    const assetsExt = assets.map(asset => extname(asset).slice(1)).join()

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

  if (pluginMode === 'GenerateSW') {
    if (opts.navigateFallback === false) {
      delete opts.navigateFallback
    }
  }

  opts.swDest = join(quasarConf.ssg.__distDir, 'service-worker.js')

  await generateSW({
    ...opts
  })
}
