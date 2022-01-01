/**
 * @see https://wicg.github.io/shape-detection-api/#detectedbarcode-section
 */
export interface DetectedBarcode {

    boundingBox: DOMRectReadOnly
    cornerPoints: Array<{ x, y }>
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
