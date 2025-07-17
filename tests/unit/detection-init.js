import { expect } from 'chai'


export class BarcodeTest {

    constructor(filename, expectedRawValues, expectedFormats = [filename.split(/\./)[0]]) {
        this.filename = filename
        this.formats = [filename.split(/\./)[0]]
        this.filePath = `/media/${filename}.png`
        this.expectedRawValues = Array.isArray(expectedRawValues) ? expectedRawValues : [expectedRawValues]
        this.expectedFormats = Array.isArray(expectedFormats) ? expectedFormats : [expectedFormats]
    }

}


export const tests = [
    new BarcodeTest('codabar', 'A967072A'),
    new BarcodeTest('code_39', 'LOREM-1234'),
    new BarcodeTest('code_93', 'LOREM+/-12345'),
    new BarcodeTest('code_128', 'Lorem-ipsum-12345'),
    new BarcodeTest('databar', '0101234567890128'),
    new BarcodeTest('databar_exp', '0101234567890128-Lorem'),
    new BarcodeTest('ean_8', '91827357'),
    new BarcodeTest('ean_13', '9081726354425'),
    // EAN-13+* will be scanned as ISBN-13+* if any ISBN-* is among the accepted formats
    new BarcodeTest('ean_13+2', ['9781234567897', '12'], ['ean_13', 'ean_2']),
    new BarcodeTest('ean_13+5', ['9781234567897', '12345'], ['ean_13', 'ean_5']),
    // ISBN-10 will be scanned as ISBN-13 or EAN-13 if these are among the accepted formats
    new BarcodeTest('isbn_10', '123456789X'),
    new BarcodeTest('isbn_13', '9781234567897'),
    new BarcodeTest('isbn_13+2', ['9781234567897', '12'], ['isbn_13', 'ean_2']),
    new BarcodeTest('isbn_13+5', ['9781234567897', '12345'], ['isbn_13', 'ean_5']),
    new BarcodeTest('itf', '123456789098765432'),
    new BarcodeTest('qr_code', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
    new BarcodeTest('qr_code.utf8-1', 'ÄÖÜ äöü ß ÁÉÍÓÚ áéíóú ÀÈÌÒÙ àéíóú'),
    new BarcodeTest('qr_code.utf8-2', 'Thôn Hoan Trung, Chiến Thắng, Bắc Sơn, Lạng Sơn'),
    new BarcodeTest('upc_a', '162738495012'),
    new BarcodeTest('upc_e', '09876547'),
]


export const encodingTests = [
    new BarcodeTest('qr_code.utf8-1', 'ÄÖÜ äöü ß ÁÉÍÓÚ áéíóú ÀÈÌÒÙ àéíóú'),
    new BarcodeTest('qr_code.utf8-2', 'Thôn Hoan Trung, Chiến Thắng, Bắc Sơn, Lạng Sơn'),
]


export function verify(barcodes, test) {
    expect(barcodes).to.be.an('array').that.has.lengthOf(test.expectedRawValues.length)
    barcodes.forEach(barcode => {
        expect(barcode.format).to.be.oneOf(test.expectedFormats)
        expect(barcode.rawValue).to.be.oneOf(test.expectedRawValues)
    })
}
