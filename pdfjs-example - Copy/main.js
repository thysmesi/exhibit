0
function d72(x){return x*72}

let canvas = document.getElementsByTagName('canvas')[0]
canvas.width = d72(8.5)
canvas.height = d72(11)
let context = canvas.getContext('2d')

context.fillStyle = 'white'
context.fillRect(0,0,canvas.width,canvas.height)

let boxes = format({width: d72(4), height: d72(5.25)}, {width:canvas.width - d72(.5), height:canvas.height - d72(.5)}, {spacing:d72(0), offset: d72(.25)})

context.fillStyle = 'red'
console.log(boxes)
boxes.forEach(box=>{
    context.fillRect(box.x, box.y, box.width, box.height)
    context.strokeRect(box.x, box.y, box.width, box.height)
})