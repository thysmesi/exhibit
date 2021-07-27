import pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export var digitCount = function (num) {
    if (num === 0) return 1
    return Math.floor(Math.log10(Math.abs(num))) + 1
}
export async function selectFiles(types) {
    let promise = new Promise((resolve) => {
        let input = document.createElement("input")
        input.type = "file"
        input.accept = types
        input.multiple = true

        input.onchange = () => {
            let output = []

            for (let i = 0; i < input.files.length; i++) {
                let file = input.files[i]
                if (
                    file.type === "application/pdf" ||
                    file.type === "application/wps-office.pdf" ||
                    file.type === 'application/pdf' || file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === "image/png"
                ) {
                    output.push(file)
                }
            }
            resolve(output)
        }

        input.click()
    })
    return promise
}
export async function convertFileToBase64(file) {
    const pdfConvertDpi = 300

    return new Promise((resolve, reject) => {
        if (file.type === "application/pdf")  {
            let output = []
            let fr = new FileReader()
            fr.onload = function(event){
                var loadingTask = pdfjs.getDocument({data:event.target.result});
                loadingTask.promise.then(function(pdf) {
                    for(let i = 1; i <= pdf.numPages; i++){
                        pdf.getPage(i).then(function(page) {
                            let viewport = page.getViewport({scale:pdfConvertDpi/72,rotation:0,dontFlip:false})
                            let canvas = document.createElement('canvas')
                            canvas.width = viewport.width
                            canvas.height = viewport.height
                            let context = canvas.getContext('2d')

                            var renderContext = {
                                canvasContext: context,
                                viewport: viewport,
                            };
                            let renderTask = page.render(renderContext)
                            renderTask.promise.then(()=>{
                                output.push(canvas.toDataURL().split(',')[1])
                                if(i==pdf.numPages) resolve(output)
                            })
                        })
                    }
                })
            }
            fr.readAsText(file)
        } else {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve([reader.result.split(',')[1]])
            reader.onerror = reject;
        }
    });
}