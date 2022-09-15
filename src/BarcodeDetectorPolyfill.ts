import { ZBarScanner, scanRGBABuffer, ZBarConfigType, ZBarSymbol, ZBarSymbolType } from '@undecaf/zbar-wasm'
import { ScannerConfig } from './ScannerConfig'
import { DetectedBarcode, Orientation } from './DetectedBarcode'
import { ZBarConfig } from './ZBarConfig'
import { Canvas, newCanvas } from '@/Canvas'


/**
 * A polyfill for {@link external:BarcodeDetector}.
 *
 * @see https://wicg.github.io/shape-detection-api/#barcode-detection-api
 */
export class BarcodeDetectorPolyfill {

    private readonly formats: Array<string>
    private readonly zbarConfig: ZBarConfig

    private canvas?: Canvas
    private scanner?: ZBarScanner


    /**
     * See <a href="https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/BarcodeDetector">
     *     BarcodeDetector()</a>
     */
    constructor(options: { formats?: Array<string>, zbar?: ZBarConfig } = {}) {
        // Validate options as per https://wicg.github.io/shape-detection-api/#barcode-detection-api
        if (typeof options.formats !== 'undefined') {
            if (!Array.isArray(options.formats) || !options.formats.length) {
                throw new TypeError(
                    `Barcode formats should be a non-empty array of strings but are: ${JSON.stringify(options)}`
                )
            }

            const unsupported = options.formats.filter(format => !ScannerConfig.formats().includes(format))

            if (unsupported.length) {
                throw new TypeError(`Unsupported barcode format(s): ${unsupported.join(', ')}`)
            }
        }

        this.formats = options.formats || ScannerConfig.formats()
        this.zbarConfig = options.zbar || new ZBarConfig()
    }


    /**
     * See <a href="https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/getSupportedFormats">
     *     BarcodeDetector.getSupportedFormats()</a>
     */
    static getSupportedFormats(): Promise<Array<string>> {
        return Promise.resolve(ScannerConfig.formats())
    }


    /**
     * Scans an image for barcodes and returns a {@link Promise} for the result.
     *
     * @param {ImageBitmapSource} source the image to be scanned
     * @returns {Promise<Array<DetectedBarcode>>} the scan result as described for {@link BarcodeDetector}
     */
    // TODO Enable cache for video source, disable for others unless overridden in zbarConfig
    detect(source: ImageBitmapSource): Promise<Array<DetectedBarcode>> {
        // Return an empty array immediately if the source is an object with any zero dimension,
        // see https://wicg.github.io/shape-detection-api/#image-sources-for-detection
        const intrinsic = BarcodeDetectorPolyfill.intrinsicDimensions(source)
        if ((intrinsic.width === 0) || (intrinsic.height === 0)) {
            return Promise.resolve([])

        } else {
            return Promise
                .all([
                    this.toImageData(source),
                    this.getScanner()
                ])

                .then(fulfilled => {
                    const
                        imageData: ImageData = fulfilled[0],
                        scanner: ZBarScanner = fulfilled[1];

                    // Configure the image cache if so requested
                    if (typeof this.zbarConfig.enableCache !== 'undefined') {
                        scanner.enableCache(this.zbarConfig.enableCache)
                    }

                    return scanRGBABuffer(imageData.data, imageData.width, imageData.height, scanner)
                })

                .then(symbols => {
                    return symbols.map(symbol =>
                        this.toBarcodeDetectorResult(symbol)
                    )
                })
        }

    }


    /**
     * Returns an {@link ZBarScanner} configured for the requested barcode formats.
     */
    private getScanner(): Promise<ZBarScanner> {
        return new Promise<ZBarScanner>(async (resolve, reject) => {
            if (!this.scanner) {
                const scanner = await ZBarScanner.create()

                // Configure the scanner for the requested formats
                if (this.formats.length > 0) {
                    // Must reset the default configuration first
                    scanner.setConfig(ZBarSymbolType.ZBAR_NONE, ZBarConfigType.ZBAR_CFG_ENABLE, 0)
                    this.formats.forEach(f => ScannerConfig.configure(scanner, f))
                }

                this.scanner = scanner
            }

            resolve(this.scanner)
        })
    }


    /**
     * Converts any {@link external:ImageBitmapSource} to an {@link ImageData} instance.
     */
    private toImageData(source: ImageBitmapSource): Promise<ImageData> {

        const canvasToImageData = (src: CanvasImageSource): ImageData => {
            // Draw on the canvas in the natural size of the source
            const intrinsic = BarcodeDetectorPolyfill.intrinsicDimensions(src)

            // Create a new canvas if the dimensions have changed
            if (!this.canvas || (this.canvas.width !== intrinsic.width) || (this.canvas.height !== intrinsic.height)) {
                this.canvas = newCanvas(intrinsic.width, intrinsic.height)
            }

            const
                canvas = this.canvas,
                context = canvas.getContext('2d');

            context!.drawImage(src, 0, 0)

            return context!.getImageData(0, 0, canvas.width, canvas.height)
        }


        if (source instanceof ImageData) {
            return Promise.resolve(source as ImageData)

        } else if (source instanceof Blob) {
            const image = document.createElement('img')
            image.src = URL.createObjectURL(source)

            return image
                .decode()
                .then(() => canvasToImageData(image))
                .finally(() => URL.revokeObjectURL(image.src))

        } else if (source instanceof CanvasRenderingContext2D) {
            return Promise.resolve(source.getImageData(0, 0, source.canvas.width, source.canvas.height))

        } else {
            return Promise.resolve(canvasToImageData(source as CanvasImageSource))
        }
    }


    /**
     * Converts a ZBar {@link ZBarSymbol} to a {@link DetectedBarcode}.
     */
    private toBarcodeDetectorResult(symbol: ZBarSymbol): DetectedBarcode {
        // Determine a bounding box that contains all points
        const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }

        symbol.points.forEach(point => {
                bounds.minX = Math.min(bounds.minX, point.x)
                bounds.maxX = Math.max(bounds.maxX, point.x)
                bounds.minY = Math.min(bounds.minY, point.y)
                bounds.maxY = Math.max(bounds.maxY, point.y)
            }
        )

        const barcode: DetectedBarcode = {
            format: ScannerConfig.toFormat(symbol.type),
            rawValue: symbol.decode(this.zbarConfig.encoding),
            orientation: symbol.orientation as number,
            quality: symbol.quality,

            boundingBox: DOMRectReadOnly.fromRect({
                x: bounds.minX,
                y: bounds.minY,
                width: bounds.maxX - bounds.minX,
                height: bounds.maxY - bounds.minY,
            }),

            cornerPoints: [
                { x: bounds.minX, y: bounds.minY },
                { x: bounds.maxX, y: bounds.minY },
                { x: bounds.maxX, y: bounds.maxY },
                { x: bounds.minX, y: bounds.maxY },
            ],
        }

        return barcode
    }


    /**
     * Returns the intrinsic (as opposed to the rendered)
     * dimensions of an {@link external:ImageBitmapSource}.
     */
    private static intrinsicDimensions(source: ImageBitmapSource): { width: number, height: number } {
        return {
            width: Number(source['naturalWidth'] || source['videoWidth'] || source['width']),
            height: Number(source['naturalHeight'] || source['videoHeight'] || source['height'])
        }
    }

}
