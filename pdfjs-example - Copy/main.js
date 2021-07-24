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
function rotateImage(data, degrees){
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext("2d");
    canvas.width = 1000

    let promise = new Promise((resolve,reject)=>{
        var image = new Image(); 
        image.src = data;
        image.onload = function() {
            canvas.width = image.width
            canvas.height = image.height
            // ctx.translate(image.width, image.height);
            // ctx.rotate(degrees * Math.PI / 180);
            ctx.fillRect(0,0,100,100)
            ctx.drawImage(image, 0, 0); 
            resolve(canvas.toDataURL())
        }
    })
    return promise
}
function fitImageToSize(image, size){
    let canvas = document.createElement("canvas")
    let context = canvas.getContext('2d')
}
function coverImageToSize(data, output){
    output = {
        width: 200,
        height: 600,
        aspectRatio: 200 / 600
    }

    var image = new Image(); 

    image.onload = function(){
        image.aspectRatio = image.width / image.height
        
        // if(image.width > image.height){
        //     let width = output.width
        //     // output.width = Math.max(output.width, output.height)
        //     // output.height = Math.min(width, output.height)
        // } else {
        //     let width = output.width
        //     // output.width = Math.min(output.width, output.height)
        //     // output.height = Math.max(width, output.height)
        // }
    
        console.log({width:image.width,height:image.height})
        console.log(output)

        let canvas = document.createElement('canvas')
        canvas.width = output.width
        canvas.height = output.height
        let context = canvas.getContext('2d')
        if(image.aspectRatio >= 1 && output.aspectRatio >= 1){
            console.log('same')
        } else {
            let width = image.width
            image.width = image.height
            image.height = width
            let scale = image.width / output.width
            let offset = (output.height - (image.height / scale)) / 2
            context.translate(output.width/2, output.height/2);
            context.rotate(90 * Math.PI / 180);
            console.log(-(output.height/2)-offset)
            // context.drawImage(image, 0, offset, output.width, offset.height, 0,0,-(output.width / 2), -(output.height / 2))
            context.drawImage(image, -(output.height/2)-offset,-(output.width/2), output.width, output.height)
            console.log(canvas.toDataURL())
            // rotateImage(sampleImage, 90).then(data=>{
            //     console.log(data)
            // })
        
        }
    }
    
    image.src = sampleImage; 
}
function format(image, options={}){

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