Object.defineProperty(IJS.Image.prototype, "fit", {
    value: async function fit({width, height}) {
        let resizingData = this.resizingData({width, height, fit: true})
        console.log(resizingData)
        let image = this.clone()

        if(resizingData.scaled === "width") {
            image = image.resize({width: resizingData.tumble ? resizingData.height : resizingData.width})
        }
        if(resizingData.scaled === "height") {
            image = image.resize({height: resizingData.tumble ? resizingData.width : resizingData.height})
        }
        if(resizingData.tumble) {
            image = image.rotateRight()
        } 

        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        let context = canvas.getContext('2d')
        context.drawImage(image.getCanvas(), -resizingData.crop.x, -resizingData.crop.y)

        return await IJS.Image.load(canvas.toDataURL())
    },
    writable: true,
    configurable: true
})