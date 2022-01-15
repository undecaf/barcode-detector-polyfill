/**
 * Represents {@link external:OffscreenCanvas} if
 * supported, or else {@link external:HTMLCanvasElement}.
 */
export type Canvas = HTMLCanvasElement | OffscreenCanvas


/**
 * Indicates whether there is an {@link external:OffscreenCanvas}
 * that provides an {@link external:OffscreenCanvasRenderingContext2D}.
 */
const offscreenContext2DSupported = ((): boolean => {
    try {
        return (new OffscreenCanvas(1, 1)).getContext('2d') instanceof OffscreenCanvasRenderingContext2D

    } catch {
        return false
    }
})()


/**
 * Returns a new {@link Canvas} having the specified dimensions,
 * either a new {@link external:OffscreenCanvas} instance if possible,
 * or a new instance of {@link external:HTMLCanvasElement} as fallback.
 */
export function newCanvas(width: number, height: number): Canvas {
    if (offscreenContext2DSupported) {
        return new OffscreenCanvas(width, height)

    } else {
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        return canvas
    }
}
