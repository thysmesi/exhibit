0
function d72(x){return x*72}

let canvas = document.getElementsByTagName('canvas')[0]
canvas.width = d72(8.5)
canvas.height = d72(11)
let context = canvas.getContext('2d')

context.fillStyle = 'white'
context.fillRect(0,0,canvas.width,canvas.height)

let boxes = pack({width: d72(5), height: d72(7)}, {width:canvas.width, height:canvas.height})

context.fillStyle = 'red'
console.log(boxes)
boxes.forEach(box=>{
    context.fillRect(box.x, box.y, box.width, box.height)
})