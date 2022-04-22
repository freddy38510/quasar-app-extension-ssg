/* eslint-disable global-require */
const path = require('path');
const { merge } = require('webpack-merge');
const requireFromApp = require('../../helpers/require-from-app');
const appPaths = require('../../helpers/app-paths');

const cssVariables = requireFromApp('@quasar/app/lib/helpers/css-variables');
const postCssConfigFile = appPaths.resolve.app('.postcssrc.js');
const quasarCssPaths = [path.join('node_modules', 'quasar'), path.join('node_modules', '@quasar')];

function create(
  rule,
  modules,
  pref,
  loader,
  loaderOptions,
) {
  if (rule.uses.has('mini-css-extract')) {
    rule.uses.delete('mini-css-extract');
  }

  if (rule.uses.has('vue-style-loader')) {
    // add vue-style-loader ssrId option
    rule
      .use('vue-style-loader')
      .tap((options) => merge(options, {
        ssrId: true,
      }));
  } else {
    rule
      .use('vue-style-loader')
      .loader('vue-style-loader')
      .options({
        sourceMap: pref.sourceMap,
        ssrId: true,
      })
      .before('css-loader');
  }

  let numberOfLoaders = loader ? 1 : 0;

  if (loader === 'stylus-loader' || loader === 'sass-loader') {
    numberOfLoaders = 2;
  }

  const cssLoaderOptions = {
    sourceMap: pref.sourceMap,
    /* Embed style to quasar.server-manifest.json and in client side chunk
     * this let prerendering styles and inject styles for further navigation in SPA
     * "onlyLocals: true" is only useful for mini-css-extract-plugin which is not used here
     */
    onlyLocals: false,
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
      },
    });
  }

  if (rule.uses.has('css-loader')) {
    rule
      .use('css-loader')
      .tap(() => cssLoaderOptions);
  } else {
    rule.use('css-loader').loader('css-loader').options(cssLoaderOptions);
  }

  if (pref.minify && !rule.uses.has('cssnano')) {
    // needs to be applied separately,
    // otherwise it messes up RTL
    rule
      .use('cssnano')
      .loader('postcss-loader')
      .options({
        sourceMap: pref.sourceMap,
        plugins: [
          requireFromApp('cssnano')({
            preset: [
              'default',
              {
                mergeLonghand: false,
                convertValues: false,
                cssDeclarationSorter: false,
                reduceTransforms: false,
              },
            ],
          }),
        ],
      });
  }

  if (!rule.uses.has('postcss-loader')) {
    // need a fresh copy, otherwise plugins
    // will keep on adding making N duplicates for each one
    delete require.cache[postCssConfigFile];
    // eslint-disable-next-line import/no-dynamic-require
    const postCssConfig = require(postCssConfigFile);
    const postCssOpts = { sourceMap: pref.sourceMap, ...postCssConfig };

    if (pref.rtl) {
      const postcssRTL = requireFromApp('postcss-rtl');
      const postcssRTLOptions = pref.rtl === true ? {} : pref.rtl;

      if (
        typeof postCssConfig.plugins !== 'function'
        && (postcssRTLOptions.fromRTL === true || typeof postcssRTLOptions === 'function')
      ) {
        postCssConfig.plugins = postCssConfig.plugins || [];

        postCssOpts.plugins = (ctx) => {
          const plugins = [...postCssConfig.plugins];
          const isClientCSS = quasarCssPaths.every(
            (item) => ctx.resourcePath.indexOf(item) === -1,
          );

          plugins.push(postcssRTL(
            typeof postcssRTLOptions === 'function'
              ? postcssRTLOptions(isClientCSS, ctx.resourcePath)
              : {
                ...postcssRTLOptions,
                fromRTL: isClientCSS,
              },
          ));

          return plugins;
        };
      } else {
        postCssOpts.plugins.push(postcssRTL(postcssRTLOptions));
      }
    }

    rule.use('postcss-loader')
      .loader('postcss-loader')
      .options(postCssOpts);
  }

  if (loader && !rule.uses.has(loader)) {
    rule
      .use(loader)
      .loader(loader)
      .options({
        sourceMap: pref.sourceMap,
        ...loaderOptions,
      });

    if (loader === 'stylus-loader') {
      rule
        .use('quasar-stylus-variables-loader')
        .loader(cssVariables.loaders.styl);
    } else if (loader === 'sass-loader') {
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
  const baseRule = chain.module.rule(lang).test(test).before('vue');

  // rules for Vue SFC <style lang="module">
  const modulesRule = baseRule.oneOf('modules-query').resourceQuery(/module/);

  // rules for Vue SFC <style>
  const vueNormalRule = baseRule
    .oneOf('vue')
    .resourceQuery(/\?vue/)
    .before('modules-query');

  create(modulesRule, true, pref, loader, loaderOptions);

  create(vueNormalRule, false, pref, loader, loaderOptions);
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
    {
      preferPathResolver: 'webpack',
      ...pref.stylusLoaderOptions,
    },
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
