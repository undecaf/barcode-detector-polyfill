import { expect } from 'chai'
import { createTestRunner } from './messaging.js'
import { verify } from './detection-init.js'
import { BarcodeDetectorPolyfill, Orientation } from '@undecaf/barcode-detector-polyfill'


const tests = {
    'supportsFormat': async (test) => {
        const formats = await BarcodeDetectorPolyfill.getSupportedFormats()
        expect(test.formats[0]).to.be.oneOf(formats)
    },


    'detectsRequested': async ({ blob, test, loaderIndex }) => {
        const
            detector = new BarcodeDetectorPolyfill({formats: test.formats}),
            source = await loaders[loaderIndex](blob),
            barcodes = await detector.detect(source);

        verify(barcodes, test)
    },


    'detectsAutomatically': async ({ blob, test, loaderIndex }) => {
        const
            detector = new BarcodeDetectorPolyfill(),
            source = await loaders[loaderIndex](blob),
            barcodes = await detector.detect(source);

        verify(barcodes, test)
    },


    'handlesEncoding': async ({ blob, test }) => {
        let
            detector = new BarcodeDetectorPolyfill({formats: test.formats}),
            barcodes = await detector.detect(blob);

        verify(barcodes, test)

        detector = new BarcodeDetectorPolyfill({formats: test.formats, zbar: {encoding: 'iso-8859-15'}})
        barcodes = await detector.detect(blob)

        barcodes.forEach(barcode => {
            expect(barcode.rawValue).not.to.be.oneOf(test.expectedRawValues)
        })
    },


    'symbolOrientation': async ({ blob, test }) => {
        const orientations = {
            'UPRIGHT': Orientation.UPRIGHT,
            'UPSIDE-DOWN': Orientation.UPSIDE_DOWN,
            'ROT-LEFT': Orientation.ROTATED_LEFT,
            'ROT-RIGHT': Orientation.ROTATED_RIGHT
        }

        const
            detector = new BarcodeDetectorPolyfill({formats: test.formats}),
            barcodes = await detector.detect(blob);

        expect(barcodes).to.be.an('array').that.has.lengthOf(Object.keys(orientations).length)

        barcodes.forEach(barcode => {
            expect(barcode.format).to.be.oneOf(test.expectedFormats)
            expect(barcode.orientation).to.equal(orientations[barcode.rawValue])
        })
    },


    'symbolQuality': async ({ blob, test }) => {
        const
            expectedOrder = ['SMALL', 'MEDIUM', 'LARGE'],
            detector = new BarcodeDetectorPolyfill({formats: test.formats}),
            barcodes = await detector.detect(blob);

        expect(barcodes).to.be.an('array').that.has.lengthOf(3)

        const actualOrder = barcodes.sort(
            (bc1, bc2) => bc1.quality - bc2.quality).map(barcode => barcode.rawValue)
        expect(actualOrder).to.eql(expectedOrder)
    },


    'acceptsObjects': async (source) => {
        const
            detector = new BarcodeDetectorPolyfill(),
            barcodes = await detector.detect(source);

        expect(barcodes).to.be.an('array').that.has.lengthOf(0)
    },


    'throwsTypeError': async ({ source, test }) => {
        const detector = new BarcodeDetectorPolyfill({formats: test.formats})
        try {
            await detector.detect(source)

        } catch (error) {
            expect(error instanceof TypeError).to.equal(true, `Exception is not a TypeError but ${error}`)
            return
        }

        expect.fail('No exception was thrown')
    },


    'rejectsInvalidBlob': async ({ blob, test }) => {
        const detector = new BarcodeDetectorPolyfill({formats: test.formats})

        detector.detect(blob)
            .then((result) => expect.fail(`Promise not rejected but resolved with ${result}`))
            .catch(() => {})
    },
}


onmessage = createTestRunner(tests)


async function loadImageBitmap(blob) {
    return await createImageBitmap(await loadBlob(blob))
}


async function loadImageData(blob) {
    const context = await loadOffscreenCanvasRenderingContext2D(blob)

    return context.getImageData(0, 0, context.canvas.width, context.canvas.height)
}


async function loadOffscreenCanvasRenderingContext2D(blob) {
    const
        imageBitmap = await loadImageBitmap(blob),
        canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height),
        context = canvas.getContext('2d');

    context.drawImage(imageBitmap, 0, 0)

    return context
}


async function loadOffscreenCanvas(blob) {
    return (await loadOffscreenCanvasRenderingContext2D(blob)).canvas
}


async function loadVideoFrame(blob) {
    return new VideoFrame(await loadImageBitmap(blob), { timestamp: 0 })
}


async function loadBlob(blob) {
    return blob
}


export function loadedType(loader) {
    return loader.name.replace('load', '')
}


export const loaders = [
    loadImageBitmap,
    loadImageData,
    loadOffscreenCanvasRenderingContext2D,
    loadOffscreenCanvas,
    loadVideoFrame,
    loadBlob,
]
