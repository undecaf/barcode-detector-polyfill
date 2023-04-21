import esbuild from 'esbuild'
import { replace } from 'esbuild-plugin-replace'
import { ZBAR_WASM_REPOSITORY } from '@undecaf/barcode-detector-polyfill/zbar-wasm'

// Uncomment this to load module @undecaf/zbar-wasm from an alternate repository, e.g. from https://unpkg.com/
// import { ZBAR_WASM_PKG_NAME, ZBAR_WASM_VERSION } from '@undecaf/barcode-detector-polyfill/zbar-wasm'
// const ALTERNATE_ZBAR_WASM_REPOSITORY = `https://unpkg.com/${ZBAR_WASM_PKG_NAME}@${ZBAR_WASM_VERSION}`

const zbarWasmRepository =
    (typeof ALTERNATE_ZBAR_WASM_REPOSITORY !== 'undefined') ? ALTERNATE_ZBAR_WASM_REPOSITORY : ZBAR_WASM_REPOSITORY

const options = {
    entryPoints: ['./src/main.js'],
    bundle: true,
    outfile: '../docs/example-loaded/js/main.js',
    format: 'esm',
    target: 'es2015',
    minify: true,
    sourcemap: false,
    plugins: [
        replace({
            values: {
                // Replaces the repository URL with the alternate repository URL if necessary
                [ZBAR_WASM_REPOSITORY]: zbarWasmRepository,
            },
        }),
    ],
}

console.log(await esbuild.build(options))
