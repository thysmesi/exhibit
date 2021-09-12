let start = new Date().getTime()

let debug = document.getElementById("debug")
debug.width = 126+18+18
debug.height = (126+18+18) * 100
let debugContext = debug.getContext('2d')

let a 

IJS.Image.load(image).then(async image => {
    let canvas = document.createElement("canvas")
    canvas.width = 252+36+36
    canvas.height = 252+36+36
    let context = canvas.getContext('2d')

    image = await image.fill({width: 252, height: 252})
    // new ImageData(new Uint8ClampedArray(a.data), a.width, a.height)

    function clamp(image) {
        return new ImageData(new Uint8ClampedArray(image.data), image.width, image.height)
    }

    context.putImageData(clamp(image), 36, 36)
    let horizontal = image.clone().flipX()
    context.putImageData(clamp(horizontal.crop({x: 252-36, width: 36})), 0, 36)
    context.putImageData(clamp(horizontal.crop({x: 0, width: 36})), 36+252, 36)
    let vertical = image.clone().flipY()
    context.putImageData(clamp(vertical.crop({y: 252-36, height: 36})), 36, 0)
    context.putImageData(clamp(vertical.crop({y: 0, height: 36})), 36, 36+252)
    let all = vertical.clone().flipX()
    context.putImageData(clamp(all.crop({x: 252-36, y: 252-36, width: 36, height: 36})), 0, 0)
    context.putImageData(clamp(all.crop({width: 36, height: 36})), 36+252, 36+252)
    context.putImageData(clamp(all.crop({x: 252-36, width: 36, height: 36})), 0, 36+252)
    context.putImageData(clamp(all.crop({y: 252-36, width: 36, height: 36})), 36+252, 0)
    // console.log(new Date().getTime() - start)


    start = new Date().getTime()
    for(let i = 0; i < 100; i++) {
        debugContext.drawImage(canvas, 0, i*(126+18), 126+36, 126+26)
    }
    console.log(new Date().getTime() - start)

    // context.drawImage(image.getCanvas(), 18, 18)
    // let horizontal = image.clone().flipX()
    // context.drawImage(horizontal.crop({x: 360-18, width: 18}).getCanvas(), 0, 18)
    // context.drawImage(horizontal.crop({x: 0, width: 18}).getCanvas(), 18+360, 18)
    // let vertical = image.clone().flipY()
    // context.drawImage(vertical.crop({y: 504-18, height: 18}).getCanvas(), 18, 0)
    // context.drawImage(vertical.crop({y: 0, height: 18}).getCanvas(), 18, 18+504)
    // let all = vertical.clone().flipX()
    // context.drawImage(all.crop({x: 360-18, y: 504-18, width: 18, height: 18}).getCanvas(), 0, 0)
    // context.drawImage(all.crop({width: 18, height: 18}).getCanvas(), 18+360, 18+504)
    // context.drawImage(all.crop({x: 360-18, width: 18, height: 18}).getCanvas(), 0, 18+504)
    // context.drawImage(all.crop({y: 504-18, width: 18, height: 18}).getCanvas(), 18+360, 0)
    // console.log(new Date().getTime() - start)
    a = image
})