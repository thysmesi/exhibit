function format({margin, width, height, page, spacing, bleed, dpi}){
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
    let output = []

    let margin2 = margin*2
    let bleed2 = bleed.value*2
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
    boxes.forEach(box=>{
        let offset = {
            x: box.x + ((marginBox.width - using.width) / 2),
            y: box.y + ((marginBox.height - using.height) / 2)
        }
        output.push({
            ...box,
            x: offset.x,
            y: offset.y,
            data: null,
            type: "content"
        })
        if(bleed.value !== 0){
            let insideBleed = Math.min(spacing/2, bleed.value)

            let left = box.x - margin == 0
            let top = box.y - margin == 0
            let right = box.x + box.width - margin == using.width
            let bottom = box.y + box.height == using.height + margin
            let leftBleed = left ? bleed.value : insideBleed
            let topBleed = top ? bleed.value : insideBleed
            let rightBleed = right ? bleed.value : insideBleed
            let bottomBleed = bottom ? bleed.value : insideBleed
            output.push({
                x: offset.x - leftBleed,
                y: offset.y,
                width: leftBleed,
                height: box.height,
                data: null,
                type: "left"
            })
            output.push({
                x: offset.x + box.width,
                y: offset.y,
                width: rightBleed,
                height: box.height,
                data: null,
                type: "right"
            })
            output.push({
                x: offset.x,
                y: offset.y - topBleed,
                width: box.width,
                height: topBleed,
                data: null,
                type: "top"
            })
            output.push({
                x: offset.x,
                y: offset.y + box.height,
                width: box.width,
                height: bottomBleed,
                data: null,
                type: "bottom"
            })
            output.push({
                x: offset.x - leftBleed,
                y: offset.y - topBleed,
                width: leftBleed,
                height: topBleed,
                data: null,
                type: "topleft"
            })
            output.push({
                x: offset.x + box.width,
                y: offset.y - topBleed,
                width: rightBleed,
                height: topBleed,
                data: null,
                type: "topright"
            })
            output.push({
                x: offset.x - leftBleed,
                y: offset.y + box.height,
                width: leftBleed,
                height: bottomBleed,
                data: null,
                type: "bottomleft"
            })
            output.push({
                x: offset.x + box.width,
                y: offset.y + box.height,
                width: rightBleed,
                height: bottomBleed,
                data: null,
                type: "bottomright"
            })

            if(left) {
                output.push({
                    x: offset.x - leftBleed - cropmark.offset - cropmark.length,
                    y: offset.y,
                    width: cropmark.length,
                    height: cropmark.width,
                    data: null,
                    type: "mark"
                })
                output.push({
                    x: offset.x - leftBleed - cropmark.offset - cropmark.length,
                    y: offset.y + box.height,
                    width: cropmark.length,
                    height: cropmark.width,
                    data: null,
                    type: "mark"
                })
            }
            if(top) {
                output.push({
                    x: offset.x,
                    y: offset.y - topBleed - cropmark.offset - cropmark.length,
                    width: cropmark.width,
                    height: cropmark.length,
                    data: null,
                    type: "mark"
                })
                output.push({
                    x: offset.x + box.width,
                    y: offset.y - topBleed - cropmark.offset - cropmark.length,
                    width: cropmark.width,
                    height: cropmark.length,
                    data: null,
                    type: "mark"
                })
            }
            if(right) {
                output.push({
                    x: offset.x + box.width + rightBleed + cropmark.offset,
                    y: offset.y,
                    width: cropmark.length,
                    height: cropmark.width,
                    data: null,
                    type: "mark"
                })
                output.push({
                    x: offset.x + box.width + rightBleed + cropmark.offset,
                    y: offset.y + box.height,
                    width: cropmark.length,
                    height: cropmark.width,
                    data: null,
                    type: "mark"
                })
            }
            if(bottom) {
                output.push({
                    x: offset.x,
                    y: offset.y + box.height + bottomBleed + cropmark.offset,
                    width: cropmark.width,
                    height: cropmark.length,
                    data: null,
                    type: "mark"
                })
                output.push({
                    x: offset.x + box.width,
                    y: offset.y + box.height + bottomBleed + cropmark.offset,
                    width: cropmark.width,
                    height: cropmark.length,
                    data: null,
                    type: "mark"
                })
            }
        }    
    })

    return output
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

let options = {
    page: {
        width: 8.5,
        height: 11
    },
    fill: 'cover',
    width: 1,
    height: 1.5,
    bleed: {
        value: .125,
        type: 'inset'
    },
    marks: true,
    margin: 0.5,
    spacing: .5,
    pack: 'linear',
    dpi: 300,
    originals: [sampleImage1, sampleImage2]
}

let output = format(options)
let canvas = document.getElementById('tester')
canvas.width = options.page.width
canvas.height = options.page.height
let ctx = canvas.getContext('2d')

ctx.fillStyle = 'white'
ctx.fillRect(0,0,canvas.width,canvas.height)

output.forEach(box => {
    if(box.type == 'content') ctx.fillStyle = 'grey'
    if(box.type == 'left') ctx.fillStyle = "red"
    if(box.type == 'top') ctx.fillStyle = 'blue'
    if(box.type == 'bottom') ctx.fillStyle = 'green'
    if(box.type == 'right') ctx.fillStyle = 'purple'
    if(box.type == 'topleft') ctx.fillStyle = 'orange'
    if(box.type == 'topright') ctx.fillStyle = 'black'
    if(box.type == 'bottomleft') ctx.fillStyle = 'pink'
    if(box.type == 'bottomright') ctx.fillStyle = 'brown'
    if(box.type == 'mark') ctx.fillStyle = 'black'
    ctx.fillRect(box.x,box.y,box.width,box.height)
});
