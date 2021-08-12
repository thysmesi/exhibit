async function format({margin, width, height, page, fill, spacing, bleed, originals, dpi, marks, numberOfEach}){
    let images = await loadImages(originals)

    margin = margin*72
    width = width*72
    height = height*72
    page.width = page.width*72
    page.height = page.height*72
    spacing = spacing*72
    bleed.value = bleed.value*72

    const cropmark = {
        length: .125 * 72,
        width: 1,
        offset: .0675 * 72
    }

    let bleed2 = bleed.value*2
    let margin2 = margin*2
    let marginBox = {
        width: page.width - margin2,
        height: page.height - margin2
    }
    let {using, boxes} = pack({
        width: width,
        height: height},
        {
        width: marginBox.width,
        height: marginBox.height},
        {
        spacing: spacing,
        offset: margin
    })

    let pages = []
    let processed = []
    for(let t = 0 ; t < images.length; t++){
        let image = images[t]
        if(t >= pages.length){
            pages.push([])
        }
        let usingDpi, compressed
        if(bleed.type != 'inset') {
            usingDpi = Math.min(Math.min(image.width, image.height) / (Math.max(width, height) / 72), dpi)
            if(fill === "cover") compressed = await cover(image.src, {width:boxes[t % boxes.length].width / 72 * usingDpi,height:boxes[t % boxes.length].height / 72 * usingDpi})
            else compressed = await fit(image.src, {width:boxes[t % boxes.length].width / 72 * usingDpi,height:boxes[t % boxes.length].height / 72 * usingDpi})
        } else {
            usingDpi = Math.min(Math.min(image.width, image.height) / (Math.max(width + bleed2, height + bleed2) / 72), dpi)
            compressed = await cover(image.src, {width:(boxes[t % boxes.length].width + bleed2) / 72 * usingDpi,height:(boxes[t % boxes.length].height + bleed2) / 72 * usingDpi})
        }
        pages[pages.length-1].push(compressed)
        processed.push(compressed)
    }

    let outputImages = {}
    for(let t = 0, total = 0, page = 0; t < processed.length; t++){
        for(let i = 0; i < (numberOfEach===false?boxes.length:numberOfEach); i++, total++){
            let page = Math.floor(total / boxes.length)
            let box = boxes[total % boxes.length]
            if(!pages[page]) pages[page] = []
            let offset = {
                x: box.x + ((marginBox.width - using.width) / 2),
                y: box.y + ((marginBox.height - using.height) / 2)
            }
            if(!outputImages[`content${t}`]) {
                outputImages[`content${t}`] = processed[t]
            }
            if(bleed.type != 'inset') {
                pages[page].push({
                    ...box,
                    x: offset.x,
                    y: offset.y,
                    data: `content${t}`,
                    type: "content"
                })
            } else {
                pages[page].push({
                    width: box.width + bleed2,
                    height: box.height + bleed2,
                    x: offset.x - bleed.value,
                    y: offset.y - bleed.value,
                    data: `content${t}`,
                    type: "content"
                })
            }

            let insideBleed = Math.min(spacing/2, bleed.value)

            let bleeds = {}
            let left = box.x - margin == 0
            let top = box.y - margin == 0
            let right = box.x + box.width - margin == using.width
            let bottom = box.y + box.height == using.height + margin
            bleeds.left = left ? bleed.value : insideBleed
            bleeds.top = top ? bleed.value : insideBleed
            bleeds.right = right ? bleed.value : insideBleed
            bleeds.bottom = bottom ? bleed.value : insideBleed

            if(bleed.value > 0 && bleed.type != 'inset'){
                let keys = ['top','left','right','bottom','topleft', 'topright', 'bottomleft', 'bottomright']
                for(let k = 0; k < keys.length; k++){
                    let key = keys[k]
                    let leftright = key.includes('left') || key.includes('right')
                    let topbottom = key.includes('top') || key.includes('bottom')
                    let x = offset.x + (topbottom ? 0 : key.includes('left')? -bleeds[key]:box.width)
                    let y = offset.y + (leftright ? 0 : key.includes('top')? -bleeds[key]:box.height)
                    let width = key.includes('left') ? bleeds['left'] : key.includes('right') ? bleeds['right'] : box.width
                    let height = key.includes('top') ? bleeds['top'] : key.includes('bottom') ? bleeds['bottom'] : box.height
                    if(key=='topleft') {x -= bleeds['left']; y -= bleeds['top']}
                    if(key=='bottomleft') {x -= bleeds['left']; y += box.height}
                    if(key=='topright') {x += box.width; y-=bleeds['top']}
                    if(key=='bottomright') {x += box.width; y += box.height}

                    let label = `${t}${key}${width}${height}`
                    if(!outputImages[label]) {
                        if(bleed.type === "edge") outputImages[label] = await edgeBleed(outputImages[`content${t}`], {width, height}, key)
                        if(bleed.type === "mirror") outputImages[label] = await mirrorBleed(outputImages[`content${t}`], {width, height}, key)
                    }

                    pages[page].push({
                        x,
                        y,
                        width,
                        height,
                        data: label,
                        type: key
                    })
                }
            }
            if(marks){
                if(left) {
                    pages[page].push({
                        x: offset.x - bleeds.left - cropmark.offset - cropmark.length,
                        y: offset.y,
                        width: cropmark.length,
                        height: cropmark.width,
                        data: null,
                        type: "mark"
                    })
                    pages[page].push({
                        x: offset.x - bleeds.left - cropmark.offset - cropmark.length,
                        y: offset.y + box.height,
                        width: cropmark.length,
                        height: cropmark.width,
                        data: null,
                        type: "mark"
                    })
                }
                if(top) {
                    pages[page].push({
                        x: offset.x,
                        y: offset.y - bleeds.top - cropmark.offset - cropmark.length,
                        width: cropmark.width,
                        height: cropmark.length,
                        data: null,
                        type: "mark"
                    })
                    pages[page].push({
                        x: offset.x + box.width,
                        y: offset.y - bleeds.top - cropmark.offset - cropmark.length,
                        width: cropmark.width,
                        height: cropmark.length,
                        data: null,
                        type: "mark"
                    })
                }
                if(right) {
                    pages[page].push({
                        x: offset.x + box.width + bleeds.right + cropmark.offset,
                        y: offset.y,
                        width: cropmark.length,
                        height: cropmark.width,
                        data: null,
                        type: "mark"
                    })
                    pages[page].push({
                        x: offset.x + box.width + bleeds.right + cropmark.offset,
                        y: offset.y + box.height,
                        width: cropmark.length,
                        height: cropmark.width,
                        data: null,
                        type: "mark"
                    })
                }
                if(bottom) {
                    pages[page].push({
                        x: offset.x,
                        y: offset.y + box.height + bleeds.bottom + cropmark.offset,
                        width: cropmark.width,
                        height: cropmark.length,
                        data: null,
                        type: "mark"
                    })
                    pages[page].push({
                        x: offset.x + box.width,
                        y: offset.y + box.height + bleeds.bottom + cropmark.offset,
                        width: cropmark.width,
                        height: cropmark.length,
                        data: null,
                        type: "mark"
                    })
                }
            }
        }
    }
    return {output: pages, images: outputImages}
}

async function loadImages(datas) {
    return new Promise(resolve => {
        let result = [],
        count  = datas.length,
        onload = function() { if (--count == 0) resolve(result); };
        
        for(let i = 0 ; i < datas.length ; i++) {
            let data = datas[i];
            result[i] = document.createElement('img');
            result[i].addEventListener('load', onload);
            result[i].src = data;
        }  
    })
}
function pack(box, container, options = {}){
    let spacing = options.spacing || 0
    let offset = options.offset || 0
    let landscape = {
        width: Math.max(box.width, box.height),
        height: Math.min(box.width, box.height)
    }
    let portrait = {
        width: Math.min(box.width, box.height),
        height: Math.max(box.width, box.height)
    }

    let floord = (bottom, numerator)=>{
        let amount = 0
        let left = bottom
        while(left >= numerator){
            amount++
            left -= numerator + spacing
        }
        return amount
    }

    let boxes = []
    let using = {x: container.width, y: container.height, width: 0, height: 0}
    let landscapeRows = floord(container.height, landscape.height)
    let landscapeColumns = floord(container.width, landscape.width)
    let portraitRows = floord(container.height, portrait.height)
    let portraitColumns = floord(container.width, portrait.width)
    let numIfLandscape =  landscapeRows * landscapeColumns
    let numIfPortrait =  portraitRows * portraitColumns

    if(numIfLandscape > numIfPortrait){
        for(let y = 0; y<landscapeRows;y++){
            for(let x = 0; x<landscapeColumns; x++){
                let box = {x:(landscape.width*x) + (spacing*x) + offset,y:(landscape.height*y) + (spacing*y) + offset,...landscape}
                box.orientation = box.width > box.height ? 'landscape' : 'portrait'
                boxes.push(box)
                if(box.x < using.x) using.x = box.x
                if(box.y < using.y) using.y = box.y
                if(box.x + box.width > using.width) using.width = box.x + box.width - offset
                if(box.y + box.height > using.height) using.height = box.y + box.height - offset
            }
        }
    } else {
        for(let y = 0; y<portraitRows;y++){
            for(let x = 0; x<portraitColumns; x++){
                let box = {x:(portrait.width*x) + (spacing*x) + offset,y:(portrait.height*y) + (spacing*y) + offset,...portrait}
                box.orientation = box.width > box.height ? 'landscape' : 'portrait'
                boxes.push(box)
                if(box.x < using.x) using.x = box.x
                if(box.y < using.y) using.y = box.y
                if(box.x + box.width > using.width) using.width = box.x + box.width - offset
                if(box.y + box.height > using.height) using.height = box.y + box.height - offset
            }
        }
    }

    return {using, boxes}
}
async function mirrorBleed(data, box, position){
    let canvas = document.createElement('canvas')
    canvas.width = box.width
    canvas.height = box.height
    let context = canvas.getContext('2d')
    return new Promise((resolve, reject)=>{
        let image = new Image()
        image.onload = ()=>{
            let scale = Math.min(image.height, image.width) / 72
            let scaledHeight, scaledWidth
            if(scale >1) {
                scaledHeight = box.height / scale
                scaledWidth = box.width / scale    
            } else {
                scaledHeight = box.height * scale
                scaledWidth = box.width * scale    
            }
            context.save()
            switch(position){
                case('top'):{
                    context.scale(1,-1)
                    context.drawImage(image,0,0,image.width,scaledHeight,0, 0,canvas.width,-canvas.height)
                    break;
                }
                case('left'):{
                    context.scale(-1,1)
                    context.drawImage(image,0,0,scaledWidth,image.height,0, 0,-canvas.width,canvas.height)
                    break;
                }
                case('bottom'):{
                    context.scale(1,-1)
                    context.drawImage(image,0,image.height-scaledHeight,image.width,scaledHeight,0,0,canvas.width,-canvas.height)
                }
                case('right'):{
                    context.scale(-1,1)
                    context.drawImage(image,image.width-scaledWidth,0,scaledWidth,image.height,0, 0,-canvas.width,canvas.height)
                    break;
                }
                case('topleft'):{
                    context.scale(-1,-1)
                    context.drawImage(image,0,0,scaledWidth,scaledHeight,0, 0,-canvas.width,-canvas.height)
                    break;
                }
                case('topright'):{
                    context.scale(-1,-1)
                    context.drawImage(image,image.width - scaledWidth,0,scaledWidth,scaledHeight,0, 0,-canvas.width,-canvas.height)
                    break;
                }
                case('bottomleft'):{
                    context.scale(-1,-1)
                    context.drawImage(image,0,image.height-scaledHeight,scaledWidth,scaledHeight,0, 0,-canvas.width,-canvas.height)
                    break;
                }
                case('bottomright'):{
                    context.scale(-1,-1)
                    context.drawImage(image,image.width - scaledWidth,image.height-scaledHeight,scaledWidth,scaledHeight,0, 0,-canvas.width,-canvas.height)
                    break;
                }
            }
            context.restore()
            resolve(canvas.toDataURL())
        }
        image.src = data
    })
}
async function edgeBleed(data, box, position, smoothing = 2){
    let canvas = document.createElement('canvas')
    canvas.width = box.width
    canvas.height = box.height
    let context = canvas.getContext('2d')
    return new Promise((resolve, reject)=>{
        let image = new Image()
        image.onload = ()=>{
            let scale = Math.min(image.height, image.width) / 72
            context.save()
            switch(position){
                case('top'):{
                    context.scale(1,-1)
                    context.drawImage(image,0,0,image.width,smoothing,0, 0,canvas.width,-canvas.height)
                    break;
                }
                case('left'):{
                    context.scale(-1,1)
                    context.drawImage(image,0,0,smoothing,image.height,0, 0,-canvas.width,canvas.height)
                    break;
                }
                case('bottom'):{
                    context.scale(1,-1)
                    context.drawImage(image,0,image.height-smoothing,image.width,smoothing,0,0,canvas.width,-canvas.height)
                }
                case('right'):{
                    context.scale(-1,1)
                    context.drawImage(image,image.width-smoothing,0,smoothing,image.height,0, 0,-canvas.width,canvas.height)
                    break;
                }
                case('topleft'):{
                    context.scale(-1,-1)
                    context.drawImage(image,0,0,smoothing,smoothing,0, 0,-canvas.width,-canvas.height)
                    break;
                }
                case('topright'):{
                    context.scale(-1,-1)
                    context.drawImage(image,image.width - smoothing,0,smoothing,smoothing,0, 0,-canvas.width,-canvas.height)
                    break;
                }
                case('bottomleft'):{
                    context.scale(-1,-1)
                    context.drawImage(image,0,image.height-smoothing,smoothing,smoothing,0, 0,-canvas.width,-canvas.height)
                    break;
                }
                case('bottomright'):{
                    context.scale(-1,-1)
                    context.drawImage(image,image.width - smoothing,image.height-smoothing,smoothing,smoothing,0, 0,-canvas.width,-canvas.height)
                    break;
                }
            }

            context.restore()
            resolve(canvas.toDataURL())
        }
        image.src = data
    })
}
async function cover(data, output = {}){
    output.normalAspectRatio = Math.max(output.width, output.height) / Math.min(output.width,output.height)
    output.aspectRatio = output.width / output.height
    let wd2 = output.width/2
    let hd2 = output.height/2

    var promise = new Promise((resolve)=>{
        var image = new Image(); 
        image.onload = function(){
            image.normalAspectRatio = Math.max(image.width, image.height) / Math.min(image.width,image.height)
            image.aspectRatio = image.width / image.height
    
            let canvas = document.createElement('canvas')
            canvas.width = output.width
            canvas.height = output.height
            let context = canvas.getContext('2d')
            let crop = {}
    
            if(output.normalAspectRatio < image.normalAspectRatio && image.width > image.height){
                crop.x = (image.width - (image.height * output.normalAspectRatio)) / 2
                crop.y = 0
                crop.width = image.height * output.normalAspectRatio
                crop.height = image.height
            }
            if(output.normalAspectRatio < image.normalAspectRatio && image.width < image.height) {
                crop.x = 0
                crop.y = (image.height - (image.width * output.normalAspectRatio)) / 2
                crop.width = image.width
                crop.height = image.width * output.normalAspectRatio
            }
            if(output.normalAspectRatio > image.normalAspectRatio && image.width > image.height) {
                crop.x = 0
                crop.y = (image.height - (image.width / output.normalAspectRatio)) / 2
                crop.width = image.width
                crop.height = image.width / output.normalAspectRatio
            }
            if(output.normalAspectRatio > image.normalAspectRatio && image.width < image.height) {
                crop.x = (image.width - (image.height / output.normalAspectRatio)) / 2
                crop.y = 0
                crop.width = image.height / output.normalAspectRatio
            crop.height = image.height
            }
            
            if(image.aspectRatio >= 1 && output.aspectRatio >= 1 || image.aspectRatio <= 1 && output.aspectRatio <= 1){
                context.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height)
            } else {
                context.translate(wd2,hd2)
                context.rotate(Math.PI / 2)
                context.drawImage(image,crop.x,crop.y,crop.width,crop.height,-hd2,-wd2,canvas.height,canvas.width)
            }
            resolve(canvas.toDataURL())
        }
        image.src = data; 
    })
    return promise
}
async function fit(data, output = {}){
    output.normalAspectRatio = Math.max(output.width, output.height) / Math.min(output.width,output.height)
    output.aspectRatio = output.width / output.height

    var promise = new Promise((resolve)=>{
        var image = new Image(); 
        image.onload = function(){
            image.normalAspectRatio = Math.max(image.width, image.height) / Math.min(image.width,image.height)
            image.aspectRatio = image.width / image.height

            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d')

            canvas.width = output.width
            canvas.height = output.height
        
            if(image.aspectRatio >= 1 && output.aspectRatio >= 1 || image.aspectRatio <= 1 && output.aspectRatio <= 1){   
                var hRatio = output.width / image.width
                var vRatio = output.height / image.height    
                var ratio  = Math.min ( hRatio, vRatio)

                let vOffset = (output.width - (image.width*ratio))/ 2
                let hOffset = (output.height - (image.height*ratio))/ 2
 
                canvas.width = image.width*ratio
                canvas.height = image.height*ratio
                console.log(canvas.width, canvas.height)
                console.log(image.width*ratio, image.height*ratio)

                context.drawImage(image, 0+vOffset/2 ,0+hOffset/2,image.width*ratio - vOffset, image.height*ratio - hOffset)
            } else {
                var hRatio = output.width / image.height
                var vRatio = output.height / image.width    
                var ratio  = Math.min ( hRatio, vRatio)

                let vOffset = (output.width - (image.height*ratio))/ 2
                let hOffset = (output.height - (image.width*ratio))/ 2

                let wd2 = canvas.width/2
                let hd2 = canvas.height/2
                context.translate(wd2,hd2)
                context.rotate(Math.PI / 2)
                context.drawImage(image, -hd2 + hOffset,-wd2 + vOffset, image.width*ratio, image.height*ratio)
            }
            resolve(canvas.toDataURL())
        }
        image.src = data;
    })
    return promise
}
let options = {
    page: {
        width: 8.5,
        height: 11
    },
    fill: 'cover',
    width: 8.5,
    height: 5.5,
    bleed: {
        value: .125,
        type: 'mirror'
    },
    marks: true,
    margin: 0,
    spacing: 0,
    pack: 'linear',
    dpi: 50,
    originals: [sampleImage1, sampleImage2],
    numberOfEach: 1
}
format(options).then(({output, images})=>{
    let canvas = document.getElementById('tester')
    canvas.width = options.page.width
    canvas.height = options.page.height
    let ctx = canvas.getContext('2d')
    
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    let page = output[0]
    // output.forEach(page => {
        page.forEach(item => {
            if(item.type == 'content') ctx.fillStyle = 'grey'
            if(item.type == 'left') ctx.fillStyle = "red"
            if(item.type == 'top') ctx.fillStyle = 'blue'
            if(item.type == 'bottom') ctx.fillStyle = 'green'
            if(item.type == 'right') ctx.fillStyle = 'purple'
            if(item.type == 'topleft') ctx.fillStyle = 'orange'
            if(item.type == 'topright') ctx.fillStyle = 'black'
            if(item.type == 'bottomleft') ctx.fillStyle = 'pink'
            if(item.type == 'bottomright') ctx.fillStyle = 'brown'
            if(item.type == 'mark') ctx.fillStyle = 'black'
            if(item.data != null){
                let image = new Image()
                image.onload = ()=>ctx.drawImage(image, item.x, item.y, item.width, item.height)
            image.src = images[item.data]
            } else {
                ctx.fillRect(item.x,item.y,item.width,item.height)
            }  
        })
    // });
})