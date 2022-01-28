# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
