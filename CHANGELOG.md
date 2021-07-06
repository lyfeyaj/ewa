# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.4](https://github.com/lyfeyaj/ewa/compare/v1.2.3...v1.2.4) (2021-07-06)


### Bug Fixes

* **ewa-cli:** 修复因为路径中包含空格导致脚本执行报错的问题 ([264cb9a](https://github.com/lyfeyaj/ewa/commit/264cb9a3ed76fcc0be2516b12bd561cf910be4fa))
* **ewa-webpack:** 修复因为路径中包含空格导致脚本执行报错的问题 ([62c1e4f](https://github.com/lyfeyaj/ewa/commit/62c1e4fda10f8d46f6a6019400e2dbf37f9e6e81))





## [1.2.3](https://github.com/lyfeyaj/ewa/compare/v1.2.2...v1.2.3) (2021-07-01)


### Bug Fixes

* **ewa-webpack:** 修复 wxml 绕过缓存的问题 ([624f13e](https://github.com/lyfeyaj/ewa/commit/624f13e52992c7b6e988a3bc4687f9cdd2ce4475))





## [1.2.2](https://github.com/lyfeyaj/ewa/compare/v1.2.0...v1.2.2) (2021-07-01)


### Bug Fixes

* **ewa-cli:** fix for [#49](https://github.com/lyfeyaj/ewa/issues/49) ([9ba99a2](https://github.com/lyfeyaj/ewa/commit/9ba99a2e9094174a5d275dcfe4b3171c1c129af9))
* **ewa-webpack:** 修复 wxml 中的 < 或者 > 可能导致解析报错的问题 ([83d8bda](https://github.com/lyfeyaj/ewa/commit/83d8bda4180b8709976a5a8c13602318fee02223))





## [1.2.1](https://github.com/lyfeyaj/ewa/compare/v1.2.0...v1.2.1) (2021-06-21)


### Bug Fixes

* **ewa-cli:** fix for [#49](https://github.com/lyfeyaj/ewa/issues/49) ([9ba99a2](https://github.com/lyfeyaj/ewa/commit/9ba99a2e9094174a5d275dcfe4b3171c1c129af9))





# [1.2.0](https://github.com/lyfeyaj/ewa/compare/v1.1.0...v1.2.0) (2021-05-21)


### Bug Fixes

* **ewa:** 修复变量引用错误 ([b6be282](https://github.com/lyfeyaj/ewa/commit/b6be2827fe1f12f478dc17db155ed54dd5115a80))
* **ewa-webpack:** 修复 ts 支持，以及入口文件自动忽略 .d.ts 文件 ([0dd8922](https://github.com/lyfeyaj/ewa/commit/0dd89224d53db452e58a190badfce0eff215d6c8))


### Features

* **ewa:** 允许 createStore 自定义注入的方法和属性名称 ([9215776](https://github.com/lyfeyaj/ewa/commit/92157769e07a562006d889726573b201f59a42cc))





# [1.1.0](https://github.com/lyfeyaj/ewa/compare/v1.0.10...v1.1.0) (2021-04-26)


### Bug Fixes

* **ewa-cli:** fix ewa-webpack dependency version ([71d937f](https://github.com/lyfeyaj/ewa/commit/71d937f4f6476971ce48dd21cc48eec41dc9a89b))


### Features

* **ewa-cli:** update templates for custom environments and update deps ([9aae389](https://github.com/lyfeyaj/ewa/commit/9aae389cf68107215d011cebda846f2fc37a02ed))
* **ewa-webpack:** add custom environments support ([2e17f6a](https://github.com/lyfeyaj/ewa/commit/2e17f6a82d01ada675ca076e115faf5ddb56ed8e))
