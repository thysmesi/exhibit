function pack(box, container, options = {}){
    let spacing = options.spacing || 0
    let offset = options.offset || 0
    let landscape = {
        width: Math.max(box.width, box.height),
        height: Math.min(box.width, box.height)
    }
    let portrait = {
        width: Math.min(box.width, box.height),
        height: Math.max(box.width, box.height)
    }

    let floord = (bottom, numerator)=>{
        let amount = 0
        let left = bottom
        while(left >= numerator){
            amount++
            left -= numerator + spacing
        }
        return amount
    }

    let boxes = []
    let landscapeRows = floord(container.height, landscape.height)
    let landscapeColumns = floord(container.width, landscape.width)
    let portraitRows = floord(container.height, portrait.height)
    let portraitColumns = floord(container.width, portrait.width)
    let numIfLandscape =  landscapeRows * landscapeaColumns
    let numIfPortrait =  portraitRows * portraitColumns

    if(numIfLandscape > numIfPortrait){
        for(let y = 0; y<landscapeRows;y++){
            for(let x = 0; x<landscapeColumns; x++){
                boxes.push({x:(landscape.width*x) + (spacing*x) + offset,y:(landscape.height*y) + (spacing*y) + offset,...landscape})
            }
        }
    } else {
        for(let y = 0; y<portraitRows;y++){
            for(let x = 0; x<portraitColumns; x++){
                boxes.push({x:(portrait.width*x) + (spacing*x) + offset,y:(portrait.height*y) + (spacing*y) + offset,...portrait})
            }
        }
    }

    return boxes
}