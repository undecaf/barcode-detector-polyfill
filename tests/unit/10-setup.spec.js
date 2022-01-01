import pkgLock from '../../package-lock.json'
import { expect } from 'chai'
import {
    BarcodeDetectorPolyfill, ZBAR_WASM_PKG_NAME, ZBAR_WASM_VERSION, ZBAR_WASM_REPOSITORY
} from '@undecaf/barcode-detector-polyfill'


describe('BarcodeDetectorPolyfill setup', () => {

    const imgUrl = '/media/code_39.png'
    const videoUrl = `${imgUrl}.mp4`
    const videoWidth = 640
    const videoHeight = 480

    const unsupportedFormats = [ '', [], ['unsupported'] ]
    const imgScales = [ 1, 10 ]
    const videoScales = [ 1, 3 ]

    let imgWidth, imgHeight

    let detector


    before(async () => {
        const img = document.createElement('img')
        img.src = imgUrl
        await img.decode()
        imgWidth = img.naturalWidth
        imgHeight = img.naturalHeight
    })


    beforeEach(() => {
        detector = new BarcodeDetectorPolyfill()
    })


    it('contains meta information on @undecaf/zbar-wasm', () => {
        expect(ZBAR_WASM_PKG_NAME).to.equal('@undecaf/zbar-wasm')
        expect(ZBAR_WASM_VERSION).to.equal(pkgLock.dependencies[ZBAR_WASM_PKG_NAME].version)
        expect(ZBAR_WASM_REPOSITORY).to.equal(`https://cdn.jsdelivr.net/npm/${ZBAR_WASM_PKG_NAME}@${ZBAR_WASM_VERSION}`)
    })


    it('provides the BarcodeDetector API', async () => {
        expect(BarcodeDetectorPolyfill).itself.to.respondTo('getSupportedFormats')
        expect(detector).to.be.an('object')
        expect(detector).to.respondTo('detect')
    });


    unsupportedFormats.forEach(formats => {
        it(`rejects formats ${JSON.stringify(formats)}`, () => {
            expect(() => new BarcodeDetectorPolyfill({ formats })).to.throw(TypeError)
        })
    })


    it('accepts ImageData sources', async () => {
        const src = new ImageData(10, 10);

        expect(await detector.toImageData(src)).to.equal(src)
    })


    it('accepts Blob sources', async () => {
        const blob = await (await fetch(imgUrl)).blob()

        const imageData = await detector.toImageData(blob)

        expect(imageData.width).to.equal(imgWidth)
        expect(imageData.height).to.equal(imgHeight)
    })


    it('accepts ImageBitmap sources', async () => {
        const img = document.createElement('img')
        img.src = imgUrl
        await img.decode()
        const bitmap = await createImageBitmap(img)

        const imageData = await detector.toImageData(bitmap)

        expect(imageData.width).to.equal(imgWidth)
        expect(imageData.height).to.equal(imgHeight)
    });


    imgScales.forEach(scale => {
        it(`accepts <img> sources resized 1:${scale} and uses natural dimensions`, async () => {
            const img = document.createElement('img')
            img.src = imgUrl
            await img.decode()
            img.width /= scale
            img.height /= scale

            const imageData = await detector.toImageData(img)

            expect(imageData.width).to.equal(imgWidth)
            expect(imageData.height).to.equal(imgHeight)
        })
    })


    it('accepts <canvas> sources', async () => {
        const
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            img = document.createElement('img')
        img.src = imgUrl
        await img.decode()

        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)

        const imageData = await detector.toImageData(canvas)

        expect(imageData.width).to.equal(imgWidth)
        expect(imageData.height).to.equal(imgHeight)
    });


    it('accepts CanvasRenderingContext2D sources', async () => {
        const
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            img = document.createElement('img')
        img.src = imgUrl
        await img.decode()

        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)

        const imageData = await detector.toImageData(ctx)

        expect(imageData.width).to.equal(imgWidth)
        expect(imageData.height).to.equal(imgHeight)
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

            const imageData = await detector.toImageData(video)

            expect(imageData.width).to.equal(videoWidth)
            expect(imageData.height).to.equal(videoHeight)
        })
    })

})
