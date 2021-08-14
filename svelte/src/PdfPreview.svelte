<script>
    import { onMount, afterUpdate } from 'svelte';
    import { format } from './format.js'
    import { getSizeToFit, loadImage } from './thysmesi.js'
    export let options

    let canvas
    let scale = 1
    function handleResize(){
        let container = {
            width: window.innerWidth-700,//parseFloat(style.width) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
            height: window.innerHeight-100//parseFloat(style.height) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
        }
        let page = {
            width: options.page.width,
            height: options.page.height
        }

        let normal = getSizeToFit(page, container)
        let rotated = getSizeToFit({width:page.height,height:page.width}, container)
        let width
        let height
        if(normal.width*normal.height > rotated.width*rotated.height){
            width = normal.width
            height = normal.height
        } else {
            width = rotated.width
            height = rotated.height
        }
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        canvas.width = width
        canvas.height = height

        let context = canvas.getContext('2d')
        context.fillStyle = 'white'
        context.fillRect(0,0,canvas.width,canvas.height)
    }
    afterUpdate(handleResize)
    afterUpdate(async ()=>{
        let context = canvas.getContext('2d')
        let output = await format({...options, originals: options.originals.map(original=>original.low), dpi: 50})
        let images = {}
        for(let key in output.images) {
            images[key] = await loadImage(output.images[key])
        }
        let page = output.output[0]
        let scale = (options.page.width * 72) / canvas.width
        page.forEach(item => {
            if(item.data != null) {
                console.log(scale)
                context.drawImage(images[item.data], item.x / scale, item.y / scale, item.width / scale, item.height / scale)

            }
        })
    })
</script>
<svelte:window on:resize={handleResize}/>
<canvas bind:this={canvas}>

</canvas>
<style>
    canvas{}
</style>