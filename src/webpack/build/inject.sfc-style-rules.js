/* eslint-disable global-require */
const { join, win32 } = require('path');
const { requireFromApp } = require('../../api');

const appPaths = requireFromApp('@quasar/app-webpack/lib/app-paths');
const { merge } = requireFromApp('webpack-merge');
const cssVariables = requireFromApp('@quasar/app-webpack/lib/helpers/css-variables');

const postCssConfigFile = appPaths.resolve.app('.postcssrc.js');

const quasarCssPaths = [
  join('node_modules', 'quasar', 'dist'),
  join('node_modules', 'quasar', 'src'),
  join('node_modules', '@quasar'),
];

const absoluteUrlRE = /^[a-z][a-z0-9+.-]*:/i;
const protocolRelativeRE = /^\/\//;
const templateUrlRE = /^[{}[\]#*;,'§$%&(=?`´^°<>]/;
const rootRelativeUrlRE = /^\//;

/**
 * Inspired by loader-utils > isUrlRequest()
 * Mimics Webpack v4 & css-loader v3 behavior
 */
function shouldRequireUrl(url) {
  return (
    // an absolute url and it is not `windows` path like `C:\dir\file`:
    (absoluteUrlRE.test(url) === true && win32.isAbsolute(url) === false)
    // a protocol-relative:
    || protocolRelativeRE.test(url) === true
    // some kind of url for a template:
    || templateUrlRE.test(url) === true
    // not a request if root isn't set and it's a root-relative url
    || rootRelativeUrlRE.test(url) === true
  ) === false;
}

function create(
  rule,
  modules,
  pref,
  loader,
  loaderOptions,
) {
  if (rule.uses.has('null-loader')) {
    rule.uses.delete('null-loader');
  }

  if (rule.uses.has('mini-css-extract')) {
    rule.uses.delete('mini-css-extract');
  }

  /**
  * replace vue-style-loader by @freddy38510/vue-style-loader
  * which has consistent ssrId hashes between client and server
  * https://github.com/freddy38510/vue-style-loader/commit/54d6307692790136dfbda64ead5f8ad35d46390f
  */
  if (rule.uses.has('vue-style-loader')) {
    rule
      .use('vue-style-loader')
      .loader('@freddy38510/vue-style-loader')
      .tap((options) => merge(options, {
        ssrId: true,
      }));
  } else {
    rule
      .use('vue-style-loader')
      .loader('@freddy38510/vue-style-loader')
      .options({
        sourceMap: pref.sourceMap,
        ssrId: true,
      })
      .before('css-loader');
  }

  let numberOfLoaders = loader ? 1 : 0;

  if (loader === 'sass-loader') {
    numberOfLoaders = 2;
  }

  const cssLoaderOptions = {
    sourceMap: pref.sourceMap,
    url: { filter: shouldRequireUrl },
    importLoaders:
      1 // stylePostLoader injected by vue-loader
      + 1 // postCSS loader
      + (pref.minify ? 1 : 0) // postCSS with cssnano
      + numberOfLoaders,
  };

  if (modules) {
    Object.assign(cssLoaderOptions, {
      modules: {
        localIdentName: '[name]_[local]_[hash:base64:5]',
        exportOnlyLocals: false,
      },
    });
  }

  if (rule.uses.has('css-loader')) {
    rule
      .use('css-loader')
      .tap(() => cssLoaderOptions);
  } else {
    rule.use('css-loader')
      .loader('css-loader')
      .options(cssLoaderOptions);
  }

  if (pref.minify && !rule.uses.has('cssnano')) {
    // needs to be applied separately,
    // otherwise it messes up RTL
    rule
      .use('cssnano')
      .loader('postcss-loader')
      .options({
        sourceMap: pref.sourceMap,
        postcssOptions: {
          plugins: [
            requireFromApp('cssnano')({
              preset: ['default', {
                mergeLonghand: false,
                convertValues: false,
                cssDeclarationSorter: false,
                reduceTransforms: false,
              }],
            }),
          ],
        },
      });
  }

  if (!rule.uses.has('postcss-loader')) {
    // need a fresh copy, otherwise plugins
    // will keep on adding making N duplicates for each one
    delete require.cache[postCssConfigFile];
    // eslint-disable-next-line import/no-dynamic-require
    const postCssConfig = require(postCssConfigFile);
    let postCssOpts = { sourceMap: pref.sourceMap, ...postCssConfig };

    if (pref.rtl) {
      const postcssRTL = requireFromApp('postcss-rtlcss');

      const postcssRTLOptions = pref.rtl === true ? {} : pref.rtl;
      if (
        typeof postCssConfig.plugins !== 'function'
        && (postcssRTLOptions.source === 'ltr' || typeof postcssRTLOptions === 'function')
      ) {
        const originalPlugins = postCssOpts.plugins ? [...postCssOpts.plugins] : [];

        postCssOpts = (ctx) => {
          const plugins = [...originalPlugins];
          const isClientCSS = quasarCssPaths.every((item) => ctx.resourcePath.indexOf(item) === -1);

          plugins.push(postcssRTL(
            typeof postcssRTLOptions === 'function'
              ? postcssRTLOptions(isClientCSS, ctx.resourcePath)
              : {
                ...postcssRTLOptions,
                source: isClientCSS ? 'rtl' : 'ltr',
              },
          ));

          return { sourceMap: pref.sourceMap, plugins };
        };
      } else {
        postCssOpts.plugins.push(postcssRTL(postcssRTLOptions));
      }
    }

    rule.use('postcss-loader')
      .loader('postcss-loader')
      .options({ postcssOptions: postCssOpts });
  }

  if (loader && !rule.uses.has(loader)) {
    rule
      .use(loader)
      .loader(loader)
      .options({
        sourceMap: pref.sourceMap,
        ...loaderOptions,
      });

    if (loader === 'sass-loader') {
      if (
        loaderOptions
        && loaderOptions.sassOptions
        && loaderOptions.sassOptions.indentedSyntax
      ) {
        rule
          .use('quasar-sass-variables-loader')
          .loader(cssVariables.loaders.sass);
      } else {
        rule
          .use('quasar-scss-variables-loader')
          .loader(cssVariables.loaders.scss);
      }
    }
  }
}

function injectRule(
  chain,
  pref,
  lang,
  test,
  loader = undefined,
  loaderOptions = undefined,
) {
  const baseRule = chain.module.rule(lang).test(test).after('mjs');

  if (pref.inlineCssFromSFC) {
    // rules for Vue SFC <style module>
    const modulesRule = baseRule.oneOf('modules-query').resourceQuery(/module/);
    create(modulesRule, true, pref, loader, loaderOptions);

    // rules for Vue SFC <style>
    const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/).after('modules-query');
    create(vueNormalRule, false, pref, loader, loaderOptions);
  }

  if (!pref.extract) {
    // rules for *.module.* files
    const modulesExtRule = baseRule.oneOf('modules-ext').test(/\.module\.\w+$/);
    create(modulesExtRule, true, pref, loader, loaderOptions);

    const normalRule = baseRule.oneOf('normal');
    create(normalRule, false, pref, loader, loaderOptions);
  }
}

module.exports = function injectSFCStyleRules(chain, pref) {
  injectRule(
    chain,
    pref,
    'css',
    /\.css$/,
  );

  injectRule(
    chain,
    pref,
    'stylus',
    /\.styl(us)?$/,
    'stylus-loader',
    pref.stylusLoaderOptions,
  );

  injectRule(
    chain,
    pref,
    'scss',
    /\.scss$/,
    'sass-loader',
    merge(
      { sassOptions: { outputStyle: /* required for RTL */ 'expanded' } },
      pref.scssLoaderOptions,
    ),
  );

  injectRule(
    chain,
    pref,
    'sass',
    /\.sass$/,
    'sass-loader',
    merge(
      {
        sassOptions: {
          indentedSyntax: true,
          outputStyle: /* required for RTL */ 'expanded',
        },
      },
      pref.sassLoaderOptions,
    ),
  );

  injectRule(
    chain,
    pref,
    'less',
    /\.less$/,
    'less-loader',
    pref.lessLoaderOptions,
  );
};
