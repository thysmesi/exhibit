Object.defineProperty(IJS.Image.prototype, "fill", {
    value: function fill({width, height}) {
        let resizingData = this.resizingData({width, height, fit: false})
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
        image = image.crop({
            x: resizingData.crop.x, 
            y: resizingData.crop.y, 
            width,
            height
        })

        return image
    },
    writable: true,
    configurable: true
})