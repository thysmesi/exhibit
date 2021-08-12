let canvas = document.getElementsByTagName('canvas')[0]
canvas.width = d72(8.5)
canvas.height = d72(11)
let context = canvas.getContext('2d')

context.fillStyle = 'white'
context.fillRect(0,0,canvas.width,canvas.height)

let boxes = pack({width: d72(4), height: d72(5.25)}, {width:canvas.width - d72(.5), height:canvas.height - d72(.5)}, {spacing:d72(0), offset: d72(.25)})

context.fillStyle = 'red'
boxes.forEach(box=>{
    context.fillRect(box.x, box.y, box.width, box.height)
    context.strokeRect(box.x, box.y, box.width, box.height)
})

function d72(x){return x*72}
async function fitImageToSize(data, output = {}){
    output.normalAspectRatio = Math.max(output.width, output.height) / Math.min(output.width,output.height)
    output.aspectRatio = output.width / output.height

    var promise = new Promise((resolve)=>{
        var image = new Image(); 
        image.onload = function(){
            image.normalAspectRatio = Math.max(image.width, image.height) / Math.min(image.width,image.height)
            image.aspectRatio = image.width / image.height

            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d')

            if(image.aspectRatio >= 1 && output.aspectRatio >= 1 || image.aspectRatio <= 1 && output.aspectRatio <= 1){   
                var hRatio = output.width / image.width
                var vRatio = output.height / image.height    
                var ratio  = Math.min ( hRatio, vRatio)
 
                canvas.width = image.width*ratio
                canvas.height = image.height*ratio
                context.drawImage(image, 0,0, image.width, image.height, 0,0,canvas.width, canvas.height)
            } else {
                var hRatio = output.width / image.height
                var vRatio = output.height / image.width    
                var ratio  = Math.min ( hRatio, vRatio)

                canvas.height = image.width*ratio
                canvas.width = image.height*ratio

                let wd2 = canvas.width/2
                let hd2 = canvas.height/2
            
                context.translate(wd2,hd2)
                context.rotate(Math.PI / 2)
                context.drawImage(image, 0,0, image.width, image.height,-hd2,-wd2, canvas.height, canvas.width)
            }
            resolve(canvas.toDataURL())
        }
        image.src = data;
    })
    return promise
}
async function coverImageToSize(data, output = {}){
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
function format(images, options={}){

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
    let landscapeRows = floord(container.height, landscape.height)
    let landscapeColumns = floord(container.width, landscape.width)
    let portraitRows = floord(container.height, portrait.height)
    let portraitColumns = floord(container.width, portrait.width)
    let numIfLandscape =  landscapeRows * landscapeColumns
    let numIfPortrait =  portraitRows * portraitColumns

    console.log(numIfLandscape)
    if(numIfLandscape > numIfPortrait){
        for(let y = 0; y<landscapeRows;y++){
            for(let x = 0; x<landscapeColumns; x++){
                boxes.push({x:(landscape.width*x) + (spacing*x) + offset,y:(landscape.height*y) + (spacing*y) + offset,...landscape})
            }
        }
    } else {
        for(let y = 0; y<portraitRows;y++){
            for(let x = 0; x<portraitColumns; x++){
                boxes.push({x:(portrait.width*x) + (spacing*x) + offset,y:(portrait.height*y) + (spacing*y) + offset,...portrait})
            }
        }
    }

    return boxes
}