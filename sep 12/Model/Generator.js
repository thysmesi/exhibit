class Generator {
    constructor(images = []) {
        this.images = images
    }


    // ----- Layouter ----- //

    // {
    //     page: {
    //         width: Number,
    //         height: Number,
    //         margin: Number
    //     },
    //     content: {
    //         width: Number?,
    //         height: Number?,
    //         count: Number?,
    //         spacing: Number,
    //         each: Number?
    //         dpi: Number,
    //         fit: Boolean,
    //         bleed: {
    //             width: Number,
    //             type: String(inset, edge, mirror)
    //         }

    //     },
    //     marks: {
    //         length: Number,
    //         offset: Number,
    //         shown: Boolean
    //     }
    // }

    template(options) {
        let page = options.page
        let content = options.content
        let marks = options.marks

        let marginBox = {width: page.width - page.margin, height: page.height - page.margin}

        if (content.count !== false && content.width === false && content.height === false) {
            let best = [page.height > page.width ? 1 : content.count, page.height < page.width ? 1 : content.count]
            for(let i = content.count; i >= 1; i--) {
                if(content.count % i === 0) {
                    if(Math.abs(i - (content.count/i)) < Math.abs(best[0]-best[1])) {
                        best = [i, content.count/i]
                    }
                }
            }
            
            content.width = ((marginBox.width+content.spacing) / best[0]) - content.spacing
            content.height = ((marginBox.height+content.spacing) / best[1]) - content.spacing
        }

        let min = Math.min(content.width, content.height)
        let max = Math.max(content.width, content.height)

        let portrait = {
            horizontal: Math.floor((marginBox.width+content.spacing) / (min + content.spacing)),
            vertical: Math.floor((marginBox.height+content.spacing) / (max + content.spacing))
        }
        portrait.count = portrait.horizontal*portrait.vertical 
        let landscape = {
            horizontal: Math.floor((marginBox.width+content.spacing) / (max + content.spacing)),
            vertical: Math.floor((marginBox.height+content.spacing) / (min + content.spacing))
        }
        landscape.count = landscape.horizontal*landscape.vertical

        let useful = (portrait.count > landscape.count) ? portrait : landscape
        let box = (portrait.count > landscape.count) ? {
            width: min,
            height: max
        } : {
            width: max,
            height: min
        }

        let contentBox = {
            width: (useful.horizontal * (box.width + content.spacing)) - content.spacing,
            height: (useful.vertical * (box.height + content.spacing)) - content.spacing
        }
        contentBox.x = (page.width - contentBox.width) / 2
        contentBox.y = (page.height - contentBox.height) / 2

        let contents = []
        for(let x = 0; x < useful.horizontal; x++) {
            for(let y = 0; y < useful.vertical; y++) {
                let left = x === 0
                let top = y === 0
                let right = x === useful.horizontal-1
                let bottom = y === useful.vertical-1
                let bleed = {
                    left: Math.ceil(left ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width)),
                    top: Math.ceil(top ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width)),
                    right: Math.ceil(right ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width)),
                    bottom: Math.ceil(bottom ? content.bleed.width : Math.min(content.spacing/2, content.bleed.width))
                }

                let main = {
                    x: (box.width + content.spacing) * x + contentBox.x,
                    y: (box.height + content.spacing) * y + contentBox.y,
                    width: box.width,
                    height: box.height,
                    type: 'main',
                    position: 'center'
                }

                let leftX = main.x-bleed.left
                let topY = main.y-bleed.top
                let rightX = main.x+main.width
                let bottomY = main.y+main.height

                contents.push ({
                    main: main,
                    left: {
                        x: leftX,
                        y: main.y,
                        width: bleed.left,
                        height: main.height,
                        type: content.bleed.type,
                        position: 'left'
                    },
                    right: {
                        x: rightX,
                        y: main.y,
                        width: bleed.right,
                        height: main.height,
                        type: content.bleed.type,
                        position: 'right'
                    },
                    top: {
                        x: main.x,
                        y: topY,
                        width: main.width,
                        height: bleed.top,
                        type: content.bleed.type,
                        position: 'top'
                    },
                    bottom: {
                        x: main.x,
                        y: bottomY,
                        width: main.width,
                        height: bleed.bottom,
                        type: content.bleed.type,
                        position: 'bottom'
                    },
                    topleft: {
                        x: leftX,
                        y: topY,
                        width: bleed.left,
                        height: bleed.top,
                        type: content.bleed.type,
                        position: 'topleft'
                    },
                    topright: {
                        x: rightX,
                        y: topY,
                        width: bleed.right,
                        height: bleed.top,
                        type: content.bleed.type,
                        position: 'topright'
                    },
                    bottomleft: {
                        x: leftX,
                        y: bottomY,
                        width: bleed.left,
                        height: bleed.bottom,
                        type: content.bleed.type,
                        position: 'bottomleft'
                    },
                    bottomright: {
                        x: rightX,
                        y: bottomY,
                        width: bleed.right,
                        height: bleed.bottom,
                        type: content.bleed.type,
                        position: 'bottomright'
                    }
                })
            }
        }

        return {contents, options}
    }

    async render({contents, options}, page) {
        let max = 2000

        let canvas = document.createElement('canvas')
        canvas.width = options.page.width
        canvas.height = options.page.height
        let context = canvas.getContext('2d')
        context.fillStyle = "white"
        context.fillRect(0,0,canvas.width,canvas.height)

        var cache = {}

        for(let i = 0; i < contents.length; i++) {
            let content = contents[i]
            let unscaled = JSON.parse(JSON.stringify(contents[i]))
            let {main, left, right, bottom, top, topleft, topright, bottomleft, bottomright} = contents[i]
            if (main.width > max || main.height > max) {
                let scale = 2000 / Math.max(main.width, main.height)
                main.width *= scale
                main.height *= scale
                left.width = Math.floor(left.width * scale)
                left.height *= scale
                right.width *= scale
                right.height *= scale
                bottom.width *= scale
                bottom.height *= scale
                top.width *= scale
                top.height = Math.floor(top.height * scale)
                topleft.width = Math.floor(topleft.width * scale)
                topleft.height = Math.floor(topleft.height * scale)
                topright.width *= scale
                topright.height = Math.floor(topright.height * scale)
                bottomleft.width = Math.floor(bottomleft.width * scale)
                bottomleft.height *= scale
                bottomright.width *= scale
                bottomright.height *= scale
            }
            
            let width = main.width+left.width+right.width
            let height = main.height+top.height+bottom.height
            let name = `${width}x${height}l${left.width}r${right.width}t${top.height}b${bottom.height}`
            
            let image

            if(options.content.each === null || options.content.each === false) {
                image = this.images[page-1]
            } else {
                image = this.images[Math.floor(((page-1)*(contents.length)+i) / options.content.each)]
            }

            if(cache[name] === undefined) {
                let canvas = document.createElement('canvas')
                canvas.width = main.width+left.width+right.width
                canvas.height = main.height+top.height+bottom.height
                let context = canvas.getContext('2d')
                if(image !== undefined) {
                    image = await image.fill({width: main.width, height: main.height})
                    image.horizontal = image.clone().flipX()  
                    image.vertical = image.clone().flipY()
                    image.all = image.vertical.clone().flipX()


                    let images = {}
                    switch (options.content.bleed.type) {
                        case 'inset' : {
                            context.drawImage(image.getCanvas(),0,0,width, height)
                            break
                        }
                        case 'edge' : {
                            images.main = image.getCanvas()
                            if(left.width>0)images.left = image.crop({width:1}).getCanvas()
                            if(right.width>0)images.right = image.crop({x:image.width-1, width:1}).getCanvas()
                            if(top.height>0) images.top = image.crop({height: 1}).getCanvas()
                            if(bottom.height>0) images.bottom = image.crop({y: image.height-1, height: 1}).getCanvas()
                            if(top.height>0 && left.width>0) images.topleft = image.crop({width: 1, height: 1}).getCanvas()
                            if(top.height>0 && right.width>0) images.topright = image.crop({x: image.width-1, width: 1, height: 1}).getCanvas()
                            if(bottom.height>0 && left.width>0) images.bottomleft = image.crop({y: image.height-1, width: 1, height: 1}).getCanvas()
                            if(bottom.height>0 && right.width>0) images.bottomright = image.crop({x: image.width-1, y: image.height-1, width: 1, height: 1}).getCanvas()
                            break
                        }
                        case 'mirror' : {
                            images.main = image.getCanvas()
                            if(left.width>0) images.left = image.horizontal.crop({x: image.width-(left.width), width: left.width}).getCanvas()
                            if(right.width>0) images.right = image.horizontal.crop({width: right.width}).getCanvas()
                            if(top.height>0) images.top = image.vertical.crop({y: image.height-(top.height), height: top.height}).getCanvas()
                            if(bottom.height>0) images.bottom = image.vertical.crop({height: bottom.height}).getCanvas()
                            if(top.height>0 && left.width>0) images.topleft = image.all.crop({x: image.width-(topleft.width), y: image.height-(topleft.height), width: topleft.width, height: topleft.height}).getCanvas()
                            if(top.height>0 && right.width>0) images.topright = image.all.crop({y: image.height-(topleft.height), width: topright.width, height: topright.height}).getCanvas()
                            if(bottom.height>0 && left.width>0) images.bottomleft = image.all.crop({x: image.width-(bottomleft.width), width: bottomleft.width, height: bottomleft.height}).getCanvas()            
                            if(bottom.height>0 && right.width>0) images.bottomright = image.all.crop({width: bottomright.width, height: bottomright.height}).getCanvas()
                            break
                        }
                    }

                    Object.keys(images).forEach(key => {
                        switch (key) {
                            case "main" : context.drawImage(images[key], left.width, top.height, unscaled.main.width, unscaled.main.height); break;
                            case "left" : context.drawImage(images[key], 0, top.height, unscaled.left.width, unscaled.left.height); break;
                            case "right" : context.drawImage(images[key], left.width+main.width, top.height, unscaled.right.width, unscaled.right.height); break;
                            case "top" : context.drawImage(images[key], left.width, 0, unscaled.top.width, unscaled.top.height); break;
                            case "bottom" : context.drawImage(images[key], left.width, top.height+main.height, unscaled.bottom.width, unscaled.bottom.height); break;
                            case "topleft" : context.drawImage(images[key], 0, 0, unscaled.topleft.width, unscaled.topleft.height); break;
                            case "topright" : context.drawImage(images[key], left.width+main.width, 0, unscaled.topright.width, unscaled.topright.height); break;
                            case "bottomleft" : context.drawImage(images[key], 0, top.height+main.height, unscaled.bottomleft.width, unscaled.bottomleft.height); break;
                            case "bottomright" : context.drawImage(images[key], left.width+main.width, top.height+main.height, unscaled.bottomright.width, unscaled.bottomright.height); break;
                        }
                    })
        
                    cache[name] = canvas
                }
            }
            if(image !== undefined) { context.drawImage(cache[name], topleft.x, topleft.y, width, height) }
        }

        return canvas
    }
}