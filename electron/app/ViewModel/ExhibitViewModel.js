let print = console.log

function addOriginalButtonClick(){
    document.getElementById("original-uploader").click()
}
function increasePage(){
    viewModel.page++
    viewModel.update()
}
function decreasePage(){
    viewModel.page--
    viewModel.update()
}
function steralizePage(viewModel){
    // let max = Math.ceil(viewModel.originals.length * (viewModel.options.content.each ? viewModel.options.content.each : viewModel.count) / viewModel.count)
    viewModel.page = Math.max(viewModel.originals.length>0 ? 1 : 0, Math.min(viewModel.max, viewModel.page))
}
// var gd = function(a) {
//     let b = a
//     var best = a
//     while (b > 0) {
//         if(a % b == 0) {
//             if((a / b) + b < best) {
//                 best = b
//             }
//         }
//         b--
//     }
//     return best
// }
async function readAsText(file){
    return new Promise(resolve =>{
        let reader = new FileReader()

        reader.onload = function() {
            resolve(reader.result)
        }

        reader.readAsText(file)
    })
}
async function readAsArrayBuffer(file){
    return new Promise(resolve =>{
        let reader = new FileReader()

        reader.onload = function() {
            resolve(reader.result)
        }

        reader.readAsArrayBuffer(file)
    })
}
async function loadImage(src){
    return new Promise(resolve => {
        let image = new Image()
        image.onload = ()=>{
            resolve(image)
        }
        image.src = src
    })
}

let viewModel = new class {
    constructor(){ 
        let _this = this
        this.bindings = [
            {
                node: document.getElementById("page-width"),
                max: 52,
                min: 0.5,
                get value() {
                    return _this.options["page"]["width"] / 72
                },
                set value(value) {
                    _this.options["page"]["width"] = value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("page-height"),
                max: 52,
                min: 0.5,
                get value() {
                    return _this.options["page"]["height"] / 72
                },
                set value(value) {
                    _this.options["page"]["height"] =  value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("page-margin"),
                get max(){ return Math.min(_this.options["page"]["width"], _this.options["page"]["height"]) },
                min: 0,
                get value() {
                    return _this.options["page"]["margin"] / 72
                },
                set value(value) {
                    _this.options["page"]["margin"] =  value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("content-spacing"),
                get max(){ return Math.min(_this.options["page"]["width"], _this.options["page"]["height"])/2-0.5 },
                min: 0,
                get value() {
                    return _this.options["content"]["spacing"] / 72
                },
                set value(value) {
                    _this.options["content"]["spacing"] =  value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("content-each"),
                max: 50,
                min: 0,
                get value() {
                    return _this.options["content"]["each"] || ''
                },
                set value(value) {
                    value = isNaN(value) | value==0 ? false : value
                    _this.options["content"]["each"] = value
                    this.node.value = value || ''
                    _this.update()
                }
            },
            // , {
            //     node: document.getElementById("content-dpi"),
            //     max: 1200,
            //     min: 72,
            //     get value() {
            //         return _this.options["content"]["dpi"]
            //     },
            //     set value(value) {
            //         _this.options["content"]["dpi"] =  value 
            //         this.node.value = value
            //         _this.update()
            //     }
            // }, 
            {
                node: document.getElementById("content-fit"),
                get value() {
                    return _this.options["content"]["fit"]
                },
                set value(value) {
                    _this.options["content"]["fit"] = value
                    _this.update()
                }
            }, {
                node: document.getElementById("content-bleed-width"),
                min: 0,
                max: 1,
                get value() {
                    return _this.options["content"]["bleed"]["width"] / 72
                },
                set value(value) {
                    _this.options["content"]["bleed"]["width"] = value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("content-bleed-type-mirror"),
                get value() {
                    return _this.options["content"]["bleed"]["type"]
                },
                set value(value) {
                    _this.options["content"]["bleed"]["type"] = value
                    _this.update()
                }
            }, {
                node: document.getElementById("content-bleed-type-inset"),
                get value() {
                    return _this.options["content"]["bleed"]["type"]
                },
                set value(value) {
                    _this.options["content"]["bleed"]["type"] = value
                    _this.update()
                }
            }, {
                node: document.getElementById("content-bleed-type-edge"),
                get value() {
                    return _this.options["content"]["bleed"]["type"]
                },
                set value(value) {
                    _this.options["content"]["bleed"]["type"] = value
                    _this.update()
                }
            }, {
                node: document.getElementById("marks-length"),
                min: 0,
                max: 1,
                get value() {
                    return _this.options["marks"]["length"] / 72
                },
                set value(value) {
                    _this.options["marks"]["length"] = value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("marks-offset"),
                min: -10,
                max: 10,
                get value() {
                    return _this.options["marks"]["offset"] / 72
                },
                set value(value) {
                    _this.options["marks"]["offset"] = value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("marks-shown"),
                get value() {
                    return _this.options["marks"]["shown"]
                },
                set value(value) {
                    _this.options["marks"]["shown"] = value
                    _this.update()
                }
            },
            
        ]
        this.originals = []
        this.dimMode = true
        this.model = new Generator()
        this.notification = {
            container: document.getElementById("notification-container"),
            progress: document.getElementById("notification-status-progress"),
            status: document.getElementById("notification-status-container"),
            message: document.getElementById("notification-message")
        }
        this.notification.show = function(){
            this.container.style.display = 'flex'
        }
        this.notification.hide = function(){
            this.container.style.display = 'none'
        }
        this.notification.setStatus = function(percent) {
            this.progress.style.width = this.status.clientWidth * percent + 'px'
        }
        this.notification.setMessage = function(message) {
            this.message.innerText = message
        }
        this.exportName = ''
        this.exportDPI = 300
        this.navExportButton = document.getElementById('nav-export-button')
        this.exportOriginals = document.getElementById('originial-export-options')
        this.exportSaveButton = document.getElementById('export-save-button')
        this.fileDPIInput = document.getElementById('file-dpi-input')
        this.fileDPIInput.value = this.exportDPI
        this.exportSampler = document.getElementById('sampler')
        this.fileDPIInput.addEventListener('click', ()=>{
            this.fileDPIInput.select()
        })
        this.fileDPIInput.addEventListener('change', ()=>{
            this.exportDPI = Math.max(72, Math.min(1200, parseInt(this.fileDPIInput.value)))
            this.fileDPIInput.value = this.exportDPI
        })
        this.exportSaveButton.addEventListener('click', async ()=> {
            this.notification.setMessage('saving...')
            this.notification.setStatus(0)
            this.notification.show()

            this.exportContainer.style.display = 'none'

            await this.model.generate(this.model.template(this.options), this.exportDPI, this.notification)

            this.notification.hide()
        })
        this.fileNameInput = document.getElementById('file-name-input')
        this.fileNameInput.addEventListener('change', () => {
            this.exportName = this.fileNameInput.value
            if(this.exportName.length == 0) {
                this.exportName = `asdf${`${Math.random()*100000 + 1}`.substring(1,5)}`
            }
        })
        this.fileNameInput.value = `asdf${`${Math.random()*100000 + 1}`.substring(1,5)}`
        this.exportOptions = []
        this.navExportButton.addEventListener('click', ()=>{
            this.exportContainer.style.display = 'flex'

            this.exportOriginals.innerHTML = ''
            for(let i = 0; i < this.model.images.length; i++){
                let image = this.model.images[i].image
                let file = this.model.images[i].file
                let extension
                if(file.destroyed === false) {
                    extension = 'pdf'
                } else {
                    extension = file.name.split('.').pop().toLowerCase();
                }
                this.exportOriginals.innerHTML += `
                    <div class="export-original">
                        <div class="flex">
                            <img class="export-original-icon" src="../assets/${extension == 'svg' ? 'svg.svg' : extension == 'pdf' ? 'pdf.svg' : 'image.svg'}">
                            <div class="export-original-name">${file.name}</div>    
                        </div>
                    </div>
                `
            }
        })
        this.exportContainer = document.getElementById('export-container')
        this.exportClose = document.getElementById('export-close')
        this.exportClose.addEventListener('click', ()=>{
            this.exportContainer.style.display = 'none'
        })
        this.options = {
            page: {
                width: 8.5*72,
                height: 11*72,
                margin: .25*72
            },
            content: {
                width: 5*72,
                height: 7*72,
                spacing: .125*72,
                count: {
                    width: 1,
                    height: 2
                },
                each: false,
                dpi: 300,
                fit: false,
                bleed: {
                    width: .125*72,
                    type: 'mirror'
                }
            },
            marks: {
                length: 1*72,//.125*72,
                offset: -0.025*72,
                shown: true
            }
        }
        this.max = 0
        this.page = 1
        this.previewContainer = document.getElementById("preview-container")
        this.preview = document.getElementById("preview")
        this.context = this.preview.getContext("2d")
        this.previewStepper = document.getElementById('preview-stepper')
        this.originalIndex = document.getElementById('original-index')
        this.originalCount = document.getElementById('original-count')
        this.originalInput = document.getElementById("original-uploader")
        this.addOriginalButton = document.getElementById("add-original-button")
        this.countWidthInput = document.getElementById('content-count-width')
        this.countHeightInput = document.getElementById('content-count-height')
        this.countInputClicker = document.getElementById('content-count-clicker')
        this.heightInputClicker = document.getElementById('content-height-clicker')
        this.widthInputClicker = document.getElementById('content-width-clicker')
        this.heightInput = document.getElementById('content-height')
        this.widthInput = document.getElementById('content-width')
        
        this.countInputClicker.addEventListener('dblclick', ()=>{
            this.dimMode = false
            this.countWidthInput.classList.remove('dimmed')
            this.countWidthInput.disabled = false
            this.countHeightInput.classList.remove('dimmed')
            this.countHeightInput.disabled = false
            this.heightInput.classList.add('dimmed')
            this.heightInput.disabled = true
            this.widthInput.classList.add('dimmed')    
            this.widthInput.disabled = true
            this.update()
        })
        const enableDimMode = () => {
            this.dimMode = true
            this.countWidthInput.classList.add('dimmed')
            this.countWidthInput.disabled = true
            this.countHeightInput.classList.add('dimmed')
            this.countHeightInput.disabled = true
            this.heightInput.classList.remove('dimmed')
            this.heightInput.disabled = false
            this.widthInput.classList.remove('dimmed')    
            this.widthInput.disabled = false
            this.update()
        }
        this.heightInputClicker.addEventListener('dblclick', enableDimMode)
        this.widthInputClicker.addEventListener('dblclick', enableDimMode)
        this.widthInput.value = this.options.content.width/72
        this.widthInput.addEventListener('mouseup', () => {
            this.widthInput.select()
        })
        this.heightInput.value = this.options.content.height/72
        this.heightInput.addEventListener('mouseup', () => {
            this.heightInput.select()
        })
        this.countWidthInput.addEventListener('mouseup', () => {
            this.countWidthInput.select()
        })
        this.countHeightInput.addEventListener('mouseup', () => {
            this.countHeightInput.select()
        })
        this.widthInput.addEventListener('change', ()=> {
            if(isNaN(parseFloat(this.widthInput.value))) {
                this.widthInput.value = 0
            }
            this.options.content.width = Math.max(0.5,Math.min(this.options.page.width/72,parseFloat(this.widthInput.value))) * 72
            this.widthInput.value = this.options.content.width/72
            this.update()
        })
        this.heightInput.addEventListener('change', ()=> {
            if(isNaN(parseFloat(this.heightInput.value))) {
                this.heightInput.value = 0
            }
            this.options.content.height = Math.max(0.5,Math.min(this.options.page.height/72,parseFloat(this.heightInput.value))) * 72
            this.heightInput.value = this.options.content.height/72
            this.update()
        })
        
        this.countWidthInput.addEventListener('change', ()=> {
            if(isNaN(parseFloat(this.countWidthInput.value))) {
                this.countWidthInput.value = 0
            }
            this.options.content.count.width = Math.max(1, parseFloat(this.countWidthInput.value))
            this.update()
        })
        this.countHeightInput.addEventListener('change', ()=> {
            if(isNaN(parseFloat(this.countHeightInput.value))) {
                this.countHeightInput.value = 0
            }
            this.options.content.count.height = Math.max(1, parseFloat(this.countHeightInput.value))
            this.update()
        })



        this.originalInput.addEventListener('input', async (event) => {
            this.notification.show()
            for(let i = 0; i < event.target.files.length; i++){
                let file = event.target.files[i]
                let extension = file.name.split('.').pop().toLowerCase();

                this.notification.setMessage(`parseing: ${file.name}`)
                this.notification.setStatus(i/event.target.files.length)
                let defaultSupported = ['png','jpeg','jpg','webp','bmp','jfif','xbm','pjp','jxl','pjpeg','avif']

                if(extension == 'svg') {
                    let text = await readAsText(file)
                    var svg = new Blob([text], {
                        type: "image/svg+xml;charset=utf-8"
                    })
                    let url = URL.createObjectURL(svg);
                    let image = await loadImage(url)
                    let div = document.createElement('div')
                    div.innerHTML = text
                    let box = div.firstChild.viewBox.baseVal;

                    let aspect = box.width / box.height
                    let canvas = document.createElement('canvas')
                    let context = canvas.getContext('2d')
                    canvas.width = 2000
                    canvas.height = canvas.width / aspect
                    context.drawImage(image,0,0,canvas.width,canvas.height)
    
                    await this.addOriginal(canvas.toDataURL(), file)
                }
                if(defaultSupported.includes(extension)) {
                    await this.addOriginal(URL.createObjectURL(file), file)
                }
                if(extension == 'tiff' || extension == 'tif') {
                    let buffer = await readAsArrayBuffer(file)
                    let tiff = new Tiff({buffer: buffer})
                    await this.addOriginal(tiff.toCanvas().toDataURL(), file)
                }
                if(extension == 'heic') {
                    let blob = await heic2any({
                        blob: file,
                        toType: "image/png",
                        quality: 1
                    })
                    await this.addOriginal(URL.createObjectURL(blob), file)       
                }
                if(extension == 'pdf') {
                    let typedarray = new Uint8Array(await readAsArrayBuffer(file))
                    let pdf = await pdfjsLib.getDocument(typedarray).promise
                    let pages = pdf.numPages
                    for(let i = 1; i <= pages; i ++) {
                        this.notification.setMessage(`parseing page ${i}/${pages}: ${file.name}`)
                        this.notification.setStatus(i/pages)

                        let page = await pdf.getPage( i )
                        let viewport = page.getViewport()
                        let aspect = viewport.viewBox[2] / viewport.viewBox[3]
                        
                        viewport = page.getViewport({ scale:  1000 / viewport.viewBox[2] })
                        let canvas = document.createElement('canvas')
                        let context = canvas.getContext('2d')
                        canvas.width = 1000
                        canvas.height = 1000 / aspect

                        await page.render({canvasContext: context, viewport: viewport}).promise
                        page.name = file.name + ` ${i}`
                        await this.addOriginal(canvas.toDataURL(), page)
                    }
                }
            }
            this.originalInput.value = ''
            this.notification.hide()
        })
        this.originalsNode = document.getElementById('originals')
        this.resize()
        this.previewContainer.addEventListener('mouseenter', ()=>{
            this.previewStepper.style.opacity = 1
        })
        this.addOriginalButton.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.originalsNode.scrollLeft += event.deltaY;
        })
        this.previewContainer.addEventListener('mouseleave', (event)=>{
            var divRect = this.previewContainer.getBoundingClientRect();
            if (event.clientX <= divRect.left || event.clientX >= divRect.right ||
                event.clientY <= divRect.top || event.clientY >= divRect.bottom) {
                    this.previewStepper.style.opacity = 0
            }
        })
        this.originalsNode.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.originalsNode.scrollLeft += event.deltaY;
        })
        window.addEventListener('resize', ()=>{this.rescale()})
        this.bindings.forEach(binding => {
            if(binding.node.type === "text") {
                binding.node.value = binding.value
                binding.node.addEventListener('mouseup', function(){
                    binding.node.select()
                })
            } 
            else if(binding.node.type === "checkbox") {
                binding.node.checked = binding.value
            }
            else if(binding.node.type === "radio") {
                binding.node.checked = binding.node.value === binding.value
            }
            binding.node.addEventListener('change', function() {
                if(binding.node.type === "text") {
                    binding.value = Math.max(binding.min,Math.min(binding.max,parseFloat(binding.node.value)))
                } 
                else if(binding.node.type === "checkbox") {
                    binding.value = binding.node.checked
                }
                else if(binding.node.type === "radio") {
                    if(binding.node.checked) binding.value = binding.node.value
                }
            })
        })
        this.update()
    }

    async addOriginal(image, file){
        await viewModel.insertImageBase64(image, file)
    }

    async rescale() {
        this.preview.style.zoom = Math.min(this.preview.parentNode.clientWidth - 25, this.preview.parentNode.clientHeight - 25) / Math.max(this.options.page.width, this.options.page.height)
    }

    async resize() {
        this.preview.width = this.options.page.width
        this.preview.height = this.options.page.height
        this.rescale()
    }

    async update() {
        this.resize()
        if(!this.dimMode) {
            let spacing = this.options.content.spacing
            let box = {
                width: this.options.page.width - (this.options.page.margin * 2) + spacing,
                height: this.options.page.height - (this.options.page.margin * 2) + spacing
            }
            let countWidthvalue = Math.max(1,Math.min(Math.floor(box.width/((0.5*72)+spacing)),parseFloat(this.countWidthInput.value)))
            let countHeightValue = Math.max(1,Math.min(Math.floor(box.height/((0.5*72)+spacing)),parseFloat(this.countHeightInput.value)))
            this.countHeightInput.value = countHeightValue
            this.countWidthInput.value = countWidthvalue
            this.options.content.count.height = countHeightValue
            this.options.content.count.width = countWidthvalue

            this.options.content.width = box.width / countWidthvalue - spacing
            this.options.content.height = box.height / countHeightValue - spacing
            this.widthInput.value = this.options.content.width / 72
            this.heightInput.value = this.options.content.height / 72
        }
        let templete = this.model.template(this.options)
        this.max = Math.ceil(this.originals.length * (this.options.content.each ? this.options.content.each : templete.contents.length) / templete.contents.length)
        steralizePage(this)
        if(this.dimMode) {
            this.countWidthInput.value = templete.placement.horizontal
            this.countHeightInput.value = templete.placement.vertical
            this.options.content.count.width = templete.placement.horizontal
            this.options.content.count.height = templete.placement.vertical
        }
        this.context.drawImage(await this.model.render(templete, this.page, parseFloat(this.preview.style.zoom)),0,0)
        this.originalIndex.innerText = this.page
        this.originalCount.innerText = this.max
    }

    async insertImageBase64(base64, file) {
        let image = await IJS.Image.load(base64)
        this.model.images.unshift({image, file})

        let originals = document.getElementById('originals')
        let id = `idp${Math.random() * 1000}`
        let node = document.createElement('div')//document.getElementById(id)
        node.id = id
        node.classList.add('original-container')
        let thumbnail
        if (image.width > image.height) {
            thumbnail = image.resize({width: 200})
        } else {
            thumbnail = image.resize({height: 200})
        }
        node.style.background = `url(${thumbnail.toDataURL()})`
        node.style.backgroundSize = 'contain'
        node.style.backgroundRepeat = 'no-repeat'
        node.style.backgroundPosition = 'center'
        node.style.backgroundColor = '#494949'
        node.addEventListener("mouseenter", function(){
            node.innerHTML = `
                <div class="dark"></div>
                <img class="trash" src="../assets/trash.svg">
            `
        })
        node.addEventListener("mouseleave", function(){
            node.innerHTML = ''
        })
        node.addEventListener("mouseup", ()=>{
            let index = this.originals.indexOf(node)
            this.model.images.splice(index, 1);
            this.originals.splice(index, 1)
            node.remove()
            this.update()
        })
        node.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.originalsNode.scrollLeft += event.deltaY;
        })
        originals.insertBefore(node, originals.childNodes[0])
        this.originals.unshift(node)

        this.update()
    }
    async insertImageFile(file) {
        
    }
}()

