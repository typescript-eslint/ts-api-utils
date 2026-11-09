# Changelog

# [3.0.0](https://github.com/typescript-eslint/ts-api-utils/compare/v3.0.0-rc.1...v3.0.0) (2026-11-09)

### Bug Fixes

- keep legacy main and module fields in tsdown exports ([#1063](https://github.com/typescript-eslint/ts-api-utils/issues/1063)) ([0bf7724](https://github.com/typescript-eslint/ts-api-utils/commit/0bf77242f323a9f42cd17beac98da63ccdb4d1a7)), closes [#1064](https://github.com/typescript-eslint/ts-api-utils/issues/1064)
- treat properties the checker flags readonly as readonly in isPropertyReadonlyInType ([#1059](https://github.com/typescript-eslint/ts-api-utils/issues/1059)) ([5a3b0c4](https://github.com/typescript-eslint/ts-api-utils/commit/5a3b0c4b687bf75f24a15e8be8f50d015ee5a7cf)), closes [#1058](https://github.com/typescript-eslint/ts-api-utils/issues/1058)

# [3.0.0-rc.1](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v2.5.0...v3.0.0-rc.1) (2026-03-21)

### Features

- version 3 ([#796](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/796)) ([f9f5042](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/f9f5042a7541a94d0569cb18a51645c5522767b3))

### BREAKING CHANGES

- Drop support for Node 18
- Minimum supported TypeScript version is now 5.5.2
- Dropped CJS build.
- Removed deprecated API functions.

Co-authored-by: Kevin Deng <sxzz@sxzz.moe>
Co-authored-by: Kevin Deng <hi@sxzz.moe>
Co-authored-by: fisker Cheung <lionkay@gmail.com>
Co-authored-by: Kirk Waiblinger <53019676+kirkwaiblinger@users.noreply.github.com>
Co-authored-by: Josh Goldberg <git@joshuakgoldberg.com>

# [2.5.0](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v2.0.0...v2.5.0) (2026-03-19)

### Bug Fixes

- crash in getWellKnownSymbolPropertyOfType for mapped typeof symbol ([#698](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/698)) ([e97334e](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/e97334e26632babe94cd8d401c0b3373d6c0af65))
- empty commit for publish with provenance ([3f5203c](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/3f5203c09ff6b81942e7685432017b4ed2836c51))
- enable stripInternal to avoid exposing type augmentations ([#765](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/765)) ([77b8485](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/77b8485a61b44f96d12f401e69672afa221c3818)), closes [#759](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/759)
- isPropertyReadonlyInType crash on readonly array of a generic arrow function parameter ([#757](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/757)) ([691cb33](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/691cb33ad09bc5acb38bc6f604fc05277a2fd1a1)), closes [#754](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/754)

### Features

- `isStrictCompilerOptionEnabled` should default to `strict: true` for TS 6 ([#873](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/873)) ([4d6cc50](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/4d6cc50b4e7b939e04a41417c09e983c6ccf8e58)), closes [#870](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/870)
- add `iterateComments` method ([#758](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/758)) ([ea4e4c0](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/ea4e4c087dd75f811b6c4e08187dabce96765aa2)), closes [#755](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/755) [#756](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/756) [#756](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/756)
- add `iterateTokens` method ([#756](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/756)) ([e2ca2a2](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/e2ca2a22f0c58d8a2917707bded3a4269a5c546a)), closes [#755](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/755) [#755](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/755)
- rename *TypeParts functions to *Constituents ([#713](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/713)) ([c3e980e](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/c3e980e9ef52e6bb5d2ea242911020fda1eae861)), closes [#375](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/375)

# [2.4.0](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v2.0.0...v2.4.0) (2026-03-05)

### Bug Fixes

- crash in getWellKnownSymbolPropertyOfType for mapped typeof symbol ([#698](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/698)) ([e97334e](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/e97334e26632babe94cd8d401c0b3373d6c0af65))
- empty commit for publish with provenance ([3f5203c](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/3f5203c09ff6b81942e7685432017b4ed2836c51))
- enable stripInternal to avoid exposing type augmentations ([#765](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/765)) ([77b8485](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/77b8485a61b44f96d12f401e69672afa221c3818)), closes [#759](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/759)
- isPropertyReadonlyInType crash on readonly array of a generic arrow function parameter ([#757](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/757)) ([691cb33](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/691cb33ad09bc5acb38bc6f604fc05277a2fd1a1)), closes [#754](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/754)

### Features

- add `iterateComments` method ([#758](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/758)) ([ea4e4c0](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/ea4e4c087dd75f811b6c4e08187dabce96765aa2)), closes [#755](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/755) [#756](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/756) [#756](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/756)
- add `iterateTokens` method ([#756](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/756)) ([e2ca2a2](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/e2ca2a22f0c58d8a2917707bded3a4269a5c546a)), closes [#755](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/755) [#755](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/755)
- rename *TypeParts functions to *Constituents ([#713](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/713)) ([c3e980e](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/c3e980e9ef52e6bb5d2ea242911020fda1eae861)), closes [#375](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/375)

## [1.4.3](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v1.4.2...v1.4.3) (2024-11-29)

### Bug Fixes

- make `isTypeParameter` no longer a typeguard ([#597](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/597)) ([128237f](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/128237ff3b32e44b3da0040c045dd7f1829fc93e))

## [1.4.2](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v1.4.0...v1.4.2) (2024-11-26)

### Bug Fixes

- remove `.value` field from type declarations for boolean literal types ([#535](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/535)) ([12df298](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/12df29810c4a0b9146f58fdee4a2cbdf28a1bee0)), closes [#528](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/528)

### Performance Improvements

- reduce package size ([#593](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/593)) ([123a8f4](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/123a8f46cbb552bcd3b16ea30ff8925755fc516e))

# [1.4.0](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v1.2.1...v1.4.0) (2024-10-30)

### Bug Fixes

- empty commmit to trigger CI release ([ba0bfdf](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/ba0bfdf29f76bcbc3ec5734b68975c8609c053d4))
- handle const Type Parameters ([#519](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/519)) ([41cd21d](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/41cd21d41f445448681dd32308a48a004f4717cb)), closes [#518](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/518)
- make `isFalsyType()` return `true` for `0n` ([#545](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/545)) ([fe52a60](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/fe52a60573239df2d14ba2e104aa79dd7eaa3791)), closes [#544](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/544)

### Features

- add getAccessKind ([#398](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/398)) ([2f8c76a](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/2f8c76ad1e7d571472902c142d193a2b17e8de58)), closes [#397](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/397)

## [1.2.1](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v1.2.0...v1.2.1) (2024-2-6)

### Bug Fixes

- downgrade engines.node to >=16 ([#390](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/390)) ([2857ee9](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/2857ee968ab401f6662303fedae3acc59aadc24a)), closes [#389](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/389)

# [1.2.0](https://github.com/JoshuaKGoldberg/ts-api-utils/compare/v1.0.2...v1.2.0) (2024-2-5)

### Bug Fixes

- empty fix commit to test release flow ([81f467a](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/81f467a7d63d97af18d1ca66fc08e863a830ee68))

### Features

- add collectVariableUsage API ([#274](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/274)) ([b6a40ea](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/b6a40eae2032f574b233bf90a6394a532a1d92f3)), closes [#263](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/263)
- add typeParts function ([#374](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/374)) ([ab0c924](https://github.com/JoshuaKGoldberg/ts-api-utils/commit/ab0c924d234db0f64c60f0e82b552870ed6bcefa)), closes [#258](https://github.com/JoshuaKGoldberg/ts-api-utils/issues/258)
