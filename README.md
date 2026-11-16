<h1 align="center">TypeScript API Utils</h1>

<p align="center">
  Utility functions for working with TypeScript's API.
  Successor to the wonderful tsutils.
  🛠️️
</p>

<p align="center">
	<a href="https://github.com/typescript-eslint/ts-api-utils/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/typescript-eslint/ts-api-utils" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/typescript-eslint/ts-api-utils?label=%F0%9F%A7%AA%20coverage" /></a>
  <a href="#" target="_blank"><img alt="📚 Documentation Coverage" src="https://raw.githubusercontent.com/typescript-eslint/ts-api-utils/refs/heads/main/docs/coverage.svg" /></a>
	<a href="https://github.com/typescript-eslint/ts-api-utils/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/ts-api-utils"><img alt="📦 npm version" src="https://img.shields.io/npm/v/ts-api-utils?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

```shell
npm i ts-api-utils
```

```ts
import * as tsutils from "ts-api-utils";

tsutils.forEachToken(/* ... */);
```

### API

`ts-api-utils` provides many utility functions.
Check out our API docs for details:

📝 [ts-api-utils API docs](https://typescript-eslint.github.io/ts-api-utils).

### Supported Versions

`ts-api-utils` supports TypeScript versions `5.5.2` and above and Node versions `20.19.0` and above.

Note: `ts-api-utils` will not work with the TypeScript Native Preview (TypeScript 7) for the foreseeable future, due to
unknowns around the future of the TypeScript Native API.\
See their list of [What Works So Far?](https://github.com/microsoft/typescript-go#what-works-so-far) for details.

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md).
Thanks! 💖
