const { join } = require('path');
const { writeFileSync } = require('fs');
const AppBuilder = require('@quasar/app-vite/lib/app-builder');
const {
  getProdSsrTemplateFn,
  transformProdSsrPwaOfflineHtml: transformProdSsgFallbackHtml,
} = require('@quasar/app-vite/lib/helpers/html-template');
const config = require('./ssg-config');
const PagesGenerator = require('./PagesGenerator');

class SsgBuilder extends AppBuilder {
  quasarConf;

  ctx;

  constructor({ argv, quasarConf }) {
    super({ argv, quasarConf });

    this.quasarConf = quasarConf;
    this.ctx = quasarConf.ctx;

    this.quasarConf.build.distDir = quasarConf.ssg.compilationDir;
  }

  async compile() {
    if (this.quasarConf.ssr.pwa === true) {
      const { injectPwaManifest } = require(
        '@quasar/app-vite/lib/modes/pwa/utils',
      );

      injectPwaManifest(this.quasarConf);
    }

    const viteClientConfig = await config.viteClient(this.quasarConf);
    await this.buildWithVite('SSR Client', viteClientConfig);

    this.moveFile(
      `${viteClientConfig.build.outDir}/ssr-manifest.json`,
      'quasar.manifest.json',
    );

    await this.#writeRenderTemplate(viteClientConfig.build.outDir);

    if (this.quasarConf.ssr.pwa === true) {
      // we need to detour the distDir temporarily
      const originalDistDir = this.quasarConf.build.distDir;
      this.quasarConf.build.distDir = join(
        this.quasarConf.build.distDir,
        'client',
      );

      writeFileSync(
        join(
          this.quasarConf.build.distDir,
          this.quasarConf.pwa.manifestFilename,
        ),
        JSON.stringify(
          this.quasarConf.htmlVariables.pwaManifest,
          null,
          this.quasarConf.build.minify !== false ? void 0 : 2,
        ),
        'utf-8',
      );

      if (this.quasarConf.pwa.workboxMode === 'injectManifest') {
        const esbuildConfig = await config.customSw(this.quasarConf);
        await this.buildWithEsbuild('Custom SW', esbuildConfig);
      }

      // restore distDir
      this.quasarConf.build.distDir = originalDistDir;
    }

    const viteServerConfig = await config.viteServer(this.quasarConf);
    await this.buildWithVite('SSR Server', viteServerConfig);
  }

  async generatePages() {
    this.#copyCompiledFiles();

    const createRenderFn = require('./ssg-create-render-fn');

    const pagesGenerator = new PagesGenerator(this.quasarConf, createRenderFn(this.quasarConf));

    await pagesGenerator.generate();

    if (this.quasarConf.ctx.mode.pwa) {
      const { buildPwaServiceWorker } = require('./helpers/pwa-utils');

      const workboxConfig = await config.workbox(this.quasarConf);

      await buildPwaServiceWorker(this.quasarConf.pwa.workboxMode, workboxConfig);
    }

    this.printSummary(this.quasarConf.ssg.distDir, true);

    if (this.quasarConf.ssg.cache === false) {
      this.removeFile(this.quasarConf.ssg.compilationDir);
    }
  }

  #copyCompiledFiles() {
    this.copyFiles([
      {
        from: join(this.quasarConf.ssg.compilationDir, 'client'),
        to: this.quasarConf.ssg.distDir,
      },
    ]);
  }

  async #writeRenderTemplate(clientDir) {
    const htmlFile = join(clientDir, 'index.html');
    const html = this.readFile(htmlFile);

    const templateFn = await getProdSsrTemplateFn(html, this.quasarConf);

    this.writeFile('render-template.js', `module.exports=${templateFn.source}`);

    this.writeFile(
      `client/${this.quasarConf.ssg.fallback}`,
      await transformProdSsgFallbackHtml(html, this.quasarConf),
    );

    this.removeFile(htmlFile);
  }
}

module.exports = SsgBuilder;
