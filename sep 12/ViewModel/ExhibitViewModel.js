let viewModel = new class {
    constructor(){
        this.model = new Generator()

        this.options = {
            page: {
                width: 8.5*72,
                height: 11*72,
                margin: .5*72
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
                offset: .125*72
            }
        }
        this.preview = document.getElementById("preview")
        this.context = this.preview.getContext("2d")
        this.preview.width = this.options.page.width
        this.preview.height = this.options.page.height
        this.resize()

        window.addEventListener('resize', ()=>{this.resize()})
    }

    async resize() {
        this.preview.style.zoom = Math.min(this.preview.parentNode.clientWidth - 50, this.preview.parentNode.clientHeight - 50) / Math.max(this.options.page.width, this.options.page.height)
    }

    async update() {
        let templete = this.model.template(this.options)
        this.context.drawImage(await this.model.render(templete, 1),0,0)
    }

    async insertImageBase64(base64) {
        let image = await IJS.Image.load(base64)
        this.model.images.push(image)

        this.update()
    }
    async insertImageFile(file) {
        
    }
}()

viewModel.insertImageBase64(image)