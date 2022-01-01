import license from 'rollup-plugin-license'
import pkg from './package.json'
import pkgLock from './package-lock.json'
import replace from '@rollup/plugin-replace'
import ts from 'rollup-plugin-ts'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const ZBAR_WASM_PKG_NAME = '@undecaf/zbar-wasm'
const ZBAR_WASM_VERSION = pkgLock.dependencies[ZBAR_WASM_PKG_NAME].version
const ZBAR_WASM_REPOSITORY = `https://cdn.jsdelivr.net/npm/${ZBAR_WASM_PKG_NAME}@${ZBAR_WASM_VERSION}`

const input = 'src/main.ts'

const replacePlugin = replace({
    values: {
        __ZBAR_WASM_PKG_NAME__: ZBAR_WASM_PKG_NAME,
        __ZBAR_WASM_REPOSITORY__: ZBAR_WASM_REPOSITORY,
        __ZBAR_WASM_VERSION__: ZBAR_WASM_VERSION,
    },
    preventAssignment: true,
})

const plugins = [
    ts(),
    nodeResolve(/*{ preferBuiltins: false }*/),
    replacePlugin,
    license(
        {
            sourcemap: true,
            banner: {
                content: `${pkg.name} v${pkg.version}
                    ${pkg.description}
                    Built ${new Date().toISOString()}
                    (c) 2021-present Ferdinand Kasper <fkasper@modus-operandi.at>
                    Released under the MIT license.
                
                    This work uses https://github.com/undecaf/zbar-wasm.git as per
                    LGPL-2.1 section 6 (https://opensource.org/licenses/LGPL-2.1).`,
                commentStyle: 'ignored',
            },
            thirdParty: {
                allow: '(MIT OR 0BSD)',
            },
        }
    ),
    terser(),
]


export default [
    {
        // Plain <script>
        // '@undecaf/zbar-wasm' must be loaded from a repository at runtime, e.g. as
        // <script src="https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm/dist/index.js></script>
        input,
        output: {
            file: pkg.exports['.'].script,
            format: 'iife',
            generatedCode: 'es2015',
            sourcemap: true,
            globals: {
                [ZBAR_WASM_PKG_NAME]: 'zbarWasm',
            },
            name: 'barcodeDetectorPolyfill',
        },
        external: [ZBAR_WASM_PKG_NAME],
        plugins,
    },

    {
        // ES module and <script type="module">
        // '@undecaf/zbar-wasm' is imported from a repository at runtime
        input,
        output: {
            file: pkg.exports['.'].default,
            format: 'esm',
            generatedCode: 'es2015',
            sourcemap: true,
            paths: {
                [ZBAR_WASM_PKG_NAME]: `${ZBAR_WASM_REPOSITORY}/dist/main.js`,
            },
        },
        external: [ZBAR_WASM_PKG_NAME],
        plugins,
    },

    {
        // Provide metainformation on @undecaf/zbar-wasm as ES module for bundlers
        input: './zbar-wasm.meta.js',
        output: {
            file: pkg.exports['./zbar-wasm'].default,
            format: 'esm',
        },
        plugins: [
            replacePlugin,
            terser(),
        ],
    },

    {
        // Provide metainformation on @undecaf/zbar-wasm as CommonJS module for bundlers
        input: './zbar-wasm.meta.js',
        output: {
            file: pkg.exports['./zbar-wasm'].require,
            format: 'cjs',
        },
        plugins: [
            replacePlugin,
            terser(),
        ],
    },
]
