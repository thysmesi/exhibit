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
function steralizePage(){
    viewModel.page = Math.max(viewModel.originals.length>0 ? 1 : 0, Math.min(viewModel.originals.length, viewModel.page))
}

let viewModel = new class {
    constructor(){
        let _this = this
        this.bindings = [
            {
                node: document.getElementById("page-width"),
                max: 120,
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
                max: 120,
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
                get max(){ return min(_this.options["page"]["width"], _this.options["page"]["height"]) },
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
                node: document.getElementById("content-width"),
                get max(){ return _this.options["page"]["width"] },
                min: 0.5,
                get value() {
                    return _this.options["content"]["width"] / 72
                },
                set value(value) {
                    _this.options["content"]["width"] =  value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("content-height"),
                get max(){ return _this.options["page"]["height"] },
                min: 0.5,
                get value() {
                    return _this.options["content"]["height"] / 72
                },
                set value(value) {
                    _this.options["content"]["height"] =  value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("content-count"),
                max: 300,
                min: 0,
                get value() {
                    return _this.options["content"]["count"] || ''
                },
                set value(value) {
                    _this.options["content"]["count"] =  value
                    this.node.value = value
                    _this.update()
                }
            }, {
                node: document.getElementById("content-spacing"),
                get max(){ return min(_this.options["page"]["width"], _this.options["page"]["height"])/2-0.5 },
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
                max: 300,
                min: 0,
                get value() {
                    return _this.options["content"]["each"] || ''
                },
                set value(value) {
                    _this.options["content"]["each"] =  value
                    this.node.value = value
                    _this.update()
                }
            }, {
                node: document.getElementById("content-dpi"),
                max: 2400,
                min: 72,
                get value() {
                    return _this.options["content"]["dpi"]
                },
                set value(value) {
                    _this.options["content"]["dpi"] =  value 
                    this.node.value = value
                    _this.update()
                }
            }, {
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
                get value() {
                    return _this.options["content"]["bleed"]["width"] / 72
                },
                set value(value) {
                    _this.options["content"]["bleed"]["width"] =  value * 72
                    this.node.value = value 
                    _this.update()
                }
            }, {
                node: document.getElementById("content-bleed-type-mirror"),
                min: 0,
                get value() {
                    return _this.options["content"]["bleed"]["type"]
                },
                set value(value) {
                    _this.options["content"]["bleed"]["type"] = value
                    _this.update()
                }
            }, {
                node: document.getElementById("content-bleed-type-inset"),
                min: 0,
                get value() {
                    return _this.options["content"]["bleed"]["type"]
                },
                set value(value) {
                    _this.options["content"]["bleed"]["type"] = value
                    _this.update()
                }
            }, {
                node: document.getElementById("content-bleed-type-edge"),
                min: 0,
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
            }
            , {
                node: document.getElementById("marks-offset"),
                min: 0,
                max: 1,
                get value() {
                    return _this.options["marks"]["offset"] / 72
                },
                set value(value) {
                    _this.options["marks"]["offset"] = value * 72
                    this.node.value = value 
                    _this.update()
                }
            }
            
        ]
        this.originals = []

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
        this.options = {
            page: {
                width: 8.5*72,
                height: 11*72,
                margin: .25*72
            },
            content: {
                width: 5*72,
                height: 7*72,
                count: false,
                spacing: .125*72,
                each: false,
                dpi: 300,
                fit: false,
                bleed: {
                    width: .125*72,
                    type: 'mirror'
                }
            },
            marks: {
                length: .125*72,
                offset: .125*72,
                shown: true
            }
        }
        this.page = 1
        this.previewContainer = document.getElementById("preview-container")
        this.preview = document.getElementById("preview")
        this.context = this.preview.getContext("2d")
        this.previewStepper = document.getElementById('preview-stepper')
        this.originalIndex = document.getElementById('original-index')
        this.originalCount = document.getElementById('original-count')
        this.originalInput = document.getElementById("original-uploader")
        this.addOriginalButton = document.getElementById("add-original-button")
        this.originalInput.addEventListener('input', async (event) => {
            this.notification.show()
            for(let i = 0; i < event.target.files.length; i++){
                let file = event.target.files[i]
                this.notification.setMessage(`parseing: ${file.name}`)
                this.notification.setStatus(i/event.target.files.length)
                await this.addOriginal(URL.createObjectURL(file))
            }
            this.originalInput.value = ''
            this.notification.hide()
        })
        this.resize()
        this.previewContainer.addEventListener('mouseenter', ()=>{
            this.previewStepper.style.opacity = 1
        })
        this.previewContainer.addEventListener('mouseleave', (event)=>{
            var divRect = this.previewContainer.getBoundingClientRect();
            if (event.clientX <= divRect.left || event.clientX >= divRect.right ||
                event.clientY <= divRect.top || event.clientY >= divRect.bottom) {
                    this.previewStepper.style.opacity = 0
            }
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
                binding.node.checked = binding.checked
            }
            else if(binding.node.type === "radio") {
                binding.node.checked = binding.node.value === binding.value
            }
            binding.node.addEventListener('change', function() {
                if(binding.node.type === "text") {
                    binding.value = parseFloat(binding.node.value)
                } 
                else if(binding.node.type === "checkbox") {
                    binding.value = binding.node.checked
                }
                else if(binding.node.type === "radio") {
                    if(binding.node.checked) binding.value = binding.node.value
                }
                console.log(binding.node.id + ": " + binding.value)
            })
        })
    }

    async addOriginal(image){
        await viewModel.insertImageBase64(image)
    }

    async rescale() {
        this.preview.style.zoom = Math.min(this.preview.parentNode.clientWidth - 50, this.preview.parentNode.clientHeight - 50) / Math.max(this.options.page.width, this.options.page.height)
    }

    async resize() {
        this.preview.width = this.options.page.width
        this.preview.height = this.options.page.height
        this.rescale()
    }

    async update() {
        steralizePage()
        this.resize()
        let templete = this.model.template(this.options)
        this.context.drawImage(await this.model.render(templete, this.page, parseFloat(this.preview.style.zoom)),0,0)
        this.originalIndex.innerText = this.page
        this.originalCount.innerText = this.model.images.length
    }

    async insertImageBase64(base64) {
        let image = await IJS.Image.load(base64)
        this.model.images.unshift(image)

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
        originals.insertBefore(node, originals.childNodes[0])
        this.originals.unshift(node)

        this.update()
    }
    async insertImageFile(file) {
        
    }
}()

