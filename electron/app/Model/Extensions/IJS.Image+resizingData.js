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