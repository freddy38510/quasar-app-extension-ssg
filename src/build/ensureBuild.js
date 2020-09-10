const destr = require('destr')
const fs = require('fs-extra')
const path = require('path')
const upath = require('upath')
const build = require('./')
const { log } = require('./../helpers/logger')
const { snapshot, compareSnapshots } = require('./snapshot')
const semverGte = require('semver/functions/gte')

module.exports = async function ensureBuild (api, quasarConfig, ctx, extensionRunner, forceBuild = false) {
  const isVersionUp = semverGte(api.getPackageVersion('@quasar/app'), '2.1.0')
  const quasarConf = isVersionUp ? quasarConfig.quasarConf : quasarConfig.getBuildConfig()
  const options = quasarConf.ssg

  if (options.cache === false || forceBuild) {
    await build(api, quasarConfig, ctx, extensionRunner)
    return
  }

  // Take a snapshot of current project
  const snapshotOptions = {
    rootDir: api.appDir,
    ignore: options.cache.ignore.map(upath.normalize),
    globbyOptions: options.cache.globbyOptions
  }

  const currentBuildSnapshot = await snapshot(snapshotOptions)

  // Current build meta
  const currentBuild = {
    quasarVersion: api.getPackageVersion('quasar'),
    quasarAppVersion: api.getPackageVersion('@quasar/app'),
    quasarExtrasVersion: api.getPackageVersion('@quasar/extras'),
    ssr: quasarConf.ssr,
    snapshot: currentBuildSnapshot
  }

  // Check if build can be skipped
  const quasarBuildFile = path.resolve(options.buildDir, 'build.json')

  if (fs.existsSync(quasarBuildFile)) {
    const previousBuild = destr(fs.readFileSync(quasarBuildFile, 'utf-8')) || {}

    // Quick diff
    let needBuild = false
    for (const field of ['quasarVersion', 'quasarAppVersion', 'quasarExtrasVersion', 'ssr']) {
      if (JSON.stringify(previousBuild[field]) !== JSON.stringify(currentBuild[field])) {
        needBuild = true
        log(`Doing webpack rebuild because ${field} changed`)
        break
      }
    }

    // Full snapshot diff
    if (!needBuild) {
      log('Comparing previous build with current build...')
      const changed = compareSnapshots(previousBuild.snapshot, currentBuild.snapshot)
      if (!changed) {
        log('Skipping webpack build as no changes detected')
        return
      } else {
        log(`Doing webpack rebuild because ${changed} modified`)
      }
    }
  }

  await build(api, quasarConfig, ctx, extensionRunner)

  // Write build.json
  fs.writeFileSync(quasarBuildFile, JSON.stringify(currentBuild, null, 2), 'utf-8')
}
