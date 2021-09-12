class Original {
    constructor(image){
        // ----- The loaded canvas renderable Image ----- //
        this.image = image
        this.compressed = {}
        this.box = {
            width: image.width,
            height: image.height
        }
    }
    async loadImageFromData(data){
        return new Promise((resolve, reject)=>{
            let image = document.createElement('img')
            image.onload = ()=>{ resolve(image) }
            image.onerror = ()=>{ reject(image) }
            image.src = data
        })
    }
    async max(max) {
        if(max > Math.max(this.box.width,this.box.height)) {
            this.compressed[`${max}`] = this.image
            return this.image
        }
        if(this.compressed[`${max}`] === undefined){
            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d')

            let scale = max / Math.max(this.box.width, this.box.height)
            canvas.width = this.box.width * scale
            canvas.height = this.box.height * scale
            context.drawImage(this.image, 0,0,canvas.width,canvas.height)
            this.compressed[`${max}`] = await this.loadImageFromData(canvas.toDataURL('image/jpeg', 1))
        }
        return this.compressed[`${max}`]
    }
    // ----- Returns whether rotated the original will make it fit better in another box ----- //
    differentOrientation(other) {
        if(other.width===other.height) return false
        return (other.width > other.height)^(this.box.width > this.box.height)
    }
    // ----- Returns instructions on how to fit original into another box ----- //
    fitInstructions(other) {
        let _other = {
            width: other.width,
            height: other.height
        }
        let _this = {
            width: this.box.width,
            height: this.box.height
        }
        let rotated = false

        if(this.differentOrientation(_other)) {
            _this.width = this.box.height
            _this.height = this.box.width
            rotated = true
        }

        let thisRatio = _this.width / _this.height
        let otherRatio = _other.width / _other.height
        let width = _other.width
        let height = _other.height
        if (thisRatio > otherRatio) {
          height = width / thisRatio
        } else {
          width = height * thisRatio
        }
        return {
            width,
            height,
            rotated,
            offset: {
                x: (_other.width - width) / 2,
                y: (_other.height - height) / 2
            },
            scale: Math.min(_other.width, _other.height) / Math.min(_this.width, _this.height)
        }
    }
    // ----- returns instructions on how to fill another box completely with original ----- //
    fillInstructions(other) {
        let _other = {
            width: other.width,
            height: other.height
        }
        let _this = {
            width: this.box.width,
            height: this.box.height
        }
        let rotated = false

        if(this.differentOrientation(_other)) {
            _this.width = this.box.height
            _this.height = this.box.width
            rotated = true
        }

        let thisRatio = _this.width / _this.height
        let otherRatio = _other.width / _other.height
        let width = _other.width
        let height = _other.height
        let crop = {
            width: _this.width,
            height: _this.height
        }
        let scale 
        if (thisRatio < otherRatio) {
            height = width / thisRatio
            crop.height = _this.width / otherRatio
        } else {
            width = height * thisRatio
            crop.width = _this.height * otherRatio
        }
        let offset = {
            x: (_other.width - width) / 2,
            y: (_other.height - height) / 2
        }
        return {
            width,
            height,
            rotated,
            scale,
            offset,
            crop: {
                x: (_this.width - crop.width) / 2,
                y: (_this.height - crop.height) / 2,
                width: crop.width,
                height: crop.height
            }
        }
    }
    // ----- Draws original onto canvas given params ----- //
    async draw(ctx, x, y, width, height, options={}){
        let image = await this.max(Math.max(width, height))
        let original = ctx
        let fit = options.fit === undefined ? true : options.fit
        let alignment = options.align === undefined ? 'center' : options.align
        let mirror = options.mirror === undefined ? 'none' : options.mirror
        let crop = options.crop === undefined ? false : options.crop
        if(crop) {
            crop.width = crop.width === undefined ? width : crop.width
            crop.height = crop.height === undefined ? height : crop.height    
        }

        let canvas = document.createElement('canvas')
        let context = canvas.getContext('2d')
        let instructions = fit ? this.fitInstructions({width, height}) : this.fillInstructions({width, height})
        canvas.width = width
        canvas.height = height
        
        let align = {
            x: 0,
            y: 0
        }
        
        if(alignment.includes('left')) align.x = -instructions.offset.x
        if(alignment.includes('right')) align.x = instructions.offset.x
        if(alignment.includes('top')) align.y = -instructions.offset.y
        if(alignment.includes('bottom')) align.y = instructions.offset.y
        
        context.save()
        if(instructions.rotated) {
            context.translate(width/2,height/2)
            context.rotate(Math.PI / 2)
            context.translate(-height/2,-width/2)
            context.drawImage(
                image,
                instructions.offset.y+(fit?-align.y:align.x),
                instructions.offset.x+(fit?-align.x:align.y),
                instructions.height,
                instructions.width
            )
        } else {
            context.drawImage(
                image,
                instructions.offset.x+align.x,
                instructions.offset.y+align.y,
                instructions.width,
                instructions.height
            )
        }
        context.restore()

        context.save()
        if(mirror != 'none') {
            let horizontal = (mirror === 'all' || mirror === 'horizontal')
            let vertical = (mirror === 'all' || mirror === 'vertical')
            context.setTransform(
                horizontal  ? -1 : 1,
                0,
                0,
                vertical  ? -1 : 1,
                horizontal ? width : 0,
                vertical ? height : 0
            );
        }
        context.drawImage(canvas,0,0)
        context.restore()

        if(crop) {
            let cx = crop.width < 0 ? width + crop.width : 0
            let cy = crop.height < 0 ? height + crop.height : 0
            let absWidth = Math.abs(crop.width)
            let absHeight = Math.abs(crop.height)
            original.drawImage(canvas,cx,cy,absWidth,absHeight,x,y,absWidth,absHeight)
        } else {
            original.drawImage(canvas, x, y)
        }
    }

}

class ExhibitGenerator {
    static SupportedTypes = [
        'image/apng',
        'image/avif',
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/webp',
        'image/bmp',
        'image/x-icon',
        'application/pdf'
    ]
    static dataToImage(data){
        return new Promise((resolve, reject)=>{
            let image = new Image()
            image.onload = ()=>{resolve(image)}
            image.onerror = ()=>{reject(image)}
            image.src = data
        })
    }
    static rotateToFitBetter(child, parent) {
        return (parent.width > parent.height)^(child.width > child.height)
    }
    
    constructor(options = {}) {
        this.page = options.page || {
            width: (8.5 * 72),
            height: (11 * 72),
            margin: (.125 * 72)
        }
        this.content = options.content || {
            width: (5 * 72),
            height: (7 * 72),
            spacing: (0 * 72),
            fit: false,
            count: false,
            bleed: {
                width: (.125 * 72),
                type: 'inset'
            }
        }
        this.marks = options.marks || {
            length: (.125 * 72),
            offset: (0 * 72),
            shown: false
        }
        this.originals = options.originals || []
        this.update()
    }

    update(){
        let create = this.create()
        this.instructions = create.instructions
        this.numbers = create.numbers
    }

    get usableBox(){
        let margin2 = this.page.margin*2
        return {
            width: this.page.width-margin2,
            height: this.page.height-margin2
        }
    }

    create() {
        let usableBoxWithSpacing = {
            width: this.usableBox.width + this.content.spacing,
            height: this.usableBox.height + this.content.spacing
        }
        let contentWithSpacing = {
            width: this.content.width + this.content.spacing,
            height: this.content.height + this.content.spacing
        }
        let numbers = {}
        numbers.horizontalDefault = Math.floor(usableBoxWithSpacing.width / contentWithSpacing.width)
        numbers.verticalDefault = Math.floor(usableBoxWithSpacing.height / contentWithSpacing.height)
        numbers.default = numbers.horizontalDefault * numbers.verticalDefault
        numbers.horizontalTumbled = Math.floor(usableBoxWithSpacing.width / contentWithSpacing.height)
        numbers.verticalTumbled = Math.floor(usableBoxWithSpacing.height / contentWithSpacing.width)
        numbers.tumbled = numbers.horizontalTumbled * numbers.verticalTumbled
        let tumbled = numbers.tumbled > numbers.default
        numbers.horizontal = tumbled ? numbers.horizontalTumbled : numbers.horizontalDefault
        numbers.vertical = tumbled ? numbers.verticalTumbled : numbers.verticalDefault

        let number = tumbled ? numbers.tumbled : numbers.default
        let box = {
            width: tumbled ? this.content.height : this.content.width,
            height: tumbled ? this.content.width : this.content.height
        }
        numbers.box = {...box}

        let contentBox = {
            width: numbers.horizontal * (box.width + this.content.spacing) - this.content.spacing,
            height: numbers.vertical * (box.height + this.content.spacing) - this.content.spacing
        }
        contentBox.x = (this.page.width - contentBox.width) / 2
        contentBox.y = (this.page.height - contentBox.height) / 2

        let instructions = []
        const mark = (x,y,direction) => {
            instructions.push({
                x,y,direction,type:'mark',length:this.marks.length
            })
        }
        const bleed = (x,y,width,height,position) => {
            instructions.push({
                x,y,width,height,position,type:'bleed'
            })
        }
        for(let index = 0; index < number; index++){
            let y = index === 0 ? 0 : Math.floor(index / numbers.horizontal)
            let x = index - Math.floor(y*numbers.horizontal)
            let center = {
                ...box,
                x: x * (box.width + this.content.spacing) + contentBox.x,
                y: y * (box.height + this.content.spacing) + contentBox.y,
                type: 'content',
                crop: 'center'
            }
            instructions.push(center)

            let left = contentBox.x - this.content.bleed.width - this.marks.offset - this.marks.length
            let top = contentBox.y - this.content.bleed.width - this.marks.offset - this.marks.length
            let right = contentBox.x + contentBox.width + this.content.bleed.width + this.marks.offset
            let bottom = contentBox.y + contentBox.height + this.content.bleed.width + this.marks.offset
            mark(left, center.y, 'horizontal')
            mark(left, center.y+center.height, 'horizontal')
            mark(right, center.y, 'horizontal')
            mark(right, center.y+center.height, 'horizontal')
            mark(center.x, top, 'vertical')
            mark(center.x+center.width, top, 'vertical')
            mark(center.x, bottom, 'vertical')
            mark(center.x+center.width, bottom, 'vertical')
            
            let bleedSize = {
                left: x > 0 ? Math.min(this.content.bleed.width, this.content.spacing/2) : this.content.bleed.width,
                top: y > 0 ? Math.min(this.content.bleed.width, this.content.spacing/2) : this.content.bleed.width,
                right: x < numbers.horizontal-1 ? Math.min(this.content.bleed.width, this.content.spacing/2) : this.content.bleed.width,
                bottom: y < numbers.vertical-1 ? Math.min(this.content.bleed.width, this.content.spacing/2) : this.content.bleed.width
            }
            left = center.x - bleedSize.left
            top = center.y - bleedSize.top
            right = center.x + center.width
            bottom = center.y + center.height

            bleed(left, center.y, bleedSize.left, center.height, 'left')
            bleed(left, top, bleedSize.left, bleedSize.top, 'topleft')
            bleed(center.x, top, center.width, bleedSize.top, 'top')
            bleed(right, top, bleedSize.right, bleedSize.top, 'topright')
            bleed(right, center.y, bleedSize.right, center.height, 'right')
            bleed(right, bottom, bleedSize.right, bleedSize.bottom, 'bottomright')
            bleed(center.x, bottom, center.width, bleedSize.bottom, 'bottom')
            bleed(left, bottom, bleedSize.left, bleedSize.bottom, 'bottomleft')
        }
        return {instructions, numbers}
    }
    async render(page, context) {
        context.fillStyle = "white"
        context.fillRect(0,0,this.page.width,this.page.height)

        let width = this.content.width
        let height = this.content.height
        if(this.numbers.tumbled > this.numbers.default) {
            width = this.content.height
            height = this.content.width
        }

        context.strokeStyle = 'black'
        context.lineWidth = 1

        const drawBoundLine = (start, horizontal) => {
            if(horizontal) {
                context.moveTo(0, start);
                context.lineTo(this.page.width, start);        
            } else {
                context.moveTo(start, 0);
                context.lineTo(start, this.page.height);        
            }
        }

        this.instructions.forEach(instruction => {
            let i = {
                ...instruction,
                width: Math.ceil(instruction.width),
                height: Math.ceil(instruction.height),
                x: Math.floor(instruction.x),
                y: Math.floor(instruction.y)
            }
            switch(i.type) {
                case "content": {
                    this.originals[page-1].draw(context, i.x, i.y, i.width, i.height, {
                        fit: this.content.fit,
                    })
                    break;
                }
                case "bleed": {
                    switch(i.position) {
                        case "left": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'horizontal',
                                crop: {
                                    width: -i.width
                                }
                            })
                            break;
                        }
                        case "right": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'horizontal',
                                crop: {
                                    width: i.width
                                }
                            })
                            break;
                        }
                        case "top": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'vertical',
                                crop: {
                                    height: -i.height
                                }
                            })
                            break;
                        }
                        case "bottom": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'vertical',
                                crop: {
                                    height: i.height
                                }
                            })
                            break;
                        }
                        case "topleft": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'all',
                                crop: {
                                    height: -i.height,
                                    width: -i.width
                                }
                            })
                            break;
                        }
                        case "topright": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'all',
                                crop: {
                                    height: -i.height,
                                    width: i.width
                                }
                            })
                            break;
                        }
                        case "bottomleft": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'all',
                                crop: {
                                    height: i.height,
                                    width: -i.width
                                }
                            })
                            break;
                        }
                        case "bottomright": {
                            this.originals[page-1].draw(context, i.x, i.y, width, height, {
                                fit: this.content.fit,
                                mirror: 'all',
                                crop: {
                                    height: i.height,
                                    width: i.width
                                }
                            })
                            break;
                        }
                    }
                    break;
                }
                case "mark": {
                    if(this.marks.shown) {
                        context.save()
                        context.translate(0.5,0.5)
                        context.strokeStyle = 'black'
                        context.beginPath();
                        context.moveTo(i.x, i.y);
                        context.lineTo(i.direction=="horizontal"?i.x+this.marks.length:i.x, i.direction=="vertical"?i.y+this.marks.length:i.y);
                        context.stroke();  
                        context.restore()  
                    }
                }
            }
        })
        if(this.page.margin>0){
            context.save()
            context.translate(0.5,0.5)
            context.beginPath();
            drawBoundLine(this.page.margin, false)
            drawBoundLine(this.page.width-this.page.margin, false)
            drawBoundLine(this.page.margin, true)
            drawBoundLine(this.page.height-this.page.margin, true)
            context.stroke();      
        }
    }
    generate() {

    }
}

// let image = new Image()
// image.onload = function(){
//     let start = new Date().getTime()
//     let original = new Original(image)
//     let generator = new ExhibitGenerator({originals: [original]})
//     let instructions = generator.create()
//     let canvas = document.createElement('canvas')
//     let context = canvas.getContext('2d')
//     canvas.width = 8.5*72
//     canvas.height = 11*72
//     generator.render(1, context)
//     document.body.appendChild(canvas)
//     console.log(new Date().getTime() - start)
//     canvas.style.transform = 'rotate(0deg)'
// }
// image.src = sampleImage
