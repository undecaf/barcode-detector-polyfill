# A WebAssembly polyfill for the Barcode Detection API

![Minified size](https://badgen.net/packagephobia/install/@undecaf/barcode-detector-polyfill?color=42cc24)
![Open issues](https://badgen.net/github/open-issues/undecaf/barcode-detector-polyfill)
![Vulnerabilities](https://snyk.io/test/npm/@undecaf/barcode-detector-polyfill/badge.svg)
![Total npm downloads](https://badgen.net/npm/dt/@undecaf/barcode-detector-polyfill)
[![Monthly jsDelivr downloads](https://badgen.net/jsdelivr/hits/npm/@undecaf/barcode-detector-polyfill)](https://www.jsdelivr.com/package/npm/@undecaf/barcode-detector-polyfill)
![License](https://badgen.net/github/license/undecaf/barcode-detector-polyfill)

This package polyfills the [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API) for browsers,
using a [WebAssembly build](https://github.com/undecaf/zbar-wasm#readme) of the 
[ZBar Bar Code Reader](https://github.com/mchehab/zbar#readme) that is written in C/C++.
It offers the following features:

+ Polyfills the [BarcodeDetector](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) class
+ Supports these barcode formats: `codabar`, `code_39`, `code_93`, `code_128`, `databar`, `databar_exp`, `ean_2`, `ean_5`, 
  `ean_8`, `ean_13`, `ean_13+2`, `ean_13+5`, `isbn_10`, `isbn_13`, `isbn_13+2`, `isbn_13+5`, `itf`,
  `qr_code`, `sq_code`, `upc_a`, `upc_e`
+ Not supported: `aztec`, `data_matrix`, `pdf417`
+ Scans `<img>`, `<canvas>` and live `<video>` elements, image and video `Blob`s and `File`s and more
+ Detects multiple barcodes per frame, also with different types
+ Barcodes may be oriented horizontally or vertically
+ Outperforms pure JavaScript polyfills

An online example is available [on GitHub](https://undecaf.github.io/barcode-detector-polyfill/example-loaded/)
([source code](https://github.com/undecaf/barcode-detector-polyfill/tree/master/example-loaded) with build scripts for Rollup and esbuild)
and [on CodePen](https://codepen.io/undecaf/pen/LYzXXzg).


## Polyfilling `BarcodeDetector`

### In an ES module

Install:

```shell
$ npm install @undecaf/barcode-detector-polyfill
    or
$ yarn add @undecaf/barcode-detector-polyfill
```

Make the polyfill available if necessary:

```javascript
import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill'

try {
    window['BarcodeDetector'].getSupportedFormats()
} catch {
    window['BarcodeDetector'] = BarcodeDetectorPolyfill
}
    ⁝
```

Detailed examples are available [here](https://undecaf.github.io/barcode-detector-polyfill/example-loaded/)
([source code](https://github.com/undecaf/barcode-detector-polyfill/tree/master/docs/example-loaded))
and  [here](https://undecaf.github.io/barcode-detector-polyfill/example-bundled/)
([source code](https://github.com/undecaf/barcode-detector-polyfill/tree/master/docs/example-bundled)).


### In a `<script type="module">`

Import the `BarcodeDetectorPolyfill` API:

```html
<script type="module">
    import { BarcodeDetectorPolyfill } from "https://cdn.jsdelivr.net/npm/@undecaf/barcode-detector-polyfill@0.9.22/dist/main.js";

    try {
        window['BarcodeDetector'].getSupportedFormats()
    } catch {
        window['BarcodeDetector'] = BarcodeDetectorPolyfill
    }
      ⁝
</script>
```

A detailed example is available [here](https://undecaf.github.io/barcode-detector-polyfill/example-module/index.html)
([source code](https://github.com/undecaf/barcode-detector-polyfill/tree/master/docs/example-module)).


### In a plain `<script>`

Expose the `BarcodeDetectorPolyfill` API in variable `barcodeDetectorPolyfill`:

```html
<script src="https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.9.15/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@undecaf/barcode-detector-polyfill@0.9.22/dist/index.js"></script>
<script>
    try {
        window['BarcodeDetector'].getSupportedFormats()
    } catch {
        window['BarcodeDetector'] = barcodeDetectorPolyfill.BarcodeDetectorPolyfill
    }
      ⁝
</script>
```

A detailed example is available [here](https://undecaf.github.io/barcode-detector-polyfill/example-script/index.html)
([source code](https://github.com/undecaf/barcode-detector-polyfill/tree/master/docs/example-script)).


## Using `BarcodeDetector`/`BarcodeDetectorPolyfill`

### Querying the supported barcode formats

```javascript
const formats = await BarcodeDetector.getSupportedFormats()
```


### Setting up a `BarcodeDetector` instance

```javascript
const detector = new BarcodeDetector({ formats: ['code_39', 'code_128', 'ean_13'] })
```

If `formats` is omitted then all supported formats will be detected.

<a name="encoding"></a>
Where applicable (e.g. format `'qr_code'`), text is assumed to be UTF-8 encoded. As an extension to the
`BarcodeDetector` API, a different encoding can be set for the `BarcodeDetectorPolyfill`:

```javascript
const detector = new BarcodeDetectorPolyfill({ 
  formats: ['qr_code'],
  zbar: {
      encoding: 'iso-8859-15'
  }
})
```

`encoding` may be any of the [Encoding API encodings](https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings).


### Detecting barcodes

```javascript
const barcodes = await detector.detect(source)
```

`source` must be an object of which an [`ImageBitmap`](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)
can be obtained, or else a 
[`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)
will be thrown:

+ an `<img>` element ([`HTMLImageElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement))
+ a `<video>` element ([`HTMLVideoElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement))
  from which a single frame will be taken
+ a `<canvas>` element ([`HTMLCanvasElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement))
+ an [`ImageBitmap`](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)
+ an [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) instance
+ a [`CanvasRenderingContext2D`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
+ a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) or a 
  [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) with a content `type` of `image/*`

In addition, any object with a zero `width` or `height` property will be tolerated.

The detector processes the `source` in natural size, making detection results independent of the size rendered
by the browser.

Detected barcodes are stored as an array of objects in `barcodes` since `source` may contain multiple barcodes.
Each object has the following properties
([see here for details](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/detect#return_value)):

+ `format`: the detected barcode format (one of the formats specified as constructor options)
+ `rawValue`: the decoded barcode, always a `string` decoded from raw data [as specified](#encoding)
+ `boundingBox`: the [`DOMRectReadOnly`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly) enclosing the
  barcode in the `source`
+ `cornerPoints`: an arry of four `{x, y}` pairs in clockwise order, representing four corner points of the detected barcode.
   `BarcodeDetectorPolyfill` returns the `boundingBox` corner points.

Additional properties provided only by `BarcodeDetectorPolyfill`:
+ `orientation`: `0`&nbsp;&rarr; image is upright, `1`&nbsp;&rarr; rotated 90° clockwise, `2`&nbsp;&rarr; upside down,
  `3`&nbsp;&rarr; rotated 90° counterclockwise, `-1`&nbsp;&rarr; unknown
+ `quality`: a positive integer indicating the barcode quality as seen by the detector,
  specific to each `format`

If an error occurs during barcode detection then the `detect()` method returns a rejected
[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
containing the error.


### Typescript support

Type definitions for `BarcodeDetectorPolyfill`, for constructor and method parameter types and for result types
are provided in `@undecaf/barcode-detector-polyfill/dist/main.d.ts`. 


## Build configurations

### Bundling dependency `@undecaf/zbar-wasm`

[This package](https://www.npmjs.com/package/@undecaf/barcode-detector-polyfill)
is under the MIT license although it depends on [`@undecaf/zbar-wasm`](https://www.npmjs.com/package/@undecaf/zbar-wasm)
which is under LGPL.
Nevertheless, `@undecaf/zbar-wasm` may be bundled in your project as this does not violate the [LGPL requirements](https://fossa.com/blog/open-source-software-licenses-101-lgpl-license/). 

Module `@undecaf/zbar-wasm`, however, expects the WASM file `zbar.wasm` to be located at the same path as itself;
details can be found in the [documentation of `@undecaf/zbar-wasm`](https://github.com/undecaf/zbar-wasm#bundlingdeploying-zbar-wasm).
Therefore, bundlers must be configured accordingly. Configuration examples for [Rollup](https://rollupjs.org/) and [esbuild](https://esbuild.github.io/)
can be found in directory [`example-bundled`](https://github.com/undecaf/barcode-detector-polyfill/tree/master/example-bundled).
They were used to bundle the JavaScript code for this [online example](https://undecaf.github.io/barcode-detector-polyfill/example-bundled/)
in [`docs/example-bundled`](https://github.com/undecaf/barcode-detector-polyfill/tree/master/docs/example-bundled).

### Loading dependency `@undecaf/zbar-wasm` at runtime

~~In order to comply with the LGPL, `@undecaf/zbar-wasm` must not be bundled but may only be loaded as a library at runtime.~~
`@undecaf/zbar-wasm` can also be loaded at runtime, by default from `https://cdn.jsdelivr.net`. It can also be fetched from
a different endpoint if desired.

Bundlers must be configured so that they treat `@undecaf/zbar-wasm` as an external dependency instead of trying to resolve it.
Configuration examples for [Rollup](https://rollupjs.org/) and [esbuild](https://esbuild.github.io/)
can be found in directory [`example-loaded`](https://github.com/undecaf/barcode-detector-polyfill/tree/master/example-loaded).
They were used to bundle the JavaScript code for this [online example](https://undecaf.github.io/barcode-detector-polyfill/example-loaded/)
in [`docs/example-loaded`](https://github.com/undecaf/barcode-detector-polyfill/tree/master/docs/example-loaded).
They also illustrate how to load `@undecaf/zbar-wasm` from a non-default endpoint.


## Credits to ...

+ [lekoala](https://github.com/lekoala) for his [`barcode-detector-zbar`](https://github.com/lekoala/barcode-detector-zbar)
  that has an extensive list of useful links
+ the makers of [Rollup](https://rollupjs.org/) and [esbuild](https://esbuild.github.io/) for their bundlers
  which I consider a pleasure to work with


## Disclaimer

I, the author of this document, have compiled it to the best of my knowledge, but it still expresses my personal opinion.
Therefore, in addition to what the licenses mentioned below state, I hereby decline any liability for
any false, inaccurate, inappropriate or incomplete information that may be presented here.


## License

Software: [MIT](http://opensource.org/licenses/MIT)

Documentation: [CC-BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)
