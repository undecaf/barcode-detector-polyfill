import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill'

const el = {}

document
    .querySelectorAll('[id]')
    .forEach(element => el[element.id] = element)

const ctx = el.canvas.getContext('2d')

let
    supportedFormats,
    detector,
    timeoutId = null;


async function createDetector() {
    supportedFormats = await BarcodeDetectorPolyfill.getSupportedFormats()
    el.formats.innerHTML = supportedFormats.join(', ')
    detector = new BarcodeDetectorPolyfill({ formats: supportedFormats, zbar: { encoding: el.encoding.value } })
}


function detect(source) {
    return detector
        .detect(source)
        .then(symbols => {
            canvas.width = source.naturalWidth || source.videoWidth || source.width
            canvas.height = source.naturalHeight || source.videoHeight || source.height
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            symbols.forEach(symbol => {
                const lastCornerPoint = symbol.cornerPoints[symbol.cornerPoints.length - 1]
                ctx.moveTo(lastCornerPoint.x, lastCornerPoint.y)
                symbol.cornerPoints.forEach(point => ctx.lineTo(point.x, point.y))

                ctx.lineWidth = 3
                ctx.strokeStyle = '#00e000ff'
                ctx.stroke()
            })

            if (!el.details.checked) {
                symbols.forEach(symbol => {
                    delete symbol.boundingBox
                    delete symbol.cornerPoints
                })
            }
            el.result.innerText = JSON.stringify(symbols, null, 2)
        })
}


function detectImg() {
    detectVideo(false)

    if (el.video.srcObject) {
        el.video.srcObject.getTracks().forEach(track => track.stop())
        el.video.srcObject = null
    }

    // FF needs some time to properly update decode()
    setTimeout(() => el.img.decode().then(() => detect(el.img)), 100)
}


function detectVideo(repeat) {
    if (!repeat) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    if (typeof repeat === 'undefined') {
        repeat = true
    }

    if (repeat) {
        detect(el.video)
            .then(() => timeoutId = setTimeout(() => detectVideo(true), 100))

    } else {
        clearTimeout(timeoutId)
        timeoutId = null
    }
}


function onUrlActive() {
    if (el.imgUrl.validity.valid) {
        el.imgBtn.className = el.videoBtn.className = ''
        el.imgUrl.className = 'active'

        el.img.src = el.imgUrl.value
        detectImg()
    }
}


createDetector()

el.encoding.addEventListener('change', createDetector)

el.imgUrl.addEventListener('change', onUrlActive)
el.imgUrl.addEventListener('focus', onUrlActive)


el.fileInput.addEventListener('change', event => {
    el.imgUrl.className = el.videoBtn.className = ''
    el.imgBtn.className = 'button-primary'

    el.img.src = URL.createObjectURL(el.fileInput.files[0])
    el.fileInput.value = null
    detectImg()
})


el.imgBtn.addEventListener('click', event => {
    el.fileInput.dispatchEvent(new MouseEvent('click'))
})


el.videoBtn.addEventListener('click', event => {
    if (!timeoutId) {
        navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: 'environment'}})
            .then(stream => {
                el.imgUrl.className = el.imgBtn.className = ''
                el.videoBtn.className = 'button-primary'

                el.video.srcObject = stream
                detectVideo()
            })
            .catch(error => {
                el.result.innerText = JSON.stringify(error)
            })

    } else {
        el.imgUrl.className = el.imgBtn.className = el.videoBtn.className = ''

        detectVideo(false)
    }
})
