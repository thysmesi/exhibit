<script>
    import { onMount } from 'svelte';
    import pdfjs from "pdfjs-dist";
 	import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

	pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    let canvas



    onMount(()=>{

        let parent = canvas.parentNode
        let context = canvas.getContext('2d')

        var loadingTask = pdfjs.getDocument('sample.pdf');
        loadingTask.promise.then(function(pdf) {
            pdf.getPage(1).then(function(page) {
                let viewport = page.getViewport({scale:1,rotation:0,dontFlip:false})
                let width = viewport.viewBox[2] - viewport.viewBox[0]
                let height = viewport.viewBox[3] - viewport.viewBox[1]
                let aspectRatio = width/height

                if(parent.clientWidth / parent.clientHeight > aspectRatio){
                    canvas.height = parent.clientHeight * .95
                    canvas.width = parent.clientHeight * aspectRatio * .95
                } else {
                    canvas.width = parent.clientWidth * .95
                    canvas.height = parent.clientWidth / aspectRatio * .95
                }

                context.fillStyle = 'white'
                context.fillRect(0,0,canvas.width,canvas.height)

                console.log(width/height)
                // console.log(viewport)
                // canvas.width = viewport.viewBox[2]
                // canvas.height = viewport.viewBox[3]

                // var renderContext = {
                //     canvasContext: context,
                //     viewport: viewport
                // };
                // page.render(renderContext);
            });
        });
    })
</script>
<canvas bind:this={canvas}></canvas>
<style>

</style>