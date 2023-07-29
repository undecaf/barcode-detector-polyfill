type Point = { x: number, y: number }

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/detect#return_value
 */
export interface DetectedBarcode {

    boundingBox: DOMRectReadOnly
    cornerPoints: [Point, Point, Point, Point]
    format: string
    rawValue: string

    // @undecaf/zbar-wasm extensions
    orientation: Orientation
    quality: number

}


export enum Orientation {
    UNKNOWN = -1,
    UPRIGHT,
    ROTATED_RIGHT,
    UPSIDE_DOWN,
    ROTATED_LEFT
}
