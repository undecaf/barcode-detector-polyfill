import { BarcodeDetectorPolyfill, Orientation } from '@undecaf/barcode-detector-polyfill'


class BarcodeTest {

    constructor(filename, expectedRawValues, expectedFormats = [filename.split(/\./)[0]]) {
        this.filename = filename
        this.format = [filename.split(/\./)[0]]
        this.filePath = `/media/${filename}.png`
        this.expectedRawValues = Array.isArray(expectedRawValues) ? expectedRawValues : [expectedRawValues]
        this.expectedFormats = Array.isArray(expectedFormats) ? expectedFormats : [expectedFormats]
    }

}


describe('BarcodeDetectorPolyfill detection', () => {

    let tests = [
        new BarcodeTest('codabar', 'A967072A'),
        new BarcodeTest('code_39', 'LOREM-1234'),
        new BarcodeTest('code_93', 'LOREM+/-12345'),
        new BarcodeTest('code_128', 'Lorem-ipsum-12345'),
        new BarcodeTest('databar', '0101234567890128'),
        new BarcodeTest('databar_exp', '0101234567890128-Lorem'),
        new BarcodeTest('ean_8', '91827357'),
        new BarcodeTest('ean_13', '9081726354425'),
        new BarcodeTest('ean_13+2', ['9781234567897', '12'], ['ean_13', 'ean_2']),
        new BarcodeTest('ean_13+5', ['9781234567897', '12345'], ['ean_13', 'ean_5']),
        new BarcodeTest('isbn_10', '123456789X'),
        new BarcodeTest('isbn_13', '9781234567897'),
        new BarcodeTest('isbn_13+2', ['9781234567897', '12'], ['isbn_13', 'ean_2']),
        new BarcodeTest('isbn_13+5', ['9781234567897', '12345'], ['isbn_13', 'ean_5']),
        new BarcodeTest('itf', '123456789098765432'),
        new BarcodeTest('qr_code', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
        new BarcodeTest('upc_a', '162738495012'),
        new BarcodeTest('upc_e', '09876547'),
    ]

    let encodingTest = new BarcodeTest('qr_code.utf8', 'ÄÖÜ äöü ß ÁÉÍÓÚ áéíóú ÀÈÌÒÙ àéíóú')

    let supportedFormats


    before(async () => {
        supportedFormats = await BarcodeDetectorPolyfill.getSupportedFormats()
    })


    async function loadImage(test) {
        const img = document.createElement('img')
        img.src = test.filePath
        await img.decode()
        return img
    }


    async function loadVideo(test) {
        const
            video = document.createElement('video'),
            playing = new Promise(resolve => video.addEventListener('playing', resolve))
        video.src = `${test.filePath}.mp4`
        video.muted = true
        video.play()
        await playing
        return video
    }


    async function loadCanvas(test) {
        const
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            img = await loadImage(test)

        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
        return canvas
    }


    function verify(barcodes, test) {
        expect(barcodes).to.be.an('array').that.has.lengthOf(test.expectedRawValues.length)
        barcodes.forEach(barcode => {
            expect(barcode.format).to.be.oneOf(test.expectedFormats)
            expect(barcode.rawValue).to.be.oneOf(test.expectedRawValues)
        })
    }


    it('supports the required barcode formats', async () => {
        const formats = await BarcodeDetectorPolyfill.getSupportedFormats()

        tests.forEach(test => {
            expect(test.format[0]).to.be.oneOf(formats)
        })
    })


    tests
        .forEach(test =>
            it(`detects ${test.filename} in <img> explicitly`, async () => {
                const img = await loadImage(test)

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const barcodes = await detector.detect(img)

                verify(barcodes, test)
            })
        )


    tests
        // ISBN-10 will be scanned as ISBN-13 or EAN-13 if these are among the accepted formats
        .filter(test => test.filename !== 'isbn_10')

        // EAN-13+* will be scanned as ISBN-13+* if any ISBN-* is among the accepted formats
        .filter(test => !test.filename.startsWith('ean_13+'))

        .forEach(test => {
            it(`detects ${test.filename} in <img> among all formats`, async () => {
                const img = await loadImage(test)

                const detector = new BarcodeDetectorPolyfill({...test, format: undefined})
                const barcodes = await detector.detect(img)

                verify(barcodes, test)
            })
        });


    [tests[0]]
        .forEach(test => {
            it(`${test.filename} is unaffected by <img> resizing`, async () => {
                const test = tests[0]
                const img = await loadImage(test)

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const original = await detector.detect(img)

                verify(original, test)

                img.width /= 50
                img.height /= 30
                const resized = await detector.detect(img)

                expect(resized).to.deep.equal(original)
            })
        });


    tests
        .forEach(test => {
            it(`detects ${test.filename} in <video> explicitly`, async () => {
                const video = await loadVideo(test)

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const barcodes = await detector.detect(video)

                verify(barcodes, test)
            })
        });


    [tests[0]]
        .forEach(test => {
            it(`${test.filename} is unaffected by <video> resizing`, async () => {
                const video = await loadVideo(test)

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const original = await detector.detect(video)

                verify(original, test)

                video.width /= 50
                video.height /= 30
                const resized = await detector.detect(video)

                expect(resized).to.deep.equal(original)
            });
        });


    [tests[0]]
        .forEach(test => {
            it(`detects ${test.filename} on <canvas> explicitly`, async () => {
                const canvas = await loadCanvas(test)

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const barcodes = await detector.detect(canvas)

                verify(barcodes, test)
            })
        });


    [tests[0]]
        .forEach(test => {
            it(`detects ${test.filename} in CanvasRenderingContext2D explicitly`, async () => {
                const canvas = await loadCanvas(test)

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const barcodes = await detector.detect(canvas.getContext('2d'))

                verify(barcodes, test)
            })
        });


    [tests[0]]
        .forEach(test => {
            it(`detects ${test.filename} in Blob explicitly`, async () => {
                const blob = await (await fetch(test.filePath)).blob()

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const barcodes = await detector.detect(blob)

                verify(barcodes, test)
            })
        });


    // Running this test on browsers that do not support createImageBitmap()
    // is pointless because createImageBitmap() polyfills do not return actual
    // ImageBitmap instances but usually only Image instances which are already
    // covered by other tests
    if (typeof window['createImageBitmap'] === 'function') {
        [tests[0]]
            .forEach(test => {
                it(`detects ${test.filename} in ImageBitmap explicitly`, async () => {
                    const bitmap = await createImageBitmap(await loadImage(test))

                    const detector = new BarcodeDetectorPolyfill({formats: test.format})
                    const barcodes = await detector.detect(bitmap)

                    verify(barcodes, test)
                })
            })
    }


    [tests[0]]
        .forEach(test => {
            it(`detects ${test.filename} in ImageData explicitly`, async () => {
                const canvas = await loadCanvas(test)

                const detector = new BarcodeDetectorPolyfill({formats: test.format})
                const barcodes = await detector.detect(
                    canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height))

                verify(barcodes, test)
            })
        });


    it('handles UTF-8 encoding', async () => {
        const img = await loadImage(encodingTest)

        let detector = new BarcodeDetectorPolyfill({formats: encodingTest.format})
        let barcodes = await detector.detect(img)

        verify(barcodes, encodingTest)

        detector = new BarcodeDetectorPolyfill({formats: encodingTest.format, zbar: {encoding: 'iso-8859-15'}})
        barcodes = await detector.detect(img)

        barcodes.forEach(barcode => {
            expect(barcode.rawValue).not.to.be.oneOf(encodingTest.expectedRawValues)
        })
    })


    it('detects symbol orientation', async () => {
        const orientations = {
            'UPRIGHT': Orientation.UPRIGHT,
            'UPSIDE-DOWN': Orientation.UPSIDE_DOWN,
            'ROT-LEFT': Orientation.ROTATED_LEFT,
            'ROT-RIGHT': Orientation.ROTATED_RIGHT
        }
        const test = {
            ...new BarcodeTest('code_39x4', [], 'code_39'),
            format: ['code_39']
        }
        const img = await loadImage(test)

        const detector = new BarcodeDetectorPolyfill({formats: test.format})
        const barcodes = await detector.detect(img)

        expect(barcodes).to.be.an('array').that.has.lengthOf(Object.keys(orientations).length)
        barcodes.forEach(barcode => {
            expect(barcode.format).to.be.oneOf(test.expectedFormats)
            expect(barcode.orientation).to.equal(orientations[barcode.rawValue])
        })
    })


    it('detects symbol quality', async () => {
        const expectedOrder = ['SMALL', 'MEDIUM', 'LARGE']
        const test = {
            ...new BarcodeTest('code_39x3', [], 'code_39'),
            format: ['code_39']
        }
        const img = await loadImage(test)

        const detector = new BarcodeDetectorPolyfill({formats: test.format})
        const barcodes = await detector.detect(img)

        expect(barcodes).to.be.an('array').that.has.lengthOf(3)
        const actualOrder = barcodes.sort(
            (bc1, bc2) => bc1.quality - bc2.quality).map(barcode => barcode.rawValue)
        expect(actualOrder).to.deep.equal(expectedOrder)
    });


    [{width: 0}, {height: '0'}]
        .forEach(source => {
            it(`accepts ${JSON.stringify(source)} as source`, async () => {
                const detector = new BarcodeDetectorPolyfill()

                const barcodes = await detector.detect(source)

                expect(barcodes).to.be.an('array').that.has.lengthOf(0)
            })
        });


    [undefined, null, '', 0, {}, { width: 1 }]
        .forEach(source => {
            it(`throws a TypeError if the detect() argument is ${source}`, async () => {
                const detector = new BarcodeDetectorPolyfill({formats: tests[0].format})
                try {
                    detector.detect(source)

                } catch (error) {
                    expect(error instanceof TypeError).to.equal(true, `Exception is not a TypeError but ${error}`)
                    return
                }

                expect(false).to.equal(true, 'No exception was thrown')
            })
        });


    [
        document.createElement('img'),
        document.createElement('video'),
        document.createElement('canvas'),
        new Blob(),
    ]
        .forEach(source => {
            it(`returns a rejected Promise for an invalid ${source}`, () => {
                const detector = new BarcodeDetectorPolyfill({formats: tests[0].format})
                detector.detect(source)
                    .then((result) => expect(false).to.equal(true, `Promise not rejected but resolved with ${result}`))
                    .catch(() => {})
            })
        })

})
