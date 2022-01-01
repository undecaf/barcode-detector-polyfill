/**
 * Additional {@link BarcodeDetectorPolyfill} options supported by
 * the underlying ZBar implementation.
 */
export class ZBarConfig {

    // Overrides automatic cache management if specified
    enableCache?: boolean

    /**
     * Any of https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings;
     * defaults to UTF-8
     */
    encoding? :string

}