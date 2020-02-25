/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const Generator = require('./generator.js')

async function runAfter (api, { quasarConf }) {
  await new Generator(api, quasarConf).generate()
}

function injectFallback (cfg, api, quasarConf) {
  const { extend } = require(api.resolve.app('node_modules/quasar'))

  const injectHtml = require(api.resolve.app('node_modules/@quasar/app/lib/webpack/inject.html'))

  const newConf = {
    build: {
      htmlFilename: api.prompts.fallback.filename,
      distDir: quasarConf.build.distDir + '/www'
    }
  }

  let conf = {}

  conf = extend(true, conf, quasarConf, newConf)

  injectHtml(cfg, conf)

  if (conf.ssr.pwa) {
    const HtmlPwaPlugin = require(api.resolve.app('node_modules/@quasar/app/lib/webpack/pwa/plugin.html-pwa')).plugin
    cfg.plugin('html-pwa')
      .use(HtmlPwaPlugin, [conf])
  }
}

module.exports = function (api) {
  if (api.ctx.prod && api.ctx.mode.ssr && api.prompts.enable) {
    let quasarConf = {}

    api.extendQuasarConf((conf, api) => {
      quasarConf = conf

      conf.boot.push({ server: false, path: 'bodyClasses' })
    })

    api.chainWebpack((cfg, { isClient }, api) => {
      if (isClient) {
        if (api.prompts.fallback.enable) {
          injectFallback(cfg, api, quasarConf)
        }
      }
    })

    api.chainWebpackWebserver((cfg) => {
      const CopyWebpackPlugin = require('copy-webpack-plugin')

      const copyArray = []

      copyArray.push({
        from: api.resolve.app('.quasar/ssr-config.js'), to: `${quasarConf.build.distDir}/ssr.js`
      })

      cfg.plugin('copy-webpack')
        .use(CopyWebpackPlugin, [copyArray])
    })

    api.afterBuild(runAfter)
  }
}
