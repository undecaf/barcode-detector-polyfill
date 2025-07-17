export const
    supportedFormats = [
        'codabar', 'code_39', 'code_93', 'code_128', 'databar', 'databar_exp',
        'ean_2', 'ean_5', 'ean_8', 'ean_13', 'ean_13+2', 'ean_13+5',
        'isbn_10', 'isbn_13', 'isbn_13+2', 'isbn_13+5',
        'itf', 'qr_code', 'sq_code', 'upc_a', 'upc_e'
    ],
    unsupportedFormats = [ '', [], ['unsupported'] ];

export const
    imageUrl = '/media/code_39.png',
    imageScales = [ 1, 5, 10 ],
    image = document.createElement('img'),
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');

export const { imageData, imageWidth, imageHeight } = await (async () => {
    image.src = imageUrl
    await image.decode()

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    context.drawImage(image, 0, 0)

    return {
        imageData: context.getImageData(0, 0, canvas.width, canvas.height),
        imageWidth: canvas.width,
        imageHeight: canvas.height,
    }
})();

export const
    videoUrl = `${imageUrl}.mp4`,
    videoScales = [ 1, 3, 5 ];
