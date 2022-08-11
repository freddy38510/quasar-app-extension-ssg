# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

### [4.5.6](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.5.5...v4.5.6) (2022-08-11)


### Bug Fixes

* **deps:** update dependency beastcss to v1.1.1 ([#286](https://github.com/freddy38510/quasar-app-extension-ssg/issues/286)) ([0f1d9f4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/0f1d9f49ddd379cf7181a75f45ff029318cdf06b))
* **deps:** update dependency node-html-parser to v5.4.1 ([#281](https://github.com/freddy38510/quasar-app-extension-ssg/issues/281)) ([ee155a0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ee155a0babb50ee1022b977a6641f78ed9eeddd3))

### [4.5.5](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.5.4...v4.5.5) (2022-08-09)


### Bug Fixes

* **ssg-corrections:** stop adding wrong class to body tag for non ios/android mobile platforms ([ad39af5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ad39af56d5bdd91bd9ca7f75dbbfec8a99168378)), closes [#279](https://github.com/freddy38510/quasar-app-extension-ssg/issues/279)

### [4.5.4](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.5.3...v4.5.4) (2022-08-09)


### Bug Fixes

* **vite:** remove public folder from ignored tracked files list for compilation caching ([6d0abe0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6d0abe05f12267224fe5fe3f43f6665ffd1bbf5b))

### [4.5.3](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.5.2...v4.5.3) (2022-08-08)


### Bug Fixes

* **vite:** do not generate typescript declaration file for auto imported svg icons ([9a65f42](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9a65f426bde4f950a02649d391000d551c5cdc58))

### [4.5.2](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.5.1...v4.5.2) (2022-08-08)


### Bug Fixes

* **vite:** add stricter check before applying transform to roboto font css file ([522575f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/522575fba94152fedd37bc88374647b664ef4d35))
* **vite:** do not use replaceAll function not supported by Node.js v14 ([b0dfc47](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b0dfc47e5f441449ab635614157e8e6c99c7c38d))

### [4.5.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.5.0...v4.5.1) (2022-08-08)


### Bug Fixes

* **vite:** check if iconSet is defined in roboto-font vite plugin ([d78c1c2](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d78c1c212f9b6b33a8840334f72980bbbad27fee))

## [4.5.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.4.0...v4.5.0) (2022-08-08)


### Features

* **install:** add "dev:ssg" to package.json scripts for positive answer to the corresponding prompt ([dc0f6e4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/dc0f6e44a8c5191edca635ad9462db1ed5238169))
* **vite:** add an option to auto import svg icons from @quasar/extras package ([c79b6a0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c79b6a0eec5994184a0cd606213c4f755f70f16e))
* **vite:** add option to set css font-display descriptor of roboto font ([8c5663f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/8c5663f6256f61962f10425901637556afcdcab2))


### Bug Fixes

* **deps:** update dependency pony-cause to v2.1.1 ([#278](https://github.com/freddy38510/quasar-app-extension-ssg/issues/278)) ([41d0632](https://github.com/freddy38510/quasar-app-extension-ssg/commit/41d0632af985810789585a4c44b87e0e38c56b34))

## [4.4.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.3.0...v4.4.0) (2022-08-03)


### Features

* add Vite.js support ([6f847cf](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6f847cf799f0f950598a8c1ddaa679b1147d28cf)), closes [#263](https://github.com/freddy38510/quasar-app-extension-ssg/issues/263)
* do not inject script/preload tags for components hydrated with vue3-lazy-hydration package ([ec8c27e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ec8c27ef1daaf43ba0041cce5ac195820bb5ee81))


### Bug Fixes

* **deps:** update dependency pony-cause to v2.1.0 ([#276](https://github.com/freddy38510/quasar-app-extension-ssg/issues/276)) ([9918aa4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9918aa4706bcb973be4eecf77feda24aa68849f1))
* **deps:** update dependency workbox-build to v6.5.4 ([#271](https://github.com/freddy38510/quasar-app-extension-ssg/issues/271)) ([38417ba](https://github.com/freddy38510/quasar-app-extension-ssg/commit/38417ba39a8d66d422f54c6e739d1cc21da384eb))
* **install:** add missing compatibility checks ([13aaa6f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/13aaa6f803962eb9511303b3e914f45e6d0b5ee5))
* use correct package name when checking api compatibility ([e6669d5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e6669d5273529ac2afcc143273f6e9d75038fc17))

## [4.3.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.2.3...v4.3.0) (2022-07-18)


### Features

* **dev:** do not prettify errors ([21213ea](https://github.com/freddy38510/quasar-app-extension-ssg/commit/21213eaa7f0b89a250ff2396c8b8c5274d16c7a1))
* do not preload async comp hydrated with "vue3-lazy-hydration" package ([3fc7cd5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3fc7cd59815a40f2c4e10f5e348dcb0934440d99))


### Bug Fixes

* **dev:** avoid "Cannot access before initialization" error after reloading ([c6ffc3f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c6ffc3f61b825f9d4b2c8306794ad48814152697))

### [4.2.3](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.2.2...v4.2.3) (2022-07-07)


### Bug Fixes

* **deps:** update dependency ci-info to v3.3.2 ([#257](https://github.com/freddy38510/quasar-app-extension-ssg/issues/257)) ([4f5c9d6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/4f5c9d6326ba4b9340194218179c80d6ca415d73))
* **deps:** update dependency globby to v13.1.2 ([#258](https://github.com/freddy38510/quasar-app-extension-ssg/issues/258)) ([60a7eec](https://github.com/freddy38510/quasar-app-extension-ssg/commit/60a7eec6305757ecb24537bc6d6d17b219e87649))
* **deps:** update dependency jiti to v1.14.0 ([#259](https://github.com/freddy38510/quasar-app-extension-ssg/issues/259)) ([65c94e7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/65c94e7be72bfc6abfacbb92c071ca8154112366))
* **dev:** add missing await statement ([1235f29](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1235f2908cdfc227f605e942d2efcd4e9383b744))
* **dev:** compile ssr directives when required by @quasar/app package version ([ad1f2c5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ad1f2c50e72a38785bb227fee477a5842efcacf2))
* **dev:** do not update generator if compilation has errors ([d2aad3e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d2aad3e3fac47a38cac10ac4e770590615439934))
* **dev:** improve readability of console output ([6b96080](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6b96080d4505dee877abc72eb904be6e47d18f81))
* **dev:** remove obsolete code that discarded hot updates and source maps ([c5cddc7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c5cddc7a8e915cb762a5060b054517bfb7e225a7))
* make sure quasar and @quasar/app packages are compatible with each other ([b7c3a01](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b7c3a01d97593cbf77ff4ff844cb169d84928780)), closes [#255](https://github.com/freddy38510/quasar-app-extension-ssg/issues/255)
* point Flex Addon to sass instead of css when Quasar not configured for sass ([f7734cd](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f7734cddd9d35c3f162b9e94f998a388b544b4af))
* use correct lodash package according to package version @quasar/app ([bac735c](https://github.com/freddy38510/quasar-app-extension-ssg/commit/bac735cf10b29dc7dd6e796eb38a3201bb07f565)), closes [#256](https://github.com/freddy38510/quasar-app-extension-ssg/issues/256)

### [4.2.2](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.2.1...v4.2.2) (2022-05-23)


### Bug Fixes

* **dev:** do not let Quasar set webpackConf when watching for changes ([2ac7f86](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2ac7f86f0c45962d0e3bcacbde5fa0f8c8259a53))
* **dev:** stop the custom service worker compiler properly when needed ([8548160](https://github.com/freddy38510/quasar-app-extension-ssg/commit/8548160c62858cfab7dfb3c1a4776ffb8807e70f))

### [4.2.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.2.0...v4.2.1) (2022-05-22)


### Bug Fixes

* **conf:** create devServer.client option if not set ([96394a5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/96394a5ab95d22f80a4452eec4200acba0fc1bb0))

## [4.2.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.1.1...v4.2.0) (2022-05-22)


### Features

* add dev command ([d5986e6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d5986e6249a07d42cdfbc577e04f3db67fbbdfe1)), closes [#2](https://github.com/freddy38510/quasar-app-extension-ssg/issues/2)
* add distDir option ([9b0528e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9b0528eb5c1a0a74345c7d4b3d860b221e353c90))
* support inlining styles with vue-style-loader for css imported outside of Vue components ([3e7aa28](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3e7aa28c8685f760ec84735519559a90e6a74a4f))


### Bug Fixes

* add full SPA fallback support ([c5f2545](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c5f254578b89f128a0c4e7e293d23ce041c38c6e))
* add missing await statements ([0bca2c8](https://github.com/freddy38510/quasar-app-extension-ssg/commit/0bca2c8af295da5fd9ac3c7b909608b0bf8b41f4))
* **deps:** update dependency ci-info to v3.3.1 ([#238](https://github.com/freddy38510/quasar-app-extension-ssg/issues/238)) ([edfc572](https://github.com/freddy38510/quasar-app-extension-ssg/commit/edfc572e0050c3982f88bc61160021f08210b8d8))
* **deps:** update dependency express to v4.18.1 ([#224](https://github.com/freddy38510/quasar-app-extension-ssg/issues/224)) ([cf780fa](https://github.com/freddy38510/quasar-app-extension-ssg/commit/cf780fad43e92906399ddfa379214762f6c5474a))
* export and import the correctly named function hasNewQuasarPkg ([413542b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/413542b12dc023429407fa45c9d0e46230599d8c))
* force externalized packages to run development code to throw exceptions at build time ([45a6d97](https://github.com/freddy38510/quasar-app-extension-ssg/commit/45a6d97738fe772088d30f40a6ec99ea8ee59850))
* **generate:** load dependency globby instead of glob before running afterGenerate hook ([3e7166e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3e7166e160678169b669bd51b180a868890547ff))
* give a chance for client and server manifests to handle all assets including source maps ([df5c758](https://github.com/freddy38510/quasar-app-extension-ssg/commit/df5c7585553c6041752370c303a8fbd88f9a2d78))
* improve error handling, output printing and rewriting stack traces ([1aafc13](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1aafc13ed1a70a60060afa892219a75847695d6e))
* **inspect:** load dot-prop package dependency from app instead of extension ([9e5bc1c](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9e5bc1c2a9c8664dcb9adcbee76aa3a03c9f6368))
* let set the public path correctly ([83cdf67](https://github.com/freddy38510/quasar-app-extension-ssg/commit/83cdf67bfd6bf9017fac06fce9f44e2e673fb41f))
* remove babel and its config file for transpilation to work as originally intended ([be0ff46](https://github.com/freddy38510/quasar-app-extension-ssg/commit/be0ff4692b07f0014b99f7742436e065db03e7e1))
* remove potential duplicate logging output when initializing routes ([2c63c3a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2c63c3a91efca80895083bedcb9eabdfdbb08557))
* tweak and optimize workbox-build default options ([dc6fc9f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/dc6fc9f4434187ee93a879d20fbf863402dbbc5e))

### [4.1.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.1.0...v4.1.1) (2022-04-23)


### Bug Fixes

* **build:** pass correct parameter to print webpack errors summary ([63cc2d0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/63cc2d0ba90cd61b76570598b8b1080ca87e575f))

## [4.1.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v4.0.0...v4.1.0) (2022-04-22)


### Features

* **build:** reduce server bundle size by externalizing quasar node modules when possible ([0da74ae](https://github.com/freddy38510/quasar-app-extension-ssg/commit/0da74ae9bf572246b7febaa644fafb42d49cf767))
* support new manualStoreSerialization option ([a9e864d](https://github.com/freddy38510/quasar-app-extension-ssg/commit/a9e864dd1cde808a4d776b26140c620f74a99481))


### Bug Fixes

* **build:** compile custom service worker only when needed ([28405ea](https://github.com/freddy38510/quasar-app-extension-ssg/commit/28405ea424039a7cc2ea275d60d5e14f16314b9c))
* **deps:** update dependency fs-extra to v10.1.0 ([#217](https://github.com/freddy38510/quasar-app-extension-ssg/issues/217)) ([c3f6b0e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c3f6b0e4ca89548e4f68db11c506d8f47a6f3690))
* **workbox:** merge common default options ([1fbd0ea](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1fbd0ea650641610451b06faccc85043a8becfbd))

## [4.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.4.0...v4.0.0) (2022-04-18)


### ⚠ BREAKING CHANGES

* **build:** remove process.env.STATIC in favor of process.env.MODE set to ssg

### Features

* **build:** concatenate client bundle modules ([6b3be01](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6b3be01c2ecd9494cfb91c1896427fc5fccbeb6a))
* **build:** split webpack compilation into client, server and generator ([101078f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/101078f585316c37c69f31f8c9cb70c29dc7f3ba))
* extend quasarConf from ssg command instead of Index API extension ([15851cc](https://github.com/freddy38510/quasar-app-extension-ssg/commit/15851ccf1f23520acee28946a0cacd9f3d0bd143))
* improve readability of printing beastcss logs ([b7fdf01](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b7fdf01dd62958c740980fca433f8da3d7098ff5))
* increase the verbosity and print the error stack on page generation failure ([ed9677c](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ed9677c0e0bda009f85ed97dec276a3efdebf8a1))
* print build infos even if build will be skipped ([ef0a4c1](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ef0a4c105f74db1cea715eefb3d21066c84b86a0))
* provide an option to disable getting routes from the router app ([1a4fcaa](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1a4fcaa296b9beb077bf850869b1b719ba9567f6))
* **workbox:** set default option dontCacheBustUrlsMatching to match hashes of Quasar filenames ([9f70bf9](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9f70bf9b553cf38d1021049a5e60fe0d6c40449e))
* **workbox:** set default sourcemap option to the build.sourceMap property of the Quasar conf file ([eb27860](https://github.com/freddy38510/quasar-app-extension-ssg/commit/eb27860561b44e09250b450797e813ed02880537))


### Bug Fixes

* **app-paths:** use correct path to logger module when requiring fatal function ([ec7dc1f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ec7dc1fb49e11027a66be82ddf516a1875451755))
* **banner:** align text and fix lines break ([f4353a9](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f4353a972701e94ace3a98dbc3c55c06eebd9185))
* **banner:** use the correct number of dots on the "output style" string ([7e9d6e9](https://github.com/freddy38510/quasar-app-extension-ssg/commit/7e9d6e9df4af579dc0c7d6e455a2a3b746484216))
* **build, inspect:** run extensions except ssg extension ([18ea80e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/18ea80e5ce01fb692c6032e30216b673a696ca33))
* **build:** add auxiliary assets to initial property of client manifest ([8f0f16f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/8f0f16f318985fe262b180bd8228a74a6d2513d9))
* **deps:** update dependency crc to v4.1.1 ([#210](https://github.com/freddy38510/quasar-app-extension-ssg/issues/210)) ([88a8229](https://github.com/freddy38510/quasar-app-extension-ssg/commit/88a82293269fda785dba14b91a906ae12554fa1b))
* **deps:** update dependency destr to v1.1.1 ([#208](https://github.com/freddy38510/quasar-app-extension-ssg/issues/208)) ([be51dc5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/be51dc544360cbab8d238e390fe92a6e60d431e6))
* **deps:** update dependency workbox-build to v6.5.3 ([#215](https://github.com/freddy38510/quasar-app-extension-ssg/issues/215)) ([6009132](https://github.com/freddy38510/quasar-app-extension-ssg/commit/60091327af3bc266934141b8052498c1aa8dcbb3))
* get app routes from server bundle instead of compiling router ([f3e201f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f3e201fe992d560bbbb5d4da5021d75da2023db6))
* **workbox:** compile custom service worker for browser instead of nodejs ([5e67609](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5e676092aeae55625ef00a8a9ac0077dc78e0793))

## [3.4.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.3.1...v3.4.0) (2022-04-05)


### Features

* support @quasar/app-webpack v3.4.0 ([93ae832](https://github.com/freddy38510/quasar-app-extension-ssg/commit/93ae83255a72802a8b171fadc95b5e706e3bf31a)), closes [#200](https://github.com/freddy38510/quasar-app-extension-ssg/issues/200)


### Bug Fixes

* alleviates the conditions necessary to apply the ssg changes ([a5b26dd](https://github.com/freddy38510/quasar-app-extension-ssg/commit/a5b26dd3552bc39bbe478501c68f03001c757e9a))
* **deps:** update dependency minimist to v1.2.6 [security] ([#192](https://github.com/freddy38510/quasar-app-extension-ssg/issues/192)) ([a1ec758](https://github.com/freddy38510/quasar-app-extension-ssg/commit/a1ec7586d737f6191388e6a394a7115bf891f8f6))
* **deps:** update dependency node-html-parser to v5.3.3 ([#198](https://github.com/freddy38510/quasar-app-extension-ssg/issues/198)) ([d895177](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d8951778ae0f84b308ed6e847ae8b6af6eb68da4))
* **deps:** update dependency selfsigned to v2.0.1 ([#194](https://github.com/freddy38510/quasar-app-extension-ssg/issues/194)) ([1d4052d](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1d4052d5d752921a3961926b0d7884e8575ab81c))
* **deps:** update dependency workbox-build to v6.5.2 ([#187](https://github.com/freddy38510/quasar-app-extension-ssg/issues/187)) ([c21bec0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c21bec043641faf1b1f0d826416f83ae39029539))
* **inlineCssFromSFC:** support rtl transformation with build > rtl > source ([b74de1e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b74de1e3ba893efaeee49dd457664e7dcab60927))
* update postcss-loader option structure ([31e736a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/31e736a13db6bbc4b43a1351cf252ad45bedfed4)), closes [#188](https://github.com/freddy38510/quasar-app-extension-ssg/issues/188)

### [3.3.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.3.0...v3.3.1) (2022-03-01)


### Bug Fixes

* do not preload any assets by default ([1b30006](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1b30006804e7f9736ec57a8b496b9468f69f6d2b))
* pass missing argument extension to shouldPrefetch option ([864a833](https://github.com/freddy38510/quasar-app-extension-ssg/commit/864a8331c06b5fbf26942aa70541772b72556e46))

## [3.3.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.2.1...v3.3.0) (2022-03-01)


### Features

* allow custom beastcss options ([4ab1a35](https://github.com/freddy38510/quasar-app-extension-ssg/commit/4ab1a35c3331cc5a936fc07a9ee82c044b4f5702))
* keep account of brand colors from quasar.conf.js file at server-side ([67648d5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/67648d56e848fc23f6e943fda7cdccd93efe2d0d))
* provide an option to inline css from Vue SFC <style> blocks ([854d84f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/854d84f6f2f8253a60d42bb9f33429370af998b2))
* provide shouldPreload and shouldPrefetch options from custom SSR renderer ([761a62c](https://github.com/freddy38510/quasar-app-extension-ssg/commit/761a62c7787532c96d3c1cbb145c33055798adb0)), closes [#175](https://github.com/freddy38510/quasar-app-extension-ssg/issues/175)


### Bug Fixes

* **deps:** update dependency beastcss to v1.0.7 ([#167](https://github.com/freddy38510/quasar-app-extension-ssg/issues/167)) ([86baf08](https://github.com/freddy38510/quasar-app-extension-ssg/commit/86baf0872b3d99d9300e916a868013e25298805c))
* **deps:** update dependency express to v4.17.3 ([#177](https://github.com/freddy38510/quasar-app-extension-ssg/issues/177)) ([3da2e74](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3da2e74fb12942b05483ba8dfea54ccca7f80b1c))
* **deps:** update dependency fs-extra to v10.0.1 ([#178](https://github.com/freddy38510/quasar-app-extension-ssg/issues/178)) ([cee8513](https://github.com/freddy38510/quasar-app-extension-ssg/commit/cee8513495f2937cb95d96052f7976edb9cd8eef))
* **deps:** update dependency globby to v13.1.1 ([#165](https://github.com/freddy38510/quasar-app-extension-ssg/issues/165)) ([5a89296](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5a89296591d7ca7b390410d5eb9a3d9197026c0c))
* **deps:** update dependency jiti to v1.13.0 ([#180](https://github.com/freddy38510/quasar-app-extension-ssg/issues/180)) ([fe1c3b0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/fe1c3b0f64cc565cb73f6231238b2b97a8042845))
* **deps:** update dependency workbox-build to v6.5.0 ([#181](https://github.com/freddy38510/quasar-app-extension-ssg/issues/181)) ([f7b9015](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f7b9015fb980aa1052b6b52bc212fb548289a5ec))

### [3.2.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.2.0...v3.2.1) (2022-01-28)


### Bug Fixes

* auto-install vue deps when @quasar/app dep is greater than or equal to v3.3.0 and not v3.0.0 ([1c8a6f6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1c8a6f65dc4e93b55b46a5eedce7b806ee03215f))

## [3.2.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.1.4...v3.2.0) (2022-01-28)


### Features

* auto-install vue & vue-router deps on host if necessary ([1fe69f4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1fe69f464c071be9011d52ff4d777695e1ddacaf))
* **banner:** add quasar-app-extension-ssg package version to console output ([9ba7ec6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9ba7ec60020abb032bcd5198fd4d7543e36a82ec))


### Bug Fixes

* **deps:** update dependency crc to v4.1.0 ([#139](https://github.com/freddy38510/quasar-app-extension-ssg/issues/139)) ([1ad9ad6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1ad9ad69b57cee21e35daa85b077ac48f5994a3d))
* **deps:** update dependency globby to v12.2.0 ([#141](https://github.com/freddy38510/quasar-app-extension-ssg/issues/141)) ([256b7ae](https://github.com/freddy38510/quasar-app-extension-ssg/commit/256b7aeba45a248199173eef0691dab70266690e))
* **deps:** update dependency globby to v13 ([#151](https://github.com/freddy38510/quasar-app-extension-ssg/issues/151)) ([d2e0a0b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d2e0a0b575a6a9cec73b7a8763696678889daf20))
* **deps:** update dependency jiti to v1.12.15 ([#158](https://github.com/freddy38510/quasar-app-extension-ssg/issues/158)) ([8d46de7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/8d46de75ab13d021c957e737bd593f302958291c))
* **deps:** update dependency node-html-parser to v5.2.0 ([#142](https://github.com/freddy38510/quasar-app-extension-ssg/issues/142)) ([6946755](https://github.com/freddy38510/quasar-app-extension-ssg/commit/69467557d4deb68bf317452c587367a1838b1684))
* **deps:** update dependency route-cache to v0.4.7 ([#133](https://github.com/freddy38510/quasar-app-extension-ssg/issues/133)) ([43d58c6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/43d58c68becc66e8fd2189a8b4ec4ad37c709ad6))
* **deps:** update dependency selfsigned to v2 ([#136](https://github.com/freddy38510/quasar-app-extension-ssg/issues/136)) ([877ee45](https://github.com/freddy38510/quasar-app-extension-ssg/commit/877ee4502a1148c6d9cdb616e91e1440018b6169))
* **snapshot:** load module crc32 from its new path introduced by dependency crc v4.1.0 ([41512e9](https://github.com/freddy38510/quasar-app-extension-ssg/commit/41512e9d13a2f7ae2d109acf824fec7ef8555b9c)), closes [#153](https://github.com/freddy38510/quasar-app-extension-ssg/issues/153)

### [3.1.4](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.1.3...v3.1.4) (2021-12-22)


### Bug Fixes

* **deps:** update dependency beastcss to v1.0.6 ([#115](https://github.com/freddy38510/quasar-app-extension-ssg/issues/115)) ([c1b67e6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c1b67e675dbdc9973e987418f1da64b9fb2cb941))
* **deps:** update dependency ci-info to v3.3.0 ([#103](https://github.com/freddy38510/quasar-app-extension-ssg/issues/103)) ([354b843](https://github.com/freddy38510/quasar-app-extension-ssg/commit/354b843a8bbaa764b73f30f358a3374dedde4078))
* **deps:** update dependency crc to v4 ([#117](https://github.com/freddy38510/quasar-app-extension-ssg/issues/117)) ([4d264b4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/4d264b461283c01341a189e2f0441dab1758a300))
* **deps:** update dependency express to v4.17.2 ([#116](https://github.com/freddy38510/quasar-app-extension-ssg/issues/116)) ([98ad12a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/98ad12a93f518cab357b9fafc8046f69408ee9ff))
* **deps:** update dependency node-html-parser to v5.1.0 ([#89](https://github.com/freddy38510/quasar-app-extension-ssg/issues/89)) ([b937161](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b937161ce2b197fca757787c42b73400e4896bd3))
* parse correctly the value of the inlineCriticalCss option ([3cfb6b5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3cfb6b5f3ca2b34276419eee5c51a6ad5a56af6a))

### [3.1.3](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.1.2...v3.1.3) (2021-12-20)


### Bug Fixes

* remove html template minification to avoid parsing errors ([ae8a1e8](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ae8a1e806d1357f796a673ff56d57a5729d8cb22)), closes [#111](https://github.com/freddy38510/quasar-app-extension-ssg/issues/111)

### [3.1.2](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.1.1...v3.1.2) (2021-12-19)


### Bug Fixes

* add a workaround to not consider the app pre-hydrated when falling back to SPA at first-load ([7c7243f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/7c7243fef1c62528d2e99a0b420a0c695659e1a3)), closes [#110](https://github.com/freddy38510/quasar-app-extension-ssg/issues/110)
* **deps:** update dependency beastcss to v1.0.5 ([#95](https://github.com/freddy38510/quasar-app-extension-ssg/issues/95)) ([d93ab27](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d93ab270db712c09787ce36f925eb3595a4ca0bb))
* **deps:** update dependency workbox-build to v6.4.2 ([#101](https://github.com/freddy38510/quasar-app-extension-ssg/issues/101)) ([890938a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/890938a703fd23df0955f1b0292ee5bf0b15d763))
* initialize app routes from compiled router ([d0d94e1](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d0d94e12079cf1753ca61b2d666edbc2852563a7))

### [3.1.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.1.0...v3.1.1) (2021-10-30)


### Bug Fixes

* build the required SSR directives before preparing quasar.conf ([2541691](https://github.com/freddy38510/quasar-app-extension-ssg/commit/25416918d7bb2c9ac4f04d966451d511394a13a4))

## [3.1.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.0.5...v3.1.0) (2021-10-27)


### Features

* make process.env.STATIC available when running ssg command ([5aa7632](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5aa76321ed5476365e29522dc632e29d8fdaa547))


### Bug Fixes

* build ssr directives only when it is necessary ([fa91c1c](https://github.com/freddy38510/quasar-app-extension-ssg/commit/fa91c1c98ef6f46d33fc72432874b77bcaf17c2a))
* **deps:** update dependency open to v8.4.0 ([#84](https://github.com/freddy38510/quasar-app-extension-ssg/issues/84)) ([6b80896](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6b808965a50bf06fb70f3f4209e06ebe3963cd1a))
* **generator:** adapt routes parsing from created router for vue-router v4 ([50716a3](https://github.com/freddy38510/quasar-app-extension-ssg/commit/50716a3cdcdea48ce93a27003302d409c02eb937)), closes [#86](https://github.com/freddy38510/quasar-app-extension-ssg/issues/86)
* **generator:** print warnings on catched errors from routes initialization ([38791d7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/38791d731015a4c137cd3c10fc67cb8922e44c08))
* **workbox:** generate sourcemap only when debug mode is enabled ([0823dfa](https://github.com/freddy38510/quasar-app-extension-ssg/commit/0823dfac79256db7375ad1dba561ea50c0691d63))

### [3.0.5](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.0.4...v3.0.5) (2021-10-18)


### Bug Fixes

* **deps:** update dependency beastcss to v1.0.4 ([#77](https://github.com/freddy38510/quasar-app-extension-ssg/issues/77)) ([366cf2e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/366cf2ec81711ff39ca1c177b40fc82d234f38c5))
* **deps:** update dependency globby to v12.0.2 ([b78cb2e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b78cb2eeddb0b212e9a2330c388e05d3bdedef5f))
* **deps:** update dependency jiti to v1.12.7 ([#66](https://github.com/freddy38510/quasar-app-extension-ssg/issues/66)) ([2ede3e1](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2ede3e183544c997fb5c8782ced53d9a77dc595d))
* **deps:** update dependency jiti to v1.12.9 ([#76](https://github.com/freddy38510/quasar-app-extension-ssg/issues/76)) ([ac8c1e3](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ac8c1e39e41c11167160e58656c749a320463b0d))
* **deps:** update dependency open to v8.3.0 ([70d5a4e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/70d5a4e1363a07f37f54d7d158adab95f0eea264))
* improve readability of errors and logs output ([835f05b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/835f05b1308cd26de57b7b877775a19f89cee26c))
* remove comments and condense whitespaces when minifying html ([b198275](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b198275684a6f3c3c091d1172013edf154fd6432))

### [3.0.4](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.0.3...v3.0.4) (2021-10-12)


### Bug Fixes

* **deps:** update dependency fastq to v1.13.0 ([589506c](https://github.com/freddy38510/quasar-app-extension-ssg/commit/589506c736783878ff6745e308075ba57e439146))
* **deps:** update dependency jiti to v1.12.6 ([51e0f9a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/51e0f9a7ff572f2d6ebde735adf56d30691da8c1))
* **deps:** update dependency node-html-parser to v5 ([#63](https://github.com/freddy38510/quasar-app-extension-ssg/issues/63)) ([c9ae462](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c9ae462ac26960ed8125766627bdab97278b0149))
* **deps:** update dependency workbox-build to v6.3.0 ([#51](https://github.com/freddy38510/quasar-app-extension-ssg/issues/51)) ([cbcb04a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/cbcb04a606bdb0a15ccb99f5a289a2778e1619fd))

### [3.0.3](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.0.2...v3.0.3) (2021-09-01)


### Bug Fixes

* avoid hydration errors caused by html-minifier ([afd88d0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/afd88d08a56ab8d054fb9adf9493c5c48dce36be))

### [3.0.2](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.0.1...v3.0.2) (2021-09-01)


### Bug Fixes

* **deps:** update dependency globby to v11.0.4 ([#42](https://github.com/freddy38510/quasar-app-extension-ssg/issues/42)) ([8498a19](https://github.com/freddy38510/quasar-app-extension-ssg/commit/8498a19fcb94286ecead2e96a2d0c362812d9e4e))
* **deps:** update dependency node-html-parser to v4.1.4 ([#43](https://github.com/freddy38510/quasar-app-extension-ssg/issues/43)) ([f04ef38](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f04ef386030730e434c86cc4f86cdf495a9e087b))
* **deps:** update dependency workbox-build to v6 ([65b61c7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/65b61c7da453c8cb30e8850142410177adbfc951))

### [3.0.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v3.0.0...v3.0.1) (2021-09-01)


### Bug Fixes

* **readme:** correct inlineCriticalCss option name and remove extra text ([47be2dd](https://github.com/freddy38510/quasar-app-extension-ssg/commit/47be2dd4832ab08b5bcac514348ec3838646c892))

## [3.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.0.0...v3.0.0) (2021-08-31)


### ⚠ BREAKING CHANGES

* Drop support of quasar v1.

### Features

* add inline critical css and async load the rest ([b689b62](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b689b6250d3ccd5cbe9a3cf2b3e503130066e832))
* port to quasar v2 with Vue3 ([aee8b05](https://github.com/freddy38510/quasar-app-extension-ssg/commit/aee8b054c8f8783aca2fa130b42e13823908587c)), closes [#36](https://github.com/freddy38510/quasar-app-extension-ssg/issues/36)
* **serve:** serve index file with no-cache headers ([c3d0f41](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c3d0f41b834f24c9db359013477ba164cdbecf28))

## [2.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.2.0...v2.0.0) (2021-08-25)


### ⚠ BREAKING CHANGES

* criticalCss option is removed in favor of inlineCriticalAsyncCss option

### Features

* add a crawler to find and generate dynamic routes ([8518a3b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/8518a3be7bb2fd61f064aee41af65de7768bad1f))
* add ability to inline CSS from Vue SFC style tag ([7794095](https://github.com/freddy38510/quasar-app-extension-ssg/commit/77940951bda5081a5b02a6334c59ebacdd9c7513))
* get routes from Vue Router ([e5a3966](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e5a3966a0572f2115696cce3ab41c7f8954a0f85)), closes [#22](https://github.com/freddy38510/quasar-app-extension-ssg/issues/22)
* **inspect:** add ability to enable/disable colored output ([c90c6b4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c90c6b447924c4f63e382616de8b54e871787bf4))
* replace critters by beastcss and only process async css ([b2cde35](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b2cde3524bffb1a80fd6cc248bc04ee32a452f21)), closes [#19](https://github.com/freddy38510/quasar-app-extension-ssg/issues/19)


### Bug Fixes

* do a webpack rebuild if the quasar-app-extension version changed ([866a2c0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/866a2c0b711434ada0e97c93b3f88118ea3e952e))
* extend quasar conf only once when setting env.STATIC ([b931721](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b931721f6f52ce8a194732b8f5bccede66bc42f0))
* **generator:** handle redirections and errors in renderToString function from Vue bundleRenderer ([6ffb2cf](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6ffb2cf7b9c1087f098005cf3eda53b8e013a399))
* minify html only once and pass missing html-minifier options ([f5c2cdc](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f5c2cdc3865b40c8da4bcaf7295830f4467d9e53))
* **package:** bump dependencies and re-add missing chalk and ci-info ([1534f9d](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1534f9de58d8490f51800618fa968400b272c177))
* print a fail message if there was any errors ([d484d43](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d484d43521823335d43964a510face3325ca2bd5))
* require missing path.resolve function for inlineCssFromSFC feature ([20c440e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/20c440e095474d535eed1495bcf4e7d4ce5b7a0a))

## [1.2.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.1.0...v1.2.0) (2021-05-26)


### Features

* exit with code 1 on generating pages error with --fail-on-error argument ([730a3f7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/730a3f7d9610105ba868683896c9ba3244e9402f)), closes [#38](https://github.com/freddy38510/quasar-app-extension-ssg/issues/38)

## [1.1.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.7...v1.1.0) (2021-05-17)


### Features

* add STATIC value to process.env ([279c8dc](https://github.com/freddy38510/quasar-app-extension-ssg/commit/279c8dcb4edc80d6335de889d299117c781e3bfa))

### [1.0.7](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.6...v1.0.7) (2021-04-08)


### Bug Fixes

* **compatibility:** add missing return statement ([0f841d4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/0f841d4e3773c53ac8b5f8bc01ddf36666411e13))

### [1.0.6](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.5...v1.0.6) (2021-04-08)


### Bug Fixes

* remove bad syntax from airbnb linting commit ([95c48c0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/95c48c0d5cd926ea667774ba074fe4976d028fda))

### [1.0.5](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.4...v1.0.5) (2021-04-08)

### [1.0.4](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.3...v1.0.4) (2020-12-30)


### Bug Fixes

* fix wrong setting of criticalCss option ([eb50379](https://github.com/freddy38510/quasar-app-extension-ssg/commit/eb5037970c32f267d41a84b14af74027bee19ba7))

### [1.0.3](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.2...v1.0.3) (2020-12-16)


### Bug Fixes

* **workbox:** compile service worker for InjectManifest mode ([dc2fd5c](https://github.com/freddy38510/quasar-app-extension-ssg/commit/dc2fd5cbcc00662536cda58af6bfd47d1266e4b4)), closes [#32](https://github.com/freddy38510/quasar-app-extension-ssg/issues/32)
* **workbox:** keep default options close to Quasar ones ([ed42942](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ed42942a5e522c4b9f3d0a43ff4a992afe57a362))

### [1.0.2](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.1...v1.0.2) (2020-12-14)


### Bug Fixes

* **workbox:** add missing injectManifest method ([6ccc578](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6ccc578463c7630dff6eef4273a7a166171eb38c)), closes [#31](https://github.com/freddy38510/quasar-app-extension-ssg/issues/31)
* **workbox:** delete exclude option after all user options have been merged ([c053d0a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c053d0a8a1b8006be2c298fb65fef6a18520bfd7))

### [1.0.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.0.0...v1.0.1) (2020-11-30)


### Bug Fixes

* make @quasar/app v2.0.0 compatible ([237e92b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/237e92be348430ee15617e4a15209161c3001f87))

## [1.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.8...v1.0.0) (2020-11-29)


### Features

* add an option to disable/enable critical css ([13d7bfe](https://github.com/freddy38510/quasar-app-extension-ssg/commit/13d7bfe5f318137f85c25049bd13cad3ff0feeb9))

### [0.9.8](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.7...v0.9.8) (2020-10-08)


### Bug Fixes

* make extension compatible with @quasar/app below v2.0.0 ([e3a7ce4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e3a7ce4e19f52de30cc997a596250e0b88df846f)), closes [#26](https://github.com/freddy38510/quasar-app-extension-ssg/issues/26)

### [0.9.7](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.6...v0.9.7) (2020-09-17)


### Features

* add inspect command ([2cd21a2](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2cd21a2abaaa08524f4493bde5e6c88d2bca6233))


### Bug Fixes

* **server:** use http-proxy-middleware the right way for its v0.19 version ([1c7d714](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1c7d7148ec09af51dd9ea0d13bf4314cd2d7149a))
* remove http-proxy-middleware from dependencies and require it from Quasar ([1d298d5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1d298d53aa48e016faf68f4e944a07d7e61dd208)), closes [#24](https://github.com/freddy38510/quasar-app-extension-ssg/issues/24)
* **inspect:** print right usage when help paramater is provided ([44c5a62](https://github.com/freddy38510/quasar-app-extension-ssg/commit/44c5a62f17f09142f811e39af4d09fbbe6fb0afd))

### [0.9.6](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.5...v0.9.6) (2020-09-16)


### Features

* **build:** add compatibility for future version 2.1 of "@quasar/app" ([afd9e25](https://github.com/freddy38510/quasar-app-extension-ssg/commit/afd9e2549dde6fb44dcf964a534183db97067294))


### Bug Fixes

* **build:** fix compatibility with @quasar/app 2.1.0 ([588dfd9](https://github.com/freddy38510/quasar-app-extension-ssg/commit/588dfd9eb384912ed3c1a0340cc058670bb6bfdf)), closes [#25](https://github.com/freddy38510/quasar-app-extension-ssg/issues/25)

### [0.9.5](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.4...v0.9.5) (2020-09-10)


### Features

* provide an option via prompts to inline critical CSS ([d682826](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d6828266a1b038d1791031cab58b4a75c52700cd)), closes [#23](https://github.com/freddy38510/quasar-app-extension-ssg/issues/23)


### Bug Fixes

* **prompts:** use default distDir for serve:ssg script ([fcd4e96](https://github.com/freddy38510/quasar-app-extension-ssg/commit/fcd4e96c5e8f7bcfe370478ce85cf09d8073df2e))

### [0.9.4](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.3...v0.9.4) (2020-09-02)


### Features

* **prompts:** add scripts for building and serving to package.json ([b93e310](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b93e31058743502d07a2eaa0572ecf5772593088)), closes [#21](https://github.com/freddy38510/quasar-app-extension-ssg/issues/21)

### [0.9.3](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.2...v0.9.3) (2020-09-01)


### Bug Fixes

* **quasarconf:** use custom distDir when provided ([6b4ad3f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6b4ad3faecc54825a7c6ce58cb5b417a69cd4867)), closes [#20](https://github.com/freddy38510/quasar-app-extension-ssg/issues/20)

### [0.9.2](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v0.9.1...v0.9.2) (2020-08-30)


### Bug Fixes

* **workbox:** do not fallback when navigating to service-worker and workbox ([e42ff45](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e42ff455b43c36d10d2160b2b4d6a2d0fcd2e0c4))

### 0.9.1 (2020-08-21)


### Bug Fixes

* **serve:** use posix paths ([99aa6b5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/99aa6b5c8a82c989b1c00503ecfa6116d89192f2)), closes [#17](https://github.com/freddy38510/quasar-app-extension-ssg/issues/17)
