# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

### [2.4.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.4.0...v2.4.1) (2022-08-18)


### Bug Fixes

* **boot:** stop adding wrong class to body tag for non ios/android mobile platforms ([e176e20](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e176e207abb4833c5577aad0f5466fd5f785fe6f))
* **conf:** let set the public path correctly ([c9fdca8](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c9fdca8e3867548960019fb23ee2bb4a7feed057))
* **deps:** update dependency beastcss to v1.1.1 ([#287](https://github.com/freddy38510/quasar-app-extension-ssg/issues/287)) ([3c243db](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3c243db3ce0035dc189e28a1451e13077129c8f3))
* **deps:** update dependency beastcss to v1.2.0 ([#290](https://github.com/freddy38510/quasar-app-extension-ssg/issues/290)) ([f278860](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f2788603a83539397298d9dd673f546e196fdf91))
* **deps:** update dependency beastcss to v1.2.1 ([#297](https://github.com/freddy38510/quasar-app-extension-ssg/issues/297)) ([b752065](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b752065e20bba2db5a2574d70a1f6465d60fce47))
* **deps:** update dependency ci-info to v3.3.1 ([#243](https://github.com/freddy38510/quasar-app-extension-ssg/issues/243)) ([257a5d5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/257a5d541cb8868a5b032c129bb94d8ad0750dec))
* **deps:** update dependency ci-info to v3.3.2 ([#260](https://github.com/freddy38510/quasar-app-extension-ssg/issues/260)) ([84ec543](https://github.com/freddy38510/quasar-app-extension-ssg/commit/84ec5438309da7ff6dec47c950261d2e2c63cb8d))
* **deps:** update dependency express to v4.18.1 ([#225](https://github.com/freddy38510/quasar-app-extension-ssg/issues/225)) ([ca9e84d](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ca9e84d3b5e1ce6d54ed202e158ed4e7cef60ead))
* **deps:** update dependency globby to v13.1.2 ([#261](https://github.com/freddy38510/quasar-app-extension-ssg/issues/261)) ([9cc64fb](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9cc64fbcec302d8cc5c3554e919de95c490c3eaf))
* **deps:** update dependency jiti to v1.14.0 ([#262](https://github.com/freddy38510/quasar-app-extension-ssg/issues/262)) ([0c510c2](https://github.com/freddy38510/quasar-app-extension-ssg/commit/0c510c248df12b7615eababcb4da5054de8ee272))
* **deps:** update dependency node-html-parser to v5.4.1 ([#282](https://github.com/freddy38510/quasar-app-extension-ssg/issues/282)) ([c9999cd](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c9999cd666e80324c21d11ed57e443da54ddc6d9))
* **deps:** update dependency workbox-build to v6.5.4 ([#272](https://github.com/freddy38510/quasar-app-extension-ssg/issues/272)) ([6d4b761](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6d4b7614f36c8909e11077294b855bb3115b23b4))
* **generate:** load dependency globby instead of glob before running afterGenerate hook ([eb749c2](https://github.com/freddy38510/quasar-app-extension-ssg/commit/eb749c2c0ec4901c6cfa458965e2c0ce7a1b9629))
* **inspect:** load dot-prop package dependency from app instead of extension ([654199e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/654199efc30d5294c75e9268e1e722f7e3d8c884))
* remove babel and its config file for transpilation to work as originally intended ([95e7c4d](https://github.com/freddy38510/quasar-app-extension-ssg/commit/95e7c4dd1f9d3eb1e7568512102744fca9022077))
* remove obsolete "https" package which could potentially break the app ([737d738](https://github.com/freddy38510/quasar-app-extension-ssg/commit/737d738379e33f347395fd0291c9b74d11bbe5a5))
* remove potential duplicate logging output when initializing routes ([dbf91ef](https://github.com/freddy38510/quasar-app-extension-ssg/commit/dbf91efd5e8ed59d6732871ed8dfd3231c9827c1))
* tweak and optimize workbox-build default options ([1c25708](https://github.com/freddy38510/quasar-app-extension-ssg/commit/1c25708ee7b0bb1fd0364fa8afc8d54d337e4d41))

## [2.4.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.3.0...v2.4.0) (2022-04-22)


### Features

* allow custom beastcss options ([2618cd2](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2618cd24cbe304fa9475b12cdba79d632367c15a))
* **banner:** print hint in case of warnings ([e8dee8a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e8dee8ad18b0d0652f75206247b5bfc3732ad409))
* **build:** split webpack compilation into client, server, generator and custom-sw ([ef4f9ff](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ef4f9ff73872dc75b3a197d81806bd9aa3ad9cfc))
* exit with non-zero status code by default on error ([ea0cb18](https://github.com/freddy38510/quasar-app-extension-ssg/commit/ea0cb1807c2d6c80545d4d0a79dae806d2363eed))
* extend quasarConf from ssg command instead of Index API extension ([6e1da52](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6e1da522306b7f6696f7fce92e94af6fc90e11fa))
* improve error and warning handling ([3ab604a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3ab604a92cfdf627c2ff8f058a8d7d0670abbf54))
* improve readability of printing beastcss logs and refactor a bit ([56906e5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/56906e55b1c6a6815c2ab5a428f6f9162c64ef75))
* provide an option to disable getting routes from the router app ([f335073](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f3350731fdb0af0e7abd635d2588b23a3248b44c))
* rework logger to improve readability ([e449b65](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e449b653861c110d371f1828091d23633b47206d))


### Bug Fixes

* **build:** compile custom service worker only when needed ([3d0af87](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3d0af87d01effdfe80e4a2ec3fb8b57749025184))
* **deps:** update dependency beastcss to v1.0.7 ([#168](https://github.com/freddy38510/quasar-app-extension-ssg/issues/168)) ([6ab53aa](https://github.com/freddy38510/quasar-app-extension-ssg/commit/6ab53aa199aa5622004aecdfd0a8eb6de4392545))
* **deps:** update dependency crc to v4.1.1 ([#211](https://github.com/freddy38510/quasar-app-extension-ssg/issues/211)) ([8e28156](https://github.com/freddy38510/quasar-app-extension-ssg/commit/8e28156dc18a18b3266608c5539a218130d7fc7f))
* **deps:** update dependency destr to v1.1.1 ([#209](https://github.com/freddy38510/quasar-app-extension-ssg/issues/209)) ([70a6023](https://github.com/freddy38510/quasar-app-extension-ssg/commit/70a602315a588cc9dac59152302e351cdc8d64ff))
* **deps:** update dependency express to v4.17.3 ([#182](https://github.com/freddy38510/quasar-app-extension-ssg/issues/182)) ([30f1872](https://github.com/freddy38510/quasar-app-extension-ssg/commit/30f1872c1396a61005918231fd92342e0c5c9f02))
* **deps:** update dependency fs-extra to v10.0.1 ([#183](https://github.com/freddy38510/quasar-app-extension-ssg/issues/183)) ([4a34346](https://github.com/freddy38510/quasar-app-extension-ssg/commit/4a34346426431b142f15ae26a5f4a93bc480776f))
* **deps:** update dependency fs-extra to v10.1.0 ([#218](https://github.com/freddy38510/quasar-app-extension-ssg/issues/218)) ([34dc47a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/34dc47a72bc62cec265848dd022388f03d943fa0))
* **deps:** update dependency globby to v13.1.1 ([#166](https://github.com/freddy38510/quasar-app-extension-ssg/issues/166)) ([38cafc0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/38cafc0ef5e32d0e867002f3df80310250d53ac5))
* **deps:** update dependency jiti to v1.13.0 ([#185](https://github.com/freddy38510/quasar-app-extension-ssg/issues/185)) ([d883ca8](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d883ca8a5ac0f809205866aeea1d33c09b81b982))
* **deps:** update dependency minimist to v1.2.6 [security] ([#193](https://github.com/freddy38510/quasar-app-extension-ssg/issues/193)) ([f37f36e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f37f36ed333fe8f564edf9e96e99fdb5afb81737))
* **deps:** update dependency node-html-parser to v5.3.3 ([#199](https://github.com/freddy38510/quasar-app-extension-ssg/issues/199)) ([0d544ce](https://github.com/freddy38510/quasar-app-extension-ssg/commit/0d544ce44788c8c9827d8c15ac2b7a498b6b68ea))
* **deps:** update dependency selfsigned to v2.0.1 ([#195](https://github.com/freddy38510/quasar-app-extension-ssg/issues/195)) ([aeab380](https://github.com/freddy38510/quasar-app-extension-ssg/commit/aeab3804e92dd5f8a1f38e4ceeba8c2ce412cf6b))
* **deps:** update dependency semver to v7.3.7 ([#207](https://github.com/freddy38510/quasar-app-extension-ssg/issues/207)) ([3841f3a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3841f3a1180ecb12f0867dda89313da32c974061))
* **deps:** update dependency workbox-build to v6.5.2 ([#186](https://github.com/freddy38510/quasar-app-extension-ssg/issues/186)) ([a117c8e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/a117c8e8082985f7ade653cf9f24394be9d86dd7))
* **deps:** update dependency workbox-build to v6.5.3 ([#216](https://github.com/freddy38510/quasar-app-extension-ssg/issues/216)) ([5ef7fe7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5ef7fe75dd2445190cf2c53e9c6c3788578915c3))
* get app routes from server bundle instead of compiling router ([c391681](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c391681b16c9d6a5fdfc8db9f8a346995ed78746)), closes [#214](https://github.com/freddy38510/quasar-app-extension-ssg/issues/214)
* support @quasar/app versions from v1.5.0 to latest v2 ([10adc9b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/10adc9b7414b121be00a9ad99cc344137845245b))
* **workbox:** remove invalid default options and print more infos ([2f375f3](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2f375f3a6251b210ebbf2da7d18e9eb81eaacdb7))

## [2.3.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.2.0...v2.3.0) (2022-01-28)


### Features

* **banner:** add quasar-app-extension-ssg package version to console output ([387690b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/387690b59939dc8569060cb5e7730a6d9cf3eafe))


### Bug Fixes

* **deps:** update dependency crc to v4.1.0 ([#147](https://github.com/freddy38510/quasar-app-extension-ssg/issues/147)) ([88fa127](https://github.com/freddy38510/quasar-app-extension-ssg/commit/88fa12795e86932728f6579258ad0bbb21c26e01))
* **deps:** update dependency globby to v12.2.0 ([#150](https://github.com/freddy38510/quasar-app-extension-ssg/issues/150)) ([fee4953](https://github.com/freddy38510/quasar-app-extension-ssg/commit/fee4953ffd55118037e824ea5efdcc3c1e3d5d58))
* **deps:** update dependency globby to v13 ([#152](https://github.com/freddy38510/quasar-app-extension-ssg/issues/152)) ([10483c0](https://github.com/freddy38510/quasar-app-extension-ssg/commit/10483c02a09baf5d4a45d25ab37271e80709ad94))
* **deps:** update dependency jiti to v1.12.15 ([#160](https://github.com/freddy38510/quasar-app-extension-ssg/issues/160)) ([5a4924e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5a4924e67651155cf5d114b1cf9e283e2bb3173d))
* **deps:** update dependency node-html-parser to v5.2.0 ([#148](https://github.com/freddy38510/quasar-app-extension-ssg/issues/148)) ([d211bfc](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d211bfc8bd2af21dc78d8fdb965411aa8cdd704d))
* **deps:** update dependency route-cache to v0.4.7 ([#144](https://github.com/freddy38510/quasar-app-extension-ssg/issues/144)) ([70f71c9](https://github.com/freddy38510/quasar-app-extension-ssg/commit/70f71c9a6484d25bca018d38ff26fc6fefa3959b))
* **deps:** update dependency selfsigned to v2 ([#137](https://github.com/freddy38510/quasar-app-extension-ssg/issues/137)) ([599569f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/599569f6b42bb65d377b473464c228b3fd56cd3f))
* **snapshot:** load module crc32 from its new path introduced by dependency crc v4.1.0 ([e34d602](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e34d602aec104319fd0f866fdfd5812f9b9121ed)), closes [#153](https://github.com/freddy38510/quasar-app-extension-ssg/issues/153)

## [2.2.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.1.4...v2.2.0) (2021-12-23)


### Features

* make process.env.STATIC available when running ssg command ([c557506](https://github.com/freddy38510/quasar-app-extension-ssg/commit/c557506b4c49ab416a29cf321050a8249578ccc7))


### Bug Fixes

* **deps:** update dependency beastcss to v1.0.5 ([#96](https://github.com/freddy38510/quasar-app-extension-ssg/issues/96)) ([5010cb8](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5010cb832b9c66547937f987c4e2dcf124d18c80))
* **deps:** update dependency beastcss to v1.0.6 ([#119](https://github.com/freddy38510/quasar-app-extension-ssg/issues/119)) ([4505a85](https://github.com/freddy38510/quasar-app-extension-ssg/commit/4505a85b604093c423e8d4b4721d85b36e69dfe6))
* **deps:** update dependency ci-info to v3.3.0 ([#104](https://github.com/freddy38510/quasar-app-extension-ssg/issues/104)) ([d6c626f](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d6c626f883a6af2fe0b33a76cd7927e7ae91d8c2))
* **deps:** update dependency crc to v4 ([#121](https://github.com/freddy38510/quasar-app-extension-ssg/issues/121)) ([b936f8d](https://github.com/freddy38510/quasar-app-extension-ssg/commit/b936f8d9f53ff215fe1a8d1797da695ae4b8d5a4))
* **deps:** update dependency express to v4.17.2 ([#120](https://github.com/freddy38510/quasar-app-extension-ssg/issues/120)) ([e778b34](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e778b34bea9db6bf16100cdf737369ea486d7d2e))
* **deps:** update dependency node-html-parser to v5.1.0 ([#90](https://github.com/freddy38510/quasar-app-extension-ssg/issues/90)) ([739c9db](https://github.com/freddy38510/quasar-app-extension-ssg/commit/739c9db7117da03c576509676f758b9295f4eb42))
* **deps:** update dependency open to v8.4.0 ([#75](https://github.com/freddy38510/quasar-app-extension-ssg/issues/75)) ([e34604d](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e34604d222267a7b62480e367ee5400c78719e23))
* **deps:** update dependency workbox-build to v6.4.2 ([#102](https://github.com/freddy38510/quasar-app-extension-ssg/issues/102)) ([db4bfc2](https://github.com/freddy38510/quasar-app-extension-ssg/commit/db4bfc2f5709c533c363139be860d1596ff1796e))
* initialize app routes from compiled router ([5b33845](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5b33845747f5578eabac74a051701489b8856b9a))
* parse correctly the value of the inlineCriticalCss and inlineCssFromSFC options ([61cadaa](https://github.com/freddy38510/quasar-app-extension-ssg/commit/61cadaaf16307b54e81565f6d8fb7ec1c5abdc9b))
* remove html template minification to avoid parsing errors ([f0b23e5](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f0b23e5502a613f680b3f7c0c338116b2c66744a))
* **workbox:** generate sourcemap only when debug mode is enabled ([9870ba1](https://github.com/freddy38510/quasar-app-extension-ssg/commit/9870ba1a9dc43a7e3e9062583df32faa31041aab))

### [2.1.4](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.1.3...v2.1.4) (2021-10-18)


### Bug Fixes

* **deps:** update dependency beastcss to v1.0.4 ([#78](https://github.com/freddy38510/quasar-app-extension-ssg/issues/78)) ([83bf433](https://github.com/freddy38510/quasar-app-extension-ssg/commit/83bf43378368dc5de7e66bd19b77dce3d50e3802))
* **deps:** update dependency globby to v12.0.2 ([f2d184e](https://github.com/freddy38510/quasar-app-extension-ssg/commit/f2d184ea11894d8caad536cee73455899a337042))
* **deps:** update dependency jiti to v1.12.9 ([#67](https://github.com/freddy38510/quasar-app-extension-ssg/issues/67)) ([5915dcf](https://github.com/freddy38510/quasar-app-extension-ssg/commit/5915dcf511137dd8f8d063267c6132a5a6341e1c))
* **deps:** update dependency open to v8.3.0 ([19083d9](https://github.com/freddy38510/quasar-app-extension-ssg/commit/19083d9418512b6ba1abf1f4934fbdaebab70b27))
* **generator:** create beastcss messages array sooner ([2e8f557](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2e8f557ac4453ca0c6d7ff1be9cee0ccabbc9047))
* **generator:** output beastcss error, even if debug mode is disabled ([4d2e833](https://github.com/freddy38510/quasar-app-extension-ssg/commit/4d2e83305bfa5b413ed917f94c177f776927ddbd))
* remove comments and condense whitespaces when minifying html ([e159cfe](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e159cfe1010908a531838452a97c868aaebeff5a))

### [2.1.3](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.1.2...v2.1.3) (2021-10-12)


### Bug Fixes

* **deps:** update dependency fastq to v1.13.0 ([fe8ed9a](https://github.com/freddy38510/quasar-app-extension-ssg/commit/fe8ed9a5fd1c3c2b7c3ffdef12ff0fdc4c1958db))
* **deps:** update dependency jiti to v1.12.6 ([2ad0de7](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2ad0de7b04761569b781f360f0253013fc60abcf))
* **deps:** update dependency node-html-parser to v5 ([#64](https://github.com/freddy38510/quasar-app-extension-ssg/issues/64)) ([e9a15bd](https://github.com/freddy38510/quasar-app-extension-ssg/commit/e9a15bdce4f92233e897ecf14fc1f4a4e032d0d2))
* **deps:** update dependency workbox-build to v6.3.0 ([#52](https://github.com/freddy38510/quasar-app-extension-ssg/issues/52)) ([d584016](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d5840166e1951673b7e18d64dbe0801160960d5f))

### [2.1.2](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.1.1...v2.1.2) (2021-09-01)


### Bug Fixes

* avoid hydration errors caused by html-minifier ([da65dbe](https://github.com/freddy38510/quasar-app-extension-ssg/commit/da65dbeba0fc0fafa4babb88935b7a2f436bfb38))

### [2.1.1](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.1.0...v2.1.1) (2021-09-01)


### Bug Fixes

* **deps:** update dependency globby to v11.0.4 ([#47](https://github.com/freddy38510/quasar-app-extension-ssg/issues/47)) ([3a5ec37](https://github.com/freddy38510/quasar-app-extension-ssg/commit/3a5ec37341bfa8609ec16f058929190678db9e99))
* **deps:** update dependency node-html-parser to v4.1.4 ([#48](https://github.com/freddy38510/quasar-app-extension-ssg/issues/48)) ([a3b9f7b](https://github.com/freddy38510/quasar-app-extension-ssg/commit/a3b9f7ba54557ebe722b6d217c449acbbdb7f0f5))
* **deps:** update dependency workbox-build to v6 ([#50](https://github.com/freddy38510/quasar-app-extension-ssg/issues/50)) ([17106cc](https://github.com/freddy38510/quasar-app-extension-ssg/commit/17106cc48d2f27617d357df2c3050d1859c9a01c))

## [2.1.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.0.0...v2.1.0) (2021-08-31)


### ⚠ BREAKING CHANGES

* deprecate inlineCriticalAsyncCss option in favor of inlineCriticalCss.

### Features

* inline critical css and async load the rest ([d1f1587](https://github.com/freddy38510/quasar-app-extension-ssg/commit/d1f15871cf695169f2d2baa7956553be816ec95e))
* **serve:** serve index file with no-cache headers ([42b18a6](https://github.com/freddy38510/quasar-app-extension-ssg/commit/42b18a60d7a587b622a8fb17ee7b5a1dc87aa755))


### Bug Fixes

* remove unused onPublish hook ([2ddbfa4](https://github.com/freddy38510/quasar-app-extension-ssg/commit/2ddbfa4d52bace977fa990fe820101ddfa236cdc))

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
