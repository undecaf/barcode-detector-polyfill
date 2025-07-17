import pkgLock from '../../package-lock.json'
import { expect } from 'chai'
import {
    supportedFormats, unsupportedFormats, imageUrl, imageScales, image, imageData, imageWidth, imageHeight,
    canvas, context, videoUrl, videoScales
} from './setup-init.js'
import {
    BarcodeDetectorPolyfill, ZBAR_WASM_PKG_NAME, ZBAR_WASM_VERSION, ZBAR_WASM_REPOSITORY
} from '@undecaf/barcode-detector-polyfill'


describe('BarcodeDetectorPolyfill setup', () => {

    let detector

    beforeEach(() => {
        detector = new BarcodeDetectorPolyfill()
    })


    it('contains meta information on @undecaf/zbar-wasm', () => {
        expect(ZBAR_WASM_PKG_NAME).to.equal('@undecaf/zbar-wasm')
        expect(ZBAR_WASM_VERSION).to.equal(pkgLock.dependencies[ZBAR_WASM_PKG_NAME].version)
        expect(ZBAR_WASM_REPOSITORY).to.equal(`https://cdn.jsdelivr.net/npm/${ZBAR_WASM_PKG_NAME}@${ZBAR_WASM_VERSION}`)
    });


    it('provides the BarcodeDetector API', () => {
        expect(BarcodeDetectorPolyfill).itself.to.respondTo('getSupportedFormats')
        expect(detector).to.be.an('object')
        expect(detector).to.respondTo('detect')
    });


    it('supports the specified formats', async () => {
        expect(await BarcodeDetectorPolyfill.getSupportedFormats()).to.include.members(supportedFormats)
    });


    unsupportedFormats.forEach(formats => {
        it(`rejects formats ${JSON.stringify(formats)}`, () => {
            expect(() => new BarcodeDetectorPolyfill({ formats })).to.throw(TypeError)
        })
    });


    it('accepts ImageData sources', async () => {
        expect(await detector.toImageData(imageData)).to.eql(imageData)
    });


    it('accepts Blob sources', async () => {
        const blob = await (await fetch(imageUrl)).blob()

        const result = await detector.toImageData(blob)

        expect(result).to.eql(imageData)
    });


    it('accepts OffscreenCanvas sources', async () => {
        const
            offscreenCanvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight),
            offscreenContext = offscreenCanvas.getContext('2d');

        offscreenContext.drawImage(image, 0, 0)

        const result = await detector.toImageData(offscreenCanvas)

        expect(result).to.eql(imageData)
    });


    it('accepts CanvasRenderingContext2D sources', async () => {
        const result = await detector.toImageData(context)

        expect(result).to.eql(imageData)
    });


    it('accepts ImageBitmap sources', async () => {
        const
            bitmap = await createImageBitmap(image),
            result = await detector.toImageData(bitmap);

        expect(result).to.eql(imageData)
    })


    it('accepts VideoFrame sources', async () => {
        const
            bitmap = await createImageBitmap(imageData),
            videoFrame = new VideoFrame(bitmap, { timestamp: 0 }),
            result = await detector.toImageData(canvas);

        expect(result).to.eql(imageData)
    });


    it('accepts <canvas> sources', async () => {
        const result = await detector.toImageData(canvas)

        expect(result).to.eql(imageData)
    });


    imageScales.forEach(scale => {
        it(`accepts <img> sources resized 1:${scale} and uses natural dimensions`, async () => {
            const img = document.createElement('img')
            img.src = imageUrl
            await img.decode()
            img.width /= scale
            img.height /= scale

            const result = await detector.toImageData(img)

            expect(result).to.eql(imageData)
        })
    });


    videoScales.forEach(scale => {
        it(`accepts <video> sources resized by 1:${scale} and uses natural dimensions`, async () => {
            const
                video = document.createElement('video'),
                playing = new Promise(resolve => video.addEventListener('playing', resolve))
            video.src = videoUrl
            video.muted = true
            video.width /= scale
            video.height /= scale
            video.play()
            await playing

            const result = await detector.toImageData(video)

            expect(result.width).to.equal(video.videoWidth)
            expect(result.height).to.equal(video.videoHeight)
        })
    });

})
