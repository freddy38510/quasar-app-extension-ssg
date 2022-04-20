const requireFromApp = require('../../../helpers/require-from-app');

const PwaManifestPlugin = requireFromApp('@quasar/app/lib/webpack/pwa/plugin.pwa-manifest');
const HtmlPwaPlugin = require('./plugin.html-pwa').plugin;

module.exports = function chainWebpackClient(chain, cfg) {
  // write manifest.json file
  chain.plugin('pwa-manifest')
    .use(PwaManifestPlugin, [cfg]);

  chain.plugin('html-pwa')
    .use(HtmlPwaPlugin, [cfg]);
};
