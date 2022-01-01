const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const { ZBAR_WASM_PKG_NAME, ZBAR_WASM_REPOSITORY, ZBAR_WASM_VERSION } = require('./dist/zbar-wasm.meta.cjs')


module.exports = function(config) {
    config.set({

        // Base path for all patterns (eg. files, exclude)
        basePath: '',

        // Test frameworks
        frameworks: ['mocha', 'chai'],

        // Files to load into the browser (including required() files)
        files: [
            {
                pattern: 'tests/unit/**/*.spec.*',
                type: 'module',
            },
            {
                pattern: 'tests/media/**/*',
                watched: false,
                included: false,
            },
            {
                pattern: `node_modules/${ZBAR_WASM_PKG_NAME}/dist/**/*.wasm`,
                watched: false,
                included: false,    // not to be bundled, needs to be loaded asynchronously
                type: 'wasm',
            },
        ],

        mime: {
            'application/wasm': ['wasm'],
        },

        proxies: {
            '/base/tests/unit/zbar.wasm': `/base/node_modules/${ZBAR_WASM_PKG_NAME}/dist/zbar.wasm`,
            '/media': '/base/tests/media',
        },

        // Excluded files
        exclude: [
        ],

        // Files to preprocess before being served (including required() files)
        preprocessors: {
            'tests/unit/**/*.spec.*': ['rollup'],
        },

        rollupPreprocessor: {
            output: {
                format: 'esm',
                sourcemap: 'true',
            },
            external: [
                `${ZBAR_WASM_REPOSITORY}/dist/main.js`,
            ],
            plugins: [
                json(),
                nodeResolve({ preferBuiltins: false }),
                commonjs(),
            ],
            onwarn(warning, warn) {
                // Silence the circular dependency warnings originating from Chai
                if (warning.code !== 'CIRCULAR_DEPENDENCY') {
                    warn(warning)
                }
            },
        },

        // Test result reporters
        reporters: ['mocha'],

        // Web server port
        port: 9876,

        // Show colors in reporter and log output
        colors: true,

        // Log level: config.{LOG_DISABLE,LOG_ERROR,LOG_WARN,LOG_INFO,LOG_DEBUG}
        logLevel: config.LOG_INFO,

        // Watch files and execute tests on change
        autoWatch: false,

        // Launch these browsers
        browsers: ['ChromiumHeadless', 'FirefoxHeadless'],

        // Exit after running the tests
        singleRun: true,

        // Number of browsers to be launched simultaneously
        concurrency: Infinity,
    })
}
