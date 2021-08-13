import pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function importFiles(accept = "*", multiple = false) {
    return new Promise(resolve => {
        let input = document.createElement("input")
        input.type = 'file'
        input.accept = accept
        input.multiple = multiple

        input.onchange = () => {
            resolve(input.files)
        }
        input.click()
    })
}
export async function loadImage(url) {
    return new Promise(resolve => {
        let image = new Image()
        image.onload = () => {
            resolve(image)
        }
        image.src = url
    })
}
export async function convertPDFtoImages(url, status) {
    return new Promise(async resolve=>{
        var loadingTask = pdfjs.getDocument(url)
        loadingTask.promise.then(async pdf=>{
            let images = []
            for (let number = 1; number <= pdf.numPages; number++) {
                let page = await pdf.getPage(number)
                let viewport = page.getViewport({
                    scale: 1
                })
    
                let canvas = document.createElement('canvas')
                let context = canvas.getContext('2d')
                canvas.width = viewport.width
                canvas.height = viewport.height
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise
                images.push(canvas.toDataURL('image/jpeg', 1))
                status(number / pdf.numPages)

                if(images.length == pdf.numPages) {
                    resolve(images)
                }
            }
        })
    })
}
export async function fitImageTo(image, width, height, options) {
    return new Promise(resolve => {
        let canvas = document.createElement('canvas')
        let context = canvas.getContext('2d')

        let output = {
            width,
            height,
            long: Math.max(width, height),
            short: Math.min(width, height)
        }

        image.long = Math.max(image.width, image.height)
        image.short = Math.min(image.width, image.height)

        let scale = output.long / image.long

        if (image.width / image.height < output.width / output.height && options.rotate === true) {
            canvas.width = image.height * scale
            canvas.height = image.width * scale

            context.translate(canvas.width / 2, canvas.height / 2)
            context.rotate(Math.PI / 2)
            context.drawImage(image, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width)
        } else {
            canvas.width = image.width * scale
            canvas.height = image.height * scale
            context.drawImage(image, 0, 0, canvas.width, canvas.height)
        }
        resolve(canvas.toDataURL('image/jpeg', 1))
    })
}
export function getSizeToFit(fit, container) {

    // get the aspect ratios in case we need to expand or shrink to fit
    var imageAspectRatio    = fit.width/fit.height;
    var targetAspectRatio   = container.width/container.height;

    // no need to adjust the size if current size is square
    var adjustedWidth       = container.width;
    var adjustedHeight      = container.height;

    // get the larger aspect ratio of the two
    // if aspect ratio is 1 then no adjustment needed
    if (imageAspectRatio > targetAspectRatio) {
      adjustedHeight = container.width / imageAspectRatio;
    }
    else if (imageAspectRatio < targetAspectRatio) {
      adjustedWidth = container.height * imageAspectRatio;
    }

    // set the adjusted size (same if square)
    var newSizes = {};
    newSizes.width = adjustedWidth;
    newSizes.height = adjustedHeight;

    return newSizes;
}