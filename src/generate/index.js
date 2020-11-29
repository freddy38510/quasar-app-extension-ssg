const fs = require('fs-extra')
const { join } = require('path')
const Generator = require('./generator')
const appRequire = require('./../helpers/app-require')
const banner = require('./../helpers/banner').generate
const { log, warn } = require('../helpers/logger')

module.exports = async (api, quasarConf) => {
  const { add, clean } = appRequire('@quasar/app/lib/artifacts', api.appDir)

  const generator = new Generator(api, quasarConf)

  banner()

  clean(quasarConf.ssg.__distDir)

  log('Copying assets...')

  await fs.copy(join(quasarConf.build.distDir, 'www'), quasarConf.ssg.__distDir)

  if (quasarConf.ssg.criticalCss) {
    try {
      log('Inlining critical CSS for fallback...')

      const fallbackFile = join(quasarConf.ssg.__distDir, quasarConf.ssg.fallback)

      let fallbackHtml = await fs.readFile(fallbackFile, 'utf-8')

      fallbackHtml = await generator.inlineCriticalCss(fallbackHtml)

      await fs.writeFile(fallbackFile, fallbackHtml)
    } catch (error) {
      warn(error.stack || error)
    }
  }

  await generator.generateAll()

  if (quasarConf.ctx.mode.pwa) {
    const buildWorkbox = require('./workbox.js')

    try {
      await buildWorkbox(api, quasarConf)
    } catch (error) {
      warn(error.stack || error)

      warn('Could not build service-worker.js')
    }
  }

  if (typeof quasarConf.ssg.afterGenerate === 'function') {
    const glob = require('glob')

    const files = glob.sync('**/*.html', {
      cwd: quasarConf.ssg.__distDir,
      absolute: true
    })

    try {
      log('Running afterGenerate hook...')

      await quasarConf.ssg.afterGenerate(files, quasarConf.ssg.__distDir)
    } catch (error) {
      warn(error)
    }
  }

  add(quasarConf.ssg.__distDir)

  banner(quasarConf.ssg)
}
