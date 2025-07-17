import pkgLock from '../../package-lock.json'
import { expect } from 'chai'
import { createTestRunner } from './messaging.js'
import {
    BarcodeDetectorPolyfill, ZBAR_WASM_PKG_NAME, ZBAR_WASM_VERSION, ZBAR_WASM_REPOSITORY
} from '@undecaf/barcode-detector-polyfill'


const tests = {
    'trueTest': (value) => {
        expect(value).to.be.true
    },


    'asyncTrueTest': async (value) => {
        const promise = new Promise((resolve, reject) => {
            resolve(value)
        });

        expect(await promise).to.be.true
    },


    'hasMetaInfo': () => {
        expect(ZBAR_WASM_PKG_NAME).to.equal('@undecaf/zbar-wasm')
        expect(ZBAR_WASM_VERSION).to.equal(pkgLock.dependencies[ZBAR_WASM_PKG_NAME].version)
        expect(ZBAR_WASM_REPOSITORY).to.equal(`https://cdn.jsdelivr.net/npm/${ZBAR_WASM_PKG_NAME}@${ZBAR_WASM_VERSION}`)
    },


    'providesApi': () => {
        const detector = new BarcodeDetectorPolyfill()
        expect(BarcodeDetectorPolyfill).itself.to.respondTo('getSupportedFormats')
        expect(detector).to.be.an('object')
        expect(detector).to.respondTo('detect')
    },


    'supportsFormats': async (supportedFormats) => {
        expect(await BarcodeDetectorPolyfill.getSupportedFormats()).to.include.members(supportedFormats)
    },


    'rejectUnsupportedFormats': (formats) => {
        expect(() => new BarcodeDetectorPolyfill({ formats })).to.throw(TypeError)
    },


    'acceptsImageData': async (imageData) => {
        const detector = new BarcodeDetectorPolyfill()

        expect(await detector.toImageData(imageData)).to.eql(imageData)
    },


    'acceptsBlob': async ({ blob, imageData }) => {
        const
            detector = new BarcodeDetectorPolyfill(),
            imageBitmap = await createImageBitmap(blob);

        expect(await detector.toImageData(blob)).to.eql(imageData)
    },


    'acceptsOffscreenCanvas': async ({ imageBitmap, imageData }) => {
        const
            detector = new BarcodeDetectorPolyfill(),
            offscreenCanvas = new OffscreenCanvas(imageData.width, imageData.height),
            offscreenContext = offscreenCanvas.getContext('2d');
        offscreenContext.drawImage(imageBitmap, 0, 0)

        expect(await detector.toImageData(offscreenCanvas)).to.eql(imageData)
    },


    'acceptsContext': async ({ imageBitmap, imageData }) => {
        const
            detector = new BarcodeDetectorPolyfill(),
            offscreenCanvas = new OffscreenCanvas(imageData.width, imageData.height),
            offscreenContext = offscreenCanvas.getContext('2d');
        offscreenContext.drawImage(imageBitmap, 0, 0)

        expect(await detector.toImageData(offscreenContext)).to.eql(imageData)
    },


    'acceptsImageBitmap': async ({ imageBitmap, imageData }) => {
        const detector = new BarcodeDetectorPolyfill()

        expect(await detector.toImageData(imageBitmap)).to.eql(imageData)
    },


    'acceptsVideoFrame': async (imageData) => {
        const
            detector = new BarcodeDetectorPolyfill(),
            imageBitmap = await createImageBitmap(imageData),
            videoFrame = new VideoFrame(imageBitmap, { timestamp: 0 });

        expect(await detector.toImageData(videoFrame)).to.eql(imageData)
    },
}


onmessage = createTestRunner(tests)
