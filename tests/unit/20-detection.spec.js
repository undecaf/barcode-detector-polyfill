import { BarcodeDetectorPolyfill, Orientation } from '@undecaf/barcode-detector-polyfill'
import { BarcodeTest, tests, encodingTests, verify } from './detection-init.js'


describe('BarcodeDetectorPolyfill detection', () => {

    async function loadImage(test) {
        const img = document.createElement('img')

        img.src = test.filePath
        await img.decode()

        return img
    }


    async function loadImageBitmap(test) {
        return await createImageBitmap(await loadBlob(test))
    }


    async function loadImageData(test) {
        const context = await loadOffscreenCanvasRenderingContext2D(test)

        return context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    }


    async function loadCanvasRenderingContext2D(test) {
        const
            canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            image = await loadImage(test);

        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        context.drawImage(image, 0, 0)

        return context
    }


    async function loadCanvas(test) {
        return (await loadCanvasRenderingContext2D(test)).canvas
    }


    async function loadOffscreenCanvasRenderingContext2D(test) {
        const
            image = await loadImage(test),
            canvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight),
            context = canvas.getContext('2d');

        context.drawImage(image, 0, 0)

        return context
    }


    async function loadOffscreenCanvas(test) {
        return (await loadOffscreenCanvasRenderingContext2D(test)).canvas
    }


    async function loadVideo(test) {
        const
            video = document.createElement('video'),
            playing = new Promise(resolve => video.addEventListener('playing', resolve));

        video.src = `${test.filePath}.mp4`
        video.muted = true
        video.play()
        await playing

        return video
    }


    async function loadVideoFrame(test) {
        return new VideoFrame(await loadImageBitmap(test), { timestamp: 0 })
    }


    async function loadBlob(test) {
        return await (await fetch(test.filePath)).blob()
    }


    function loadedType(loader) {
        return loader.name.replace('load', '')
    }


    const loaders = [
        loadImage,
        loadImageBitmap,
        loadImageData,
        loadCanvasRenderingContext2D,
        loadCanvas,
        loadOffscreenCanvasRenderingContext2D,
        loadOffscreenCanvas,
        loadVideo,
        loadVideoFrame,
        loadBlob,
    ]


    it('supports the required barcode formats', async () => {
        const formats = await BarcodeDetectorPolyfill.getSupportedFormats()

        tests.forEach(test => {
            expect(test.formats[0]).to.be.oneOf(formats)
        })
    })


    tests
        .forEach(test => loaders
            .forEach(loader =>
                it(`detects requested ${test.filename} in ${loadedType(loader)}`, async () => {
                    const
                        detector = new BarcodeDetectorPolyfill({formats: test.formats}),
                        source = await loader(test),
                    barcodes = await detector.detect(source);

                    verify(barcodes, test)
                })
            )
        );


    tests
        // ISBN-10 will be scanned as ISBN-13 or EAN-13 if these are among the accepted formats
        .filter(test => test.filename !== 'isbn_10')

        // EAN-13+* will be scanned as ISBN-13+* if any ISBN-* is among the accepted formats
        .filter(test => !test.filename.startsWith('ean_13+'))

        .forEach(test => loaders
            .forEach(loader =>
                it(`detects ${test.filename} in ${loadedType(loader)} automatically`, async () => {
                    const
                        detector = new BarcodeDetectorPolyfill(),
                        source = await loader(test),
                        barcodes = await detector.detect(source);

                    verify(barcodes, test)
                })
            )
        );


    tests
        // ISBN-10 will be scanned as ISBN-13 or EAN-13 if these are among the accepted formats
        .filter(test => test.filename !== 'isbn_10')

        // EAN-13+* will be scanned as ISBN-13+* if any ISBN-* is among the accepted formats
        .filter(test => !test.filename.startsWith('ean_13+'))

        .forEach(test => [loadImage, loadVideo]
            .forEach(loader =>
                it(`${test.filename} is unaffected by ${loadedType(loader)} resizing`, async () => {
                    const
                        source = await loader(test),
                        originalDetector = new BarcodeDetectorPolyfill({}),
                        original = await originalDetector.detect(source);

                    verify(original, test)

                    source.width /= 50
                    source.height /= 30

                    const
                        resizedDetector = new BarcodeDetectorPolyfill({}),
                        resized = await resizedDetector.detect(source)

                    expect(resized).to.eql(original)
                })
            )
        );


    encodingTests
        .forEach(test => {
            it('handles UTF-8 encoding', async () => {
                const img = await loadImage(test)

                let detector = new BarcodeDetectorPolyfill({formats: test.formats})
                let barcodes = await detector.detect(img)

                verify(barcodes, test)

                detector = new BarcodeDetectorPolyfill({formats: test.formats, zbar: {encoding: 'iso-8859-15'}})
                barcodes = await detector.detect(img)

                barcodes.forEach(barcode => {
                    expect(barcode.rawValue).not.to.be.oneOf(test.expectedRawValues)
                })
            })
        });


    it('detects symbol orientation', async () => {
        const orientations = {
            'UPRIGHT': Orientation.UPRIGHT,
            'UPSIDE-DOWN': Orientation.UPSIDE_DOWN,
            'ROT-LEFT': Orientation.ROTATED_LEFT,
            'ROT-RIGHT': Orientation.ROTATED_RIGHT
        }
        const test = {
            ...new BarcodeTest('code_39x4', [], 'code_39'),
            formats: ['code_39']
        }
        const img = await loadImage(test)

        const detector = new BarcodeDetectorPolyfill({formats: test.formats})
        const barcodes = await detector.detect(img)

        expect(barcodes).to.be.an('array').that.has.lengthOf(Object.keys(orientations).length)
        barcodes.forEach(barcode => {
            expect(barcode.format).to.be.oneOf(test.expectedFormats)
            expect(barcode.orientation).to.equal(orientations[barcode.rawValue])
        })
    });


    it('detects symbol quality', async () => {
        const expectedOrder = ['SMALL', 'MEDIUM', 'LARGE']
        const test = {
            ...new BarcodeTest('code_39x3', [], 'code_39'),
            formats: ['code_39']
        }
        const img = await loadImage(test)

        const detector = new BarcodeDetectorPolyfill({formats: test.formats})
        const barcodes = await detector.detect(img)

        expect(barcodes).to.be.an('array').that.has.lengthOf(3)
        const actualOrder = barcodes.sort(
            (bc1, bc2) => bc1.quality - bc2.quality).map(barcode => barcode.rawValue)
        expect(actualOrder).to.eql(expectedOrder)
    });


    [{width: 0}, {width: '0'}, {height: 0}, {height: '0'}]
        .forEach(source => {
            it(`accepts ${JSON.stringify(source)} as source`, async () => {
                const detector = new BarcodeDetectorPolyfill()

                const barcodes = await detector.detect(source)

                expect(barcodes).to.be.an('array').that.has.lengthOf(0)
            })
        });


    [undefined, null, '', 0, {}, { width: 1 }]
        .forEach(source => {
            it(`throws a TypeError if the detect() argument is ${JSON.stringify(source)}`, async () => {
                const detector = new BarcodeDetectorPolyfill({formats: tests[0].formats})
                try {
                    await detector.detect(source)

                } catch (error) {
                    expect(error instanceof TypeError).to.equal(true, `Exception is not a TypeError but ${error}`)
                    return
                }

                expect(false).to.equal(true, 'No exception was thrown')
            })
        });


    [
        document.createElement('img'),
        document.createElement('video')
    ]
        .forEach(source => {
            it(`throws a DOMException for an ${source.constructor.name} with invalid state`, async () => {
                source.src = '/'
                const detector = new BarcodeDetectorPolyfill({formats: tests[0].formats})
                try {
                    await detector.detect(source)

                } catch (error) {
                    expect(error instanceof DOMException).to.equal(true, `Exception is not a DOMException but ${error}`)
                    return
                }

                expect.fail('No exception was thrown')
            })
        });


    [
        document.createElement('img'),
        document.createElement('canvas'),
        new Blob(),
    ]
        .forEach(source => {
            it(`returns a rejected Promise for an invalid ${source.constructor.name}`, () => {
                const detector = new BarcodeDetectorPolyfill({formats: tests[0].formats})
                detector.detect(source)
                    .then((result) => expect(false).to.equal(true, `Promise not rejected but resolved with ${result}`))
                    .catch(() => {})
            })
        });

})
