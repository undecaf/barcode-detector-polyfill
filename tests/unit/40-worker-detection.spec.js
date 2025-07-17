import { BarcodeTest, tests, encodingTests, verify } from './detection-init.js'
import { createTestPoster } from './messaging.js'
import { loaders, loadedType } from './worker-detection-tests.js'


describe('BarcodeDetectorPolyfill detection in a web worker', () => {

    const
        worker = new Worker('/unit/worker-detection-tests.js', { type: 'module' }),
        testInWorker = createTestPoster(worker);


    async function fetchBlob(test) {
        return await (await fetch(test.filePath)).blob()
    }


    after(() => worker.terminate())


    it('supports the required barcode formats', async () => {
        tests.forEach(async (test) => {
            await testInWorker('supportsFormat', test)
        })
    })


    tests
        .forEach(async (test) => loaders
            .forEach(async (loader, loaderIndex) =>
                it(`detects requested ${test.filename} in ${loadedType(loader)}`, async () => {
                    await testInWorker('detectsRequested', { blob: await fetchBlob(test), test, loaderIndex })
                })
            )
        );


    tests
        // ISBN-10 will be scanned as ISBN-13 or EAN-13 if these are among the accepted formats
        .filter(test => test.filename !== 'isbn_10')

        // EAN-13+* will be scanned as ISBN-13+* if any ISBN-* is among the accepted formats
        .filter(test => !test.filename.startsWith('ean_13+'))

        .forEach(async (test) => loaders
            .forEach(async (loader, loaderIndex) =>
                it(`detects ${test.filename} in ${loadedType(loader)} automatically`, async () => {
                    await testInWorker('detectsAutomatically', { blob: await fetchBlob(test), test, loaderIndex })
                })
            )
        );


    encodingTests
        .forEach(async (test) => {
            it('handles UTF-8 encoding', async () => {
                await testInWorker('handlesEncoding', { blob: await fetchBlob(test), test })
            })
        });


    it('detects symbol orientation', async () => {
        const test = {
            ...new BarcodeTest('code_39x4', [], 'code_39'),
            formats: ['code_39']
        }

        await testInWorker('symbolOrientation', { blob: await fetchBlob(test), test })
    });


    it('detects symbol quality', async () => {
        const test = {
            ...new BarcodeTest('code_39x3', [], 'code_39'),
            formats: ['code_39']
        }

        await testInWorker('symbolQuality', { blob: await fetchBlob(test), test })
    });


    [{width: 0}, {width: '0'}, {height: 0}, {height: '0'}]
        .forEach(async (source) => {
            it(`accepts ${JSON.stringify(source)} as source`, async () => {
                await testInWorker('acceptsObjects', source)
            })
        });


    [undefined, null, '', 0, {}, { width: 1 }]
        .forEach(async (source) => {
            it(`throws a TypeError if the detect() argument is ${JSON.stringify(source)}`, async () => {
                await testInWorker('throwsTypeError', { source, test: tests[0] })
            })
        });


    it('returns a rejected Promise for an invalid Blob', async () => {
        await testInWorker('rejectsInvalidBlob', { blob: new Blob(), test: tests[0] })
    })

})
