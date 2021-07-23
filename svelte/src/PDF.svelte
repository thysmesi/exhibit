<script>
    import { afterUpdate } from 'svelte';
    export let data
    export let width
    export let height
    export let page = 1

    import pdfjs from "pdfjs-dist";
 	import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

	pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    let canvas
    let pdf
    let pageNumber = page
    let redraw
    let box = false
    let renderTask = false
    let pages

    var loadingTask = pdfjs.getDocument({data});
    loadingTask.promise.then(function(loaded) {
        pdf = loaded
        pages = pdf.numPages
        pdf.getPage(pageNumber).then(function(loaded) {
            page = loaded
            draw()
        })
    });
    afterUpdate(resize)
    
    function draw() {
        canvas.width = width
        canvas.height = height
        let context = canvas.getContext('2d')
        if(pdf && page) {
            scale = 1
            let viewport = page.getViewport({scale:1,rotation:0,dontFlip:false})
            let rescale = Math.min(width / viewport.viewBox[2], height / viewport.viewBox[3])
            viewport = page.getViewport({scale: rescale,rotation:0,dontFlip:false})
            var renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            if(renderTask){page.cleanup()}
            renderTask = page.render(renderContext)
            renderTask.promise.then(()=>{renderTask=false})
        }
    }
    function resize(){
        let scale = Math.min(width / canvas.width, height / canvas.height)
        canvas.style.zoom = `${scale}`

        if(redraw){
            clearTimeout(redraw)
        }
        redraw = setTimeout(()=>{redraw=false;draw()}, 80)
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