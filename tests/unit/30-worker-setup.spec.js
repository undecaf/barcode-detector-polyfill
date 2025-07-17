import { expect } from 'chai'
import { createTestPoster } from './messaging.js'
import {
    supportedFormats, unsupportedFormats, imageUrl, imageScales, image, imageData, imageWidth, imageHeight,
    canvas, context, videoUrl, videoScales
} from './setup-init.js'


describe('BarcodeDetectorPolyfill setup in a web worker', () => {

    const
        worker = new Worker('/unit/worker-setup-tests.js', { type: 'module' }),
        testInWorker = createTestPoster(worker);


    after(() => worker.terminate())


    it('self-test for passing tests', async () => {
        await testInWorker('trueTest', true)
    });


    it('self-test for failing tests', async () => {
        try {
            await testInWorker('trueTest', false)
            expect.fail('')

        } catch {
        }
    });


    it('self-test for passing async tests', async () => {
        await testInWorker('asyncTrueTest', true)
    });


    it('self-test for failing async tests', async () => {
        try {
            await testInWorker('asyncTrueTest', false)
            expect.fail('')

        } catch {
        }
    });


    it('contains meta information on @undecaf/zbar-wasm', async () => {
        await testInWorker('hasMetaInfo')
    });


    it('provides the BarcodeDetector API', async () => {
        await testInWorker('providesApi')
    });


    it('supports the specified formats', async () => {
        await testInWorker('supportsFormats', supportedFormats)
    });


    unsupportedFormats.forEach(formats => {
        it(`rejects formats ${JSON.stringify(formats)}`, async () => {
            await testInWorker('rejectUnsupportedFormats', formats)
        })
    });


    it('accepts ImageData sources', async () => {
        await testInWorker('acceptsImageData', imageData)
    });


    it('accepts Blob sources', async () => {
        const blob = await (await fetch(imageUrl)).blob()

        await testInWorker('acceptsBlob', { blob, imageData })
    });


    it('accepts OffscreenCanvas sources', async () => {
        const
            blob = await (await fetch(imageUrl)).blob(),
            imageBitmap = await createImageBitmap(blob);

        await testInWorker('acceptsOffscreenCanvas', { imageBitmap, imageData })
    });


    it('accepts OffscreenCanvasRenderingContext2D sources', async () => {
        const
            blob = await (await fetch(imageUrl)).blob(),
            imageBitmap = await createImageBitmap(blob);

        await testInWorker('acceptsContext', { imageBitmap, imageData })
    });


    it('accepts ImageBitmap sources', async () => {
        const
            blob = await (await fetch(imageUrl)).blob(),
            imageBitmap = await createImageBitmap(blob);

        await testInWorker('acceptsImageBitmap', { imageBitmap, imageData })
    });


    it('accepts VideoFrame sources', async () => {
        await testInWorker('acceptsVideoFrame', imageData)
    });

})
