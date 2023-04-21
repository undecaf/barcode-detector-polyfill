import replace from '@rollup/plugin-replace'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import { ZBAR_WASM_REPOSITORY } from '@undecaf/barcode-detector-polyfill/zbar-wasm'

// Uncomment this to load module @undecaf/zbar-wasm from an alternate repository, e.g. from https://unpkg.com/
// import { ZBAR_WASM_PKG_NAME, ZBAR_WASM_VERSION } from '@undecaf/barcode-detector-polyfill/zbar-wasm'
// const ALTERNATE_ZBAR_WASM_REPOSITORY = `https://unpkg.com/${ZBAR_WASM_PKG_NAME}@${ZBAR_WASM_VERSION}`

const zbarWasmRepository =
    (typeof ALTERNATE_ZBAR_WASM_REPOSITORY !== 'undefined') ? ALTERNATE_ZBAR_WASM_REPOSITORY : ZBAR_WASM_REPOSITORY

export default [
    {
        input: 'src/main.js',
        output: {
            file: '../docs/example-loaded/js/main.js',
            format: 'esm',
            generatedCode: 'es2015',
            sourcemap: false,
        },
        external: [
            `${zbarWasmRepository}/dist/main.js`
        ],
        plugins: [
            nodeResolve(),
            replace({
                values: {
                    // Replaces the repository URL with the alternate repository URL if necessary
                    [ZBAR_WASM_REPOSITORY]: zbarWasmRepository,
                },
                preventAssignment: true,
            }),
            terser(),
        ],
    },
]
