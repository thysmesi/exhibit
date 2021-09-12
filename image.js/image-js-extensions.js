Object.defineProperty(IJS.Image.prototype, "resizingData", {
    value: function resizingData({width, height, fit}) {
        let tumble = !!(this.width >= this.height ^ width >= height)

        let resized = {width: width, height: height}
        let ratio = tumble ? this.height / this.width : this.width / this.height
        let toRatio = width / height
        let scale
        let scaled
        
        if(fit ? (ratio > toRatio) : (ratio < toRatio)) {
            resized.height = width / ratio
            scale = (tumble ? resized.width : resized.height) / this.height
            scaled = 'width'
        } else {
            resized.width = height * ratio
            scale = (tumble ? resized.height : resized.width) / this.width
            scaled = 'height'
        }

        return {
            scaled,
            tumble,
            scale,
            width: resized.width,
            height: resized.height,
            crop: {
                x: (resized.width - width) / 2,
                y: (resized.height - height) / 2,
            }
        }
    },
    writable: true,
    configurable: true
})

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
