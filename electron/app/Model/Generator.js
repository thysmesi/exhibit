async function readAsText(file){
    return new Promise(resolve =>{
        let reader = new FileReader()

        reader.onload = function() {
            resolve(reader.result)
        }

        reader.readAsText(file)
    })
}
let emptyImageString = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC'
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

class Generator {
    constructor(images = []) {
        this.images = images
    }

    template(options) {
        let page = options.page
        let content = options.content
        let marks = options.marks

        let marginBox = {width: page.width - page.margin, height: page.height - page.margin}

        if (content.count !== false && content.width === false && content.height === false) {
            let best = [page.height > page.width ? 1 : content.count, page.height < page.width ? 1 : content.count]
            for(let i = content.count; i >= 1; i--) {
                if(content.count % i === 0) {
                    if(Math.abs(i - (content.count/i)) < Math.abs(best[0]-best[1])) {
                        best = [i, content.count/i]
                    }
                }
            }
            
            content.width = ((marginBox.width+content.spacing) / best[0]) - content.spacing
            content.height = ((marginBox.height+content.spacing) / best[1]) - content.spacing
        }

        let min = Math.min(content.width, content.height)
        let max = Math.max(content.width, content.height)

        let portrait = {
            horizontal: Math.floor((marginBox.width+content.spacing) / (min + content.spacing)),
            vertical: Math.floor((marginBox.height+content.spacing) / (max + content.spacing))
        }
        portrait.count = portrait.horizontal*portrait.vertical 
        let landscape = {
            horizontal: Math.floor((marginBox.width+content.spacing) / (max + content.spacing)),
            vertical: Math.floor((marginBox.height+content.spacing) / (min + content.spacing))
        }
        landscape.count = landscape.horizontal*landscape.vertical

        let useful = (portrait.count > landscape.count) ? portrait : landscape
        let box = (portrait.count > landscape.count) ? {
            width: min,
            height: max
        } : {
            width: max,
            height: min
        }

        let contentBox = {
            width: (useful.horizontal * (box.width + content.spacing)) - content.spacing,
            height: (useful.vertical * (box.height + content.spacing)) - content.spacing
        }
        contentBox.x = (page.width - contentBox.width) / 2
        contentBox.y = (page.height - contentBox.height) / 2

        let contents = []
        for(let x = 0; x < useful.horizontal; x++) {
            for(let y = 0; y < useful.vertical; y++) {
                let left = x === 0
                let top = y === 0
                let right = x === useful.horizontal-1
                let bottom = y === useful.vertical-1
                let bleed = {
                    left: Math.ceil(left ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width)),
                    top: Math.ceil(top ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width)),
                    right: Math.ceil(right ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width)),
                    bottom: Math.ceil(bottom ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width))
                }

                let main = {
                    x: (box.width + content.spacing) * x + contentBox.x,
                    y: (box.height + content.spacing) * y + contentBox.y,
                    width: box.width,
                    height: box.height,
                    type: 'main',
                    position: 'center'
                }

                let leftX = main.x-bleed.left
                let topY = main.y-bleed.top
                let rightX = main.x+main.width
                let bottomY = main.y+main.height

                contents.push ({
                    main: main,
                    left: {
                        x: leftX,
                        y: main.y,
                        width: bleed.left,
                        height: main.height,
                        type: content.bleed.type,
                        position: 'left'
                    },
                    right: {
                        x: rightX,
                        y: main.y,
                        width: bleed.right,
                        height: main.height,
                        type: content.bleed.type,
                        position: 'right'
                    },
                    top: {
                        x: main.x,
                        y: topY,
                        width: main.width,
                        height: bleed.top,
                        type: content.bleed.type,
                        position: 'top'
                    },
                    bottom: {
                        x: main.x,
                        y: bottomY,
                        width: main.width,
                        height: bleed.bottom,
                        type: content.bleed.type,
                        position: 'bottom'
                    },
                    topleft: {
                        x: leftX,
                        y: topY,
                        width: bleed.left,
                        height: bleed.top,
                        type: content.bleed.type,
                        position: 'topleft'
                    },
                    topright: {
                        x: rightX,
                        y: topY,
                        width: bleed.right,
                        height: bleed.top,
                        type: content.bleed.type,
                        position: 'topright'
                    },
                    bottomleft: {
                        x: leftX,
                        y: bottomY,
                        width: bleed.left,
                        height: bleed.bottom,
                        type: content.bleed.type,
                        position: 'bottomleft'
                    },
                    bottomright: {
                        x: rightX,
                        y: bottomY,
                        width: bleed.right,
                        height: bleed.bottom,
                        type: content.bleed.type,
                        position: 'bottomright'
                    }
                })
            }
        }
        return {contents, options, placement: {horizontal: useful.horizontal, vertical: useful.vertical}}
    }

    async render({contents, options}, page) {
        let max = 2000

        let canvas = document.createElement('canvas')
        canvas.width = options.page.width
        canvas.height = options.page.height
        let context = canvas.getContext('2d')
        context.fillStyle = "white"
        context.fillRect(0,0,canvas.width,canvas.height)

        var cache = {}
        var bounding = {lx: contents[0].main.x, ly: contents[0].main.y, rx: contents[0].main.x, ry: contents[0].main.y}
        for(let i = 0; i < contents.length; i++) {
            let content = contents[i]
            bounding.lx = Math.min(bounding.lx, content.main.x)
            bounding.ly = Math.min(bounding.ly, content.main.y)
            bounding.rx = Math.max(bounding.rx, content.main.x + content.main.width)
            bounding.ry = Math.max(bounding.ry, content.main.y + content.main.height)
        }

        for(let i = 0; i < contents.length; i++) {
            let content = contents[i]
            let unscaled = JSON.parse(JSON.stringify(contents[i]))
            let {main, left, right, bottom, top, topleft, topright, bottomleft, bottomright} = contents[i]
            if (main.width > max || main.height > max) {
                let scale = 2000 / Math.max(main.width, main.height)
                main.width *= scale
                main.height *= scale
                left.width = Math.floor(left.width * scale)
                left.height *= scale
                right.width *= scale
                right.height *= scale
                bottom.width *= scale
                bottom.height *= scale
                top.width *= scale
                top.height = Math.floor(top.height * scale)
                topleft.width = Math.floor(topleft.width * scale)
                topleft.height = Math.floor(topleft.height * scale)
                topright.width *= scale
                topright.height = Math.floor(topright.height * scale)
                bottomleft.width = Math.floor(bottomleft.width * scale)
                bottomleft.height *= scale
                bottomright.width *= scale
                bottomright.height *= scale
            }
            
            let width = main.width+left.width+right.width
            let height = main.height+top.height+bottom.height
            let name = `${width}x${height}l${left.width}r${right.width}t${top.height}b${bottom.height}`
            
            let image

            if(options.content.each === null || options.content.each === false) {
                let index = page-1
                if(index >= 0 && this.images.length > index) {
                    image = this.images[index].image
                }
            } else {
                let index = Math.floor(((page-1)*(contents.length)+i) / options.content.each)
                if(index >= 0 && this.images.length > index) {
                    image = this.images[index].image
                }
            }

            if(cache[name] === undefined) {
                let canvas = document.createElement('canvas')
                canvas.width = main.width+left.width+right.width
                canvas.height = main.height+top.height+bottom.height
                let context = canvas.getContext('2d')
                if(image !== undefined) {
                    if(options.content.fit) {
                        image = await image.fit({width: main.width, height: main.height})
                    } else {
                        image = await image.fill({width: main.width, height: main.height})
                    }
                    image.horizontal = image.clone().flipX()  
                    image.vertical = image.clone().flipY()
                    image.all = image.vertical.clone().flipX()


                    let images = {}
                    switch (options.content.bleed.type) {
                        case 'inset' : {
                            context.drawImage(image.getCanvas(),0,0,width, height)
                            break
                        }
                        case 'edge' : {
                            images.main = image.getCanvas()
                            if(left.width>0)images.left = image.crop({width:1}).getCanvas()
                            if(right.width>0)images.right = image.crop({x:image.width-1, width:1}).getCanvas()
                            if(top.height>0) images.top = image.crop({height: 1}).getCanvas()
                            if(bottom.height>0) images.bottom = image.crop({y: image.height-1, height: 1}).getCanvas()
                            if(top.height>0 && left.width>0) images.topleft = image.crop({width: 1, height: 1}).getCanvas()
                            if(top.height>0 && right.width>0) images.topright = image.crop({x: image.width-1, width: 1, height: 1}).getCanvas()
                            if(bottom.height>0 && left.width>0) images.bottomleft = image.crop({y: image.height-1, width: 1, height: 1}).getCanvas()
                            if(bottom.height>0 && right.width>0) images.bottomright = image.crop({x: image.width-1, y: image.height-1, width: 1, height: 1}).getCanvas()
                            break
                        }
                        case 'mirror' : {
                            images.main = image.getCanvas()
                            if(left.width>0) images.left = image.horizontal.crop({x: image.width-(left.width), width: left.width}).getCanvas()
                            if(right.width>0) images.right = image.horizontal.crop({width: right.width}).getCanvas()
                            if(top.height>0) images.top = image.vertical.crop({y: image.height-(top.height), height: top.height}).getCanvas()
                            if(bottom.height>0) images.bottom = image.vertical.crop({height: bottom.height}).getCanvas()
                            if(top.height>0 && left.width>0) images.topleft = image.all.crop({x: image.width-(topleft.width), y: image.height-(topleft.height), width: topleft.width, height: topleft.height}).getCanvas()
                            if(top.height>0 && right.width>0) images.topright = image.all.crop({y: image.height-(topleft.height), width: topright.width, height: topright.height}).getCanvas()
                            if(bottom.height>0 && left.width>0) images.bottomleft = image.all.crop({x: image.width-(bottomleft.width), width: bottomleft.width, height: bottomleft.height}).getCanvas()            
                            if(bottom.height>0 && right.width>0) images.bottomright = image.all.crop({width: bottomright.width, height: bottomright.height}).getCanvas()
                            break
                        }
                    }

                    Object.keys(images).forEach(key => {
                        switch (key) {
                            case "main" : context.drawImage(images[key], left.width, top.height, unscaled.main.width, unscaled.main.height); break;
                            case "left" : context.drawImage(images[key], 0, top.height, unscaled.left.width, unscaled.left.height); break;
                            case "right" : context.drawImage(images[key], left.width+main.width, top.height, unscaled.right.width, unscaled.right.height); break;
                            case "top" : context.drawImage(images[key], left.width, 0, unscaled.top.width, unscaled.top.height); break;
                            case "bottom" : context.drawImage(images[key], left.width, top.height+main.height, unscaled.bottom.width, unscaled.bottom.height); break;
                            case "topleft" : context.drawImage(images[key], 0, 0, unscaled.topleft.width, unscaled.topleft.height); break;
                            case "topright" : context.drawImage(images[key], left.width+main.width, 0, unscaled.topright.width, unscaled.topright.height); break;
                            case "bottomleft" : context.drawImage(images[key], 0, top.height+main.height, unscaled.bottomleft.width, unscaled.bottomleft.height); break;
                            case "bottomright" : context.drawImage(images[key], left.width+main.width, top.height+main.height, unscaled.bottomright.width, unscaled.bottomright.height); break;
                        }
                    })
        
                    cache[name] = canvas
                }
            }
            if(image !== undefined) { context.drawImage(cache[name], topleft.x, topleft.y, width, height) }

            // ----- Add Crop Marks ----- //
            if(options.marks.shown) {
                context.strokeStyle = 'black'
                context.lineWidth = 1
                let marks = options.marks
                function cropMark(start, horizontal) {
                    context.fillStyle = 'white'
                    context.fillRect(start.x,start.y,(horizontal ? marks.length : 2),(!horizontal ? marks.length : 2));
                    context.beginPath();
                    context.moveTo(start.x, start.y);
                    context.lineTo(start.x + (horizontal ? marks.length : 0), start.y + (!horizontal ? marks.length : 0));
                    context.stroke();
                }
                let umain = content.main
                if(umain.x == bounding.lx) {
                    let x = umain.x-marks.offset-marks.length-content.left.width
                    cropMark({x, y: umain.y}, true)
                    cropMark({x, y: umain.y + umain.height}, true)    
                }
                if(umain.x+umain.width == bounding.rx) {
                    let x = umain.x+umain.width+marks.offset+content.right.width
                    cropMark({x, y: umain.y + umain.height}, true)
                    cropMark({x, y: umain.y}, true)    
                }
                if(umain.y == bounding.ly) {
                    let y = umain.y-marks.offset-marks.length-content.top.height
                    cropMark({x: umain.x, y}, false)
                    cropMark({x: umain.x+umain.width, y}, false)
                }
                if(umain.y+umain.height == bounding.ry) {
                    let y = umain.y+umain.height+marks.offset+content.bottom.height
                    cropMark({x: umain.x, y}, false)
                    cropMark({x: umain.x+umain.width, y}, false)
                }
            }
        }

        return canvas
    }
    async generate({contents, options}, dpi, name, notification) {
        let pages = Math.ceil(this.images.length * (options.content.each ? options.content.each : contents.length) / contents.length)

        let parsed = []
        let box = {width: contents[0].main.width/72*dpi, height: contents[0].main.height/72*dpi}
        let max = Math.max(box.width, box.height)
        for(let i = 0; i < this.images.length; i++) {
            let image = this.images[i].image
            let file = this.images[i].file

            let extension
            if(file.destroyed === false) {
                extension = 'pdf'
            } else {
                extension = file.name.split('.').pop().toLowerCase();
            }

            let defaultSupported = ['png','jpeg','jpg','webp','bmp','jfif','xbm','pjp','jxl','pjpeg','avif']   
            notification.setStatus(i / this.images.length) 
            if(extension == 'svg') {
                notification.setMessage(`rasterizing ${file.name}`)
                let text = await readAsText(file)
                var svg = new Blob([text], {
                    type: "image/svg+xml;charset=utf-8"
                })
                let url = URL.createObjectURL(svg);
                let image = await loadImage(url)
                let div = document.createElement('div')
                div.innerHTML = text
                let sbox = div.firstChild.viewBox.baseVal;

                let aspect = sbox.width / sbox.height
                let canvas = document.createElement('canvas')
                let context = canvas.getContext('2d')
                canvas.width = max
                canvas.height = canvas.width / aspect
                context.drawImage(image,0,0,canvas.width,canvas.height)

                parsed.push(await IJS.Image.load(canvas.toDataURL()))
            } else {
                notification.setMessage(`formatting ${file.name}`)
            }
            if(defaultSupported.includes(extension)) {
                parsed.push(await IJS.Image.load(URL.createObjectURL(file)))
            }
            if(extension == 'tiff' || extension == 'tif') {
                let buffer = await readAsArrayBuffer(file)
                let tiff = new Tiff({buffer: buffer})
                parsed.push(await IJS.Image.load(tiff.toCanvas().toDataURL()))
            }
            if(extension == 'heic') {
                let blob = await heic2any({
                    blob: file,
                    toType: "image/png",
                    quality: 1
                })
                parsed.push(await IJS.Image.load(URL.createObjectURL(blob)))   
            }    
            if(extension == 'pdf') {
                let viewport = file.getViewport()
                let aspect = viewport.viewBox[2] / viewport.viewBox[3]
                
                viewport = file.getViewport({ scale:  max / viewport.viewBox[2] })
                let canvas = document.createElement('canvas')
                let context = canvas.getContext('2d')
                canvas.width = max
                canvas.height = canvas.width / aspect

                await file.render({canvasContext: context, viewport: viewport}).promise
                parsed.push(await IJS.Image.load(canvas.toDataURL())) 
            }
        }

        var bounding = {lx: contents[0].main.x, ly: contents[0].main.y, rx: contents[0].main.x, ry: contents[0].main.y}
        for(let i = 0; i < contents.length; i++) {    
            let content = contents[i]
            bounding.lx = Math.min(bounding.lx, content.main.x)
            bounding.ly = Math.min(bounding.ly, content.main.y)
            bounding.rx = Math.max(bounding.rx, content.main.x + content.main.width)
            bounding.ry = Math.max(bounding.ry, content.main.y + content.main.height)
        }

        let docDefinition = {
            pageSize: {
                width: options.page.width,
                height: options.page.height
            },               
            pages: pages, 
            pageMargins: [0, 0, 0, 0],
            compress: false,
            content: [],
        
            images: {
            }
        };
        for(let page = 1; page <= Math.max(1,pages); page++) {
            notification.setMessage(`generating pdf page ${page}/${pages}`)
            notification.setStatus(page/pages) 

            for(let i = 0; i < contents.length; i++) {
                let content = contents[i]
                let unscaled = JSON.parse(JSON.stringify(contents[i]))
                let {main, left, right, bottom, top, topleft, topright, bottomleft, bottomright} = JSON.parse(JSON.stringify(contents[i]))
                let scale = dpi / 72

                main.width *= scale
                main.height *= scale
                left.width = Math.floor(left.width * scale)
                left.height *= scale
                right.width *= scale
                right.height *= scale
                bottom.width *= scale
                bottom.height *= scale
                top.width *= scale
                top.height = Math.floor(top.height * scale)
                topleft.width = Math.floor(topleft.width * scale)
                topleft.height = Math.floor(topleft.height * scale)
                topright.width *= scale
                topright.height = Math.floor(topright.height * scale)
                bottomleft.width = Math.floor(bottomleft.width * scale)
                bottomleft.height *= scale
                bottomright.width *= scale
                bottomright.height *= scale

                let width = main.width+left.width+right.width
                let height = main.height+top.height+bottom.height
                
                let image

                var original
                if(options.content.each === null || options.content.each === false) {
                    original = page-1
                    if(original >= 0 && parsed.length > original) {
                        image = parsed[original]
                    }
                } else {
                    original = Math.floor(((page-1)*(contents.length)+i) / options.content.each)
                    if(original >= 0 && parsed.length > original) {
                        image = parsed[original]
                    }
                }
                if(!image) {
                    image = await IJS.Image.load(emptyImageString)
                    image = image.resize({
                        width: main.width,
                        height: main.height
                    })
                }
                if(options.content.fit) {
                    image = await image.fit({width: main.width, height: main.height})
                } else {
                    image = await image.fill({width: main.width, height: main.height})
                }

                image.horizontal = image.clone().flipX()  
                image.vertical = image.clone().flipY()
                image.all = image.vertical.clone().flipX()

                let images = {}
                switch (options.content.bleed.type) {
                    case 'inset' : {
                        images.main = image.getCanvas()
                        // context.drawImage(image.getCanvas(),0,0,width, height)
                        break
                    }
                    case 'edge' : {
                        images.main = image.getCanvas()
                        if(left.width>0)images.left = image.crop({width:1}).getCanvas()
                        if(right.width>0)images.right = image.crop({x:image.width-1, width:1}).getCanvas()
                        if(top.height>0) images.top = image.crop({height: 1}).getCanvas()
                        if(bottom.height>0) images.bottom = image.crop({y: image.height-1, height: 1}).getCanvas()
                        if(top.height>0 && left.width>0) images.topleft = image.crop({width: 1, height: 1}).getCanvas()
                        if(top.height>0 && right.width>0) images.topright = image.crop({x: image.width-1, width: 1, height: 1}).getCanvas()
                        if(bottom.height>0 && left.width>0) images.bottomleft = image.crop({y: image.height-1, width: 1, height: 1}).getCanvas()
                        if(bottom.height>0 && right.width>0) images.bottomright = image.crop({x: image.width-1, y: image.height-1, width: 1, height: 1}).getCanvas()
                        break
                    }
                    case 'mirror' : {
                        images.main = image.getCanvas()
                        if(left.width>0) images.left = image.horizontal.crop({x: image.width-(left.width), width: left.width}).getCanvas()
                        if(right.width>0) images.right = image.horizontal.crop({width: right.width}).getCanvas()
                        if(top.height>0) images.top = image.vertical.crop({y: image.height-(top.height), height: top.height}).getCanvas()
                        if(bottom.height>0) images.bottom = image.vertical.crop({height: bottom.height}).getCanvas()
                        if(top.height>0 && left.width>0) images.topleft = image.all.crop({x: image.width-(topleft.width), y: image.height-(topleft.height), width: topleft.width, height: topleft.height}).getCanvas()
                        if(top.height>0 && right.width>0) images.topright = image.all.crop({y: image.height-(topleft.height), width: topright.width, height: topright.height}).getCanvas()
                        if(bottom.height>0 && left.width>0) images.bottomleft = image.all.crop({x: image.width-(bottomleft.width), width: bottomleft.width, height: bottomleft.height}).getCanvas()            
                        if(bottom.height>0 && right.width>0) images.bottomright = image.all.crop({width: bottomright.width, height: bottomright.height}).getCanvas()
                        break
                    }
                }

                function cropMark(start, horizontal, pageBreak) {
                    docDefinition.content.push({
                        canvas: [
                            {
                                type: 'line',
                                x1: start.x,
                                y1: start.y,
                                x2: start.x + (horizontal ? options.marks.length : 0),
                                y2: start.y + (!horizontal ? options.marks.length : 0),
                                lineColor: 'white',
                                lineWidth: 2
                            }
                        ],
                        absolutePosition: {x: 0, y: 0}
                    })
                    let node = {
                        canvas: [
                            {
                                type: 'line',
                                x1: start.x,
                                y1: start.y,
                                x2: start.x + (horizontal ? options.marks.length : 0),
                                y2: start.y + (!horizontal ? options.marks.length : 0),
                                lineColor: 'black',
                                lineWidth: 1
                            }
                        ],
                        absolutePosition: {x: 0, y: 0}
                    }
                    if(pageBreak) {
                        node.pageBreak = 'after'
                    }
                    docDefinition.content.push(node)
                }

                function drawMarks(){
                    if(options.marks.shown) {
                        let marks = options.marks
                        let lx = content.main.x-marks.offset-marks.length-content.left.width
                        let rx = content.main.x+content.main.width+marks.offset+content.right.width
                        let ty = content.main.y-marks.offset-marks.length-content.top.height
                        let by = content.main.y+content.main.height+marks.offset+content.bottom.height

                        if(content.main.y+content.main.height==bounding.ry) {
                            cropMark({x: content.main.x, y: by}, false, false)
                            cropMark({x: content.main.x+content.main.width, y: by}, false, false)    
                        }
                        if(content.main.y == bounding.ly ) {
                            cropMark({x: content.main.x, y: ty}, false, false)
                            cropMark({x: content.main.x+content.main.width, y: ty}, false, false)    
                        }
                        if(content.main.x+content.main.width==bounding.rx) {
                            cropMark({x: rx, y: content.main.y}, true, false)
                            cropMark({x: rx, y: content.main.y+content.main.height}, true, false)    
                        }
                        if(content.main.x == bounding.lx) {
                            cropMark({x: lx, y: content.main.y}, true, false)
                            cropMark({x: lx, y: content.main.y+content.main.height}, true, i == contents.length-1 && page != pages && pages > 1)
                        }
                    }
                }

                Object.keys(images).forEach(key => {
                    if(key == "main") {
                        if(!docDefinition.images[`mt${original}`]) {
                            docDefinition.images[`mt${original}`] = images[key].toDataURL()
                        }
                        if(options.content.bleed.type == 'inset') {
                            docDefinition.content.push({
                                image: `mt${original}`,
                                width: content.main.width+content.left.width+content.right.width,
                                height: content.main.height+content.top.height+content.bottom.height,
                                absolutePosition: { x: topleft.x, y: topleft.y}
                            })
    
                            drawMarks()
                        } else {
                            docDefinition.content.push({
                                image: `mt${original}`,
                                width: content.main.width,
                                height: content.main.height,
                                absolutePosition: { x: main.x, y: main.y}
                            })    
                        }
                    }
                    if(key == "right") {
                        if(!docDefinition.images[`r${right.width}t${original}`]) {
                            docDefinition.images[`r${right.width}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `r${right.width}t${original}`,
                            width: content.right.width,
                            height: content.right.height,
                            absolutePosition: { x: right.x, y: right.y}
                        })
                    }
                    if(key == "top") {
                        if(!docDefinition.images[`t${top.height}t${original}`]) {
                            docDefinition.images[`t${top.height}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `t${top.height}t${original}`,
                            width: content.top.width,
                            height: content.top.height,
                            absolutePosition: { x: top.x, y: top.y}
                        })
                    }
                    if(key == "left") {
                        if(!docDefinition.images[`l${left.width}t${original}`]) {
                            docDefinition.images[`l${left.width}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `l${left.width}t${original}`,
                            width: content.left.width,
                            height: content.left.height,
                            absolutePosition: { x: left.x, y: left.y}
                        })
                    }
                    if(key == "bottom") {
                        if(!docDefinition.images[`b${bottom.height}t${original}`]) {
                            docDefinition.images[`b${bottom.height}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `b${bottom.height}t${original}`,
                            width: content.bottom.width,
                            height: content.bottom.height,
                            absolutePosition: { x: bottom.x, y: bottom.y}
                        })
                    }
                    if(key == "topleft") {
                        if(!docDefinition.images[`tl${topleft.height}t${original}`]) {
                            docDefinition.images[`tl${topleft.height}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `tl${topleft.height}t${original}`,
                            width: content.topleft.width,
                            height: content.topleft.height,
                            absolutePosition: { x: topleft.x, y: topleft.y}
                        })
                    }
                    if(key == "topright") {
                        if(!docDefinition.images[`tr${topright.height}t${original}`]) {
                            docDefinition.images[`tr${topright.height}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `tr${topright.height}t${original}`,
                            width: content.topright.width,
                            height: content.topright.height,
                            absolutePosition: { x: topright.x, y: topright.y}
                        })
                    }
                    if(key == "bottomleft") {
                        if(!docDefinition.images[`bl${bottomleft.height}t${original}`]) {
                            docDefinition.images[`bl${bottomleft.height}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `bl${bottomleft.height}t${original}`,
                            width: content.bottomleft.width,
                            height: content.bottomleft.height,
                            absolutePosition: { x: bottomleft.x, y: bottomleft.y}
                        })
                    }
                    if(key == "bottomright") {
                        if(!docDefinition.images[`br${bottomright.height}t${original}`]) {
                            docDefinition.images[`br${bottomright.height}t${original}`] = images[key].toDataURL()
                        }
                        docDefinition.content.push({
                            image: `br${bottomright.height}t${original}`,
                            width: content.bottomright.width,
                            height: content.bottomright.height,
                            absolutePosition: { x: content.bottomright.x, y: content.bottomright.y}
                        })
                        drawMarks()
                    }
                })
            }
        }

        notification.setMessage('Creating Download')
        notification.setStatus(1)
        print(name)
        await pdfMake.createPdf(docDefinition).download(name + '.pdf');
    }
}