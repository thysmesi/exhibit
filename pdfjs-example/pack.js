function pack(box, container, options){
    let floord = (numerator, bottom)=>{return Math.floor(numerator / bottom)}

    let landscape = {
        width: Math.max(box.width, box.height),
        height: Math.min(box.width, box.height)
    }
    let portrait = {
        width: Math.min(box.width, box.height),
        height: Math.max(box.width, box.height)
    }
    console.log(landscape)
    let boxes = []
    let landscapeRows = floord(container.height, landscape.height)
    let landscapeColumns = floord(container.width, landscape.width)
    let portraitRows = floord(container.height, portrait.height)
    let portraitColumns = floord(container.width, portrait.width)
    let numIfLandscape =  landscapeRows * landscapeColumns
    let numIfPortrait =  portraitRows * portraitColumns

    console.log(numIfLandscape)
    if(numIfLandscape > numIfPortrait){
        for(let y = 0; y<landscapeRows;y++){
            for(let x = 0; x<landscapeColumns; x++){
                boxes.push({x:landscape.width*x,y:landscape.height*y,...landscape})
            }
        }
    } else {
        for(let y = 0; y<portraitRows;y++){
            for(let x = 0; x<portraitColumns; x++){
                boxes.push({x:portrait.width*x,y:portrait.height*y,...portrait})
            }
        }
    }

    return boxes
}