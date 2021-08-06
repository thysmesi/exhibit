<script>
    import { afterUpdate, beforeUpdate, onMount } from 'svelte';
    import format from './exhibit-pdf-format'
    export let options
    export let width = false
    export let height = false
    export let pageNumber = 1

    let canvas
    let pdf
    let box = false
    let pages = 1

    afterUpdate(draw)

    async function draw() {
        if(!width){
            setTimeout(draw, 10)
            return
        }

        let context = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height
        context.fillStyle = 'white'
        context.fillRect(0,0,canvas.width,canvas.height)
        let scale = canvas.width / (options.page.width*72)
        context.scale(scale,scale)

        let {output, images } = await format({...options, dpi: 50})
        let page = output[0]
        // console.log(page)
        page.forEach(item => {
            if(item.data != null){
                let image = new Image()
                image.onload = ()=>context.drawImage(image, item.x, item.y, item.width, item.height)
                image.src = images[item.data]
            } else {
                context.fillRect(item.x,item.y,item.width,item.height)
            }  
        })
    }

    function handleMouseenter(event) {
        box = true
    }
    function handleMouseleave(event) {
        if(event.offsetX > width || event.offsetY > height || event.offsetX < 0 || event.offsetY < 0){
            box = false
        }
    }
    function decreasePage(){
        pageNumber = Math.max(1, pageNumber-1)
        pdf.getPage(pageNumber).then(function(loaded) {
            page = loaded
            draw()
        })
    }
    function increasePage(){
        pageNumber = Math.min(pages, pageNumber+1)
        pdf.getPage(pageNumber).then(function(loaded) {
            page = loaded
            draw()
        })
    }
</script>
<div class="container">
    <canvas on:mouseleave={handleMouseleave} on:mousemove={handleMouseenter} bind:this={canvas}></canvas>
    {#if box && pages > 1}
        <div class="box">
            <div on:click={decreasePage} class="arrow">&#8249;</div>
            <div style="flex-grow: 1;">{pageNumber} / {pages}</div>
            <div on:click={increasePage} class="arrow">&#8250;</div>
        </div>
    {/if}
</div>
<style>
    canvas{
        box-shadow: 0px 0px 30px 5px rgba(0,0,0,0.15);
    }
    .container{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .box {
        position: relative;
        width: 130px;
        height: 35px;
        top: -60px;
        background-color: #3C3C3C;
        border-radius: 8px;
        opacity: .8;
        display: flex;
        user-select: none;
    }
    .box > div {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .arrow {
        font-size: 2rem;
        height: 30px;
        width: 40px;
        cursor: pointer;
    }
</style>