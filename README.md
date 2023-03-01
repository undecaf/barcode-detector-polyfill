# A WebAssembly polyfill for the Barcode Detection API

This branch demonstrates how to include dependency `zbar.wasm` in a bundle
instead of having it loaded at runtime from a CDN. See `example/src` for 
[Rollup](https://rollupjs.org/) and [esbuild](https://esbuild.github.io/) configurations
and `package.json`.

:warning: This may violate the LGPL licenses of [zbar-wasm](https://github.com/undecaf/zbar-wasm)
and [zbar](https://github.com/mchehab/zbar).
