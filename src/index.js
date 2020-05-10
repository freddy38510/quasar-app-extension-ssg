/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const Generator = require('./generator.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const execa = require('execa')
const args = require('minimist')(process.argv.slice(2), { boolean: 'static' })

async function runAfter (api, { quasarConf }) {
  await new Generator(api, quasarConf).generate()
}

function injectSpaFallback (chain, api, quasarConf) {
  const { extend } = require(api.resolve.app('node_modules/quasar'))

  const injectHtml = require(api.resolve.app(
    'node_modules/@quasar/app/lib/webpack/inject.html.js'
  ))

  const cfg = extend(true, {}, quasarConf, {
    build: {
      htmlFilename: api.prompts.fallback.filename,
      distDir: quasarConf.build.distDir + '/www'
    }
  })

  injectHtml(chain, cfg)

  if (quasarConf.ssr.pwa) {
    const HtmlPwaPlugin = require(api.resolve.app(
      'node_modules/@quasar/app/lib/webpack/pwa/plugin.html-pwa'
    )).plugin
    chain.plugin('html-pwa').use(HtmlPwaPlugin, [cfg])
  }
}

module.exports = function (api) {
  api.registerCommand('build', () => {
    execa('quasar', ['build', '-m', 'ssr', '--static'],
      {
        cwd: api.resolve.app('.'),
        stdio: 'inherit'
      }
    )
  })

  if (api.ctx.prod && api.ctx.mode.ssr && args.static) {
    let quasarConf = {}

    api.extendQuasarConf((conf, _api) => {
      quasarConf = conf

      conf.boot.push({ server: false, path: 'bodyClasses' })
    })

    api.chainWebpack((cfg, { isClient }, api) => {
      if (isClient && api.prompts.fallback.enable) {
        injectSpaFallback(cfg, api, quasarConf)
      }
    })

    api.chainWebpackWebserver((cfg) => {
      const copyArray = []

      copyArray.push({
        from: api.resolve.app('.quasar/ssr-config.js'),
        to: `${quasarConf.build.distDir}/ssr.js`
      })

      cfg.plugin('copy-webpack').use(CopyWebpackPlugin, [copyArray])
    })

    api.afterBuild(runAfter)
  }
}
