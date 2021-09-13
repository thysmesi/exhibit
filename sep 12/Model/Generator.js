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
    //         offset: Number
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
        let canvas = document.createElement('canvas')
        canvas.width = options.page.width
        canvas.height = options.page.height
        let context = canvas.getContext('2d')
        context.fillStyle = "white"
        context.fillRect(0,0,canvas.width,canvas.height)

        var cache = {}

        for(let i = 0; i < contents.length; i++) {
            let {main, left, right, bottom, top, topleft, topright, bottomleft, bottomright} = contents[i]
    
            let width = main.width+left.width+right.width
            let height = main.height+top.height+bottom.height
            let name = `${width}x${height}l${left.width}r${right.width}t${top.height}b${bottom.height}`
    
            let image

            if(options.content.each === null || options.content.each === false) {
                image = this.images[page-1]
            } else {
                image = this.images[(page-1)*contents.length + i]
            }

            if(cache[name] === undefined) {
                let canvas = document.createElement('canvas')
                canvas.width = main.width+left.width+right.width
                canvas.height = main.height+top.height+bottom.height
                let context = canvas.getContext('2d')
        
                if(image !== undefined) {
                    image = await image.fill({width: main.width*2, height: main.height*2})
                    image.horizontal = image.clone().flipX()  
                    image.vertical = image.clone().flipY()
                    image.all = image.vertical.clone().flipX()
        
                    switch (options.content.bleed.type) {
                        case 'inset' : {
                            context.drawImage(image.getCanvas(),0,0,width, height)
                            break
                        }
                        case 'edge' : {
                            // ----- Main ----- //
                            context.drawImage(image.getCanvas(), left.width, top.height, main.width, main.height)
                            // ----- Left ----- //
                            context.drawImage(image.crop({width:1}).getCanvas(), 0, top.height, left.width, left.height)
                            // ----- Right ----- //
                            context.drawImage(image.crop({x:image.width-1, width:1}).getCanvas(), left.width+main.width, top.height, right.width, right.height)
                            // ----- Top ----- //
                            context.drawImage(image.crop({height: 1}).getCanvas(), left.width, 0, top.width, top.height)
                            // ----- Bottom ----- //
                            context.drawImage(image.crop({y: image.height-1, height: 1}).getCanvas(), left.width, top.height+main.height, bottom.width, bottom.height)                    
                            // ----- Top Left ----- //
                            context.drawImage(image.crop({width: 1, height: 1}).getCanvas(), 0, 0, topleft.width, topleft.height)
                            // ----- Top Right ----- //
                            context.drawImage(image.crop({x: image.width-1, width: 1, height: 1}).getCanvas(), left.width+main.width, 0, topright.width, topright.height)
                            // ----- Bottom Left ----- //
                            context.drawImage(image.crop({y: image.height-1, width: 1, height: 1}).getCanvas(), 0, top.height+main.height, bottomleft.width, bottomleft.height)
                            // ----- Bottom Right ----- //
                            context.drawImage(image.crop({x: image.width-1, y: image.height-1, width: 1, height: 1}).getCanvas(), left.width+main.width, top.height+main.height, bottomright.width, bottomright.height)                   
                            break
                        }
                        case 'mirror' : {
                            // ----- Main ----- //
                            context.drawImage(image.getCanvas(), left.width, top.height, main.width, main.height)
                            // ----- Left ----- //
                            context.drawImage(image.horizontal.crop({x: image.width-(left.width*2), width: left.width*2}).getCanvas(), 0, top.height, left.width, left.height)
                            // ----- Right ----- //
                            context.drawImage(image.horizontal.crop({width: right.width*2}).getCanvas(), left.width+main.width, top.height, right.width, right.height)
                            // ----- Top ----- //
                            context.drawImage(image.vertical.crop({y: image.height-(top.height*2), height: top.height*2}).getCanvas(), left.width, 0, top.width, top.height)
                            // ----- Bottom ----- //
                            context.drawImage(image.vertical.crop({height: bottom.height*2}).getCanvas(), left.width, top.height+main.height, bottom.width, bottom.height)
                            // ----- Top Left ----- //
                            context.drawImage(image.all.crop({x: image.width-(topleft.width*2), y: image.height-(topleft.height*2), width: topleft.width*2, height: topleft.height*2}).getCanvas(), 0, 0, topleft.width, topleft.height)
                            // ----- Top Right ----- //
                            context.drawImage(image.all.crop({y: image.height-(topleft.height*2), width: topright.width*2, height: topright.height*2}).getCanvas(), left.width+main.width, 0, topright.width, topright.height)
                            // ----- Bottom Left ----- //
                            context.drawImage(image.all.crop({x: image.width-(bottomleft.width*2), width: bottomleft.width*2, height: bottomleft.height*2}).getCanvas(), 0, top.height+main.height, bottomleft.width, bottomleft.height)
                            // ----- Bottom Right ----- //
                            context.drawImage(image.all.crop({width: bottomright.width*2, height: bottomright.height*2}).getCanvas(), left.width+main.width, top.height+main.height, bottomright.width, bottomright.height)
                            break
                        }
                    }
        
                    cache[name] = canvas
                }
            }
            if(image !== undefined) { context.drawImage(cache[name], topleft.x, topleft.y, width, height) }
        }

        return canvas
    }
}

// let debug = document.getElementById('debug')
// debug.width = 8.5*72
// debug.height = 11*72
// let debugContext = debug.getContext('2d')    


// IJS.Image.load(image).then(async image => {
    
//     let generator = new Generator([image])
//     let template = generator.template({
//         page: {
//             width: 8.5*72,
//             height: 11*72,
//             margin: .5*72
//         },
//         content: {
//             width: false,
//             height: false,
//             count: 4,
//             spacing: .125*72,
//             each: false,
//             dpi: 300,
//             fit: false,
//             bleed: {
//                 width: .125*72,
//                 type: 'edge'
//             }
//         },
//         marks: {
//             length: .125*72,
//             offset: .125*72
//         }
//     })

//     debugContext.drawImage(await generator.render(template, 1), 0, 0)
// })