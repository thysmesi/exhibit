class Generator {
    constructor(images = []) {
        this.images = images
        this.images.forEach(image => {
            image.horizontal = image.clone().flipX()  
            image.vertical = image.clone().flipY()
            image.all = image.vertical.clone().flipX()
        })
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
            width: useful.horizontal * ((box.width + content.spacing) - content.spacing),
            height: useful.vertical * ((box.height + content.spacing) - content.spacing)
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

    render({contents, options}, page) {
        let canvas = document.createElement()
    }
}

let debug = document.getElementById('debug')
debug.width = 8.5*72
debug.height = 11*72
let debugContext = debug.getContext('2d')    


IJS.Image.load(image).then(image => {
    
    let generator = new Generator()
    let template = generator.template({
        page: {
            width: 8.5*72,
            height: 11*72,
            margin: .25*72
        },
        content: {
            width: 5*72,
            height: 7*72,
            count: false,
            spacing: .125*72,
            dpi: 300,
            fit: false,
            bleed: {
                width: .125*72,
                type: 'mirror'
            }
        },
        marks: {
            length: .125*72,
            offset: .125*72
        }
    })

    var cache = {}
    template.contents.forEach(async ({main, left, right, bottom, top, topleft, topright, bottomleft, bottomright}) => {
        let width = main.width+left.width+right.width
        let height = main.height+top.height+bottom.height
        let name = `${width}x${height}l${left.width}r${right.width}t${top.height}b${bottom.height}`
        
        if(cache[name] === undefined) {
            let canvas = document.createElement('canvas')
            canvas.width = main.width+left.width+right.width
            canvas.height = main.height+top.height+bottom.height
            let context = canvas.getContext('2d')
    
            image = await image.fill({width: main.width, height: main.height})
            image.horizontal = image.clone().flipX()  
            image.vertical = image.clone().flipY()
            image.all = image.vertical.clone().flipX()
        
            // ----- Main ----- //
            context.drawImage(image.getCanvas(), left.width, top.height)
            // ----- Left ----- //
            context.drawImage(image.horizontal.crop({x: image.width-left.width, width: left.width}).getCanvas(), 0, top.height)
            // ----- Right ----- //
            context.drawImage(image.horizontal.crop({width: right.width}).getCanvas(), left.width+main.width, top.height)
            // ----- Top ----- //
            context.drawImage(image.vertical.crop({y: image.height-top.height, height: top.height}).getCanvas(), left.width, 0)
            // ----- Bottom ----- //
            context.drawImage(image.vertical.crop({height: bottom.height}).getCanvas(), left.width, top.height+main.height)
            // ----- Top Left ----- //
            context.drawImage(image.all.crop({x: image.width-topleft.width, y: image.height-topleft.height, width: topleft.width, height: topleft.height}).getCanvas(), 0, 0)
            // ----- Top Right ----- //
            context.drawImage(image.all.crop({y: image.height-topleft.height, width: topright.width, height: topright.height}).getCanvas(), left.width+main.width, 0)
            // ----- Bottom Left ----- //
            context.drawImage(image.all.crop({x: image.width-bottomleft.width, width: bottomleft.width, height: bottomleft.height}).getCanvas(), 0, top.height+main.height)
            // ----- Bottom Right ----- //
            context.drawImage(image.all.crop({width: right.width, height: bottom.height}).getCanvas(), left.width+main.width, top.height+main.height)
            cache[name] = canvas
        }

        debugContext.drawImage(cache[name], topleft.x, topleft.y, width, height)
    })

    // console.log(new Date().getTime() - start)
})