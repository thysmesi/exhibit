<script>
	import { afterUpdate } from 'svelte';
	import {sampleImage1, sampleImage2} from './tests.js'
	import Alert from './Alert.svelte'
	import ImageInput from './ImageInput.svelte'
	import { format } from './format.js'

	let options = {
		page: {
			width: 8.5,
			height: 11
		},
		fill: 'cover',
		width: 1,
		height: 1,
		bleed: {
			value: .125,
			type: 'mirror'
		},
		marks: true,
		margin: 0,
		spacing: 0,
		pack: 'linear',
		dpi: 50,
		originals: [sampleImage1, sampleImage2],
		numberOfEach: false
	}

	// let canvas
	// let a = new Date().getTime()
	// format(options).then(({output, images})=>{
    // let ctx = canvas.getContext('2d')
    
    // ctx.fillStyle = 'white'
    // ctx.fillRect(0,0,canvas.width,canvas.height)
    // let page = output[1]
    //     page.forEach(item => {
    //         if(item.data != null){
    //             let image = new Image()
    //             image.onload = ()=>ctx.drawImage(image, item.x, item.y, item.width, item.height)
    //         image.src = images[item.data]
    //         } else {
    //             ctx.fillRect(item.x,item.y,item.width,item.height)
    //         }  
    //     })
// })
	let files
	afterUpdate(()=>{
		console.log(files)
	})
</script>
<aside>

</aside>
<main>
	<!-- <canvas width={8.5*72} height={11*72} bind:this={canvas}></canvas> -->
	<div>
		<ImageInput label="adsf" bind:value={files}/>
	</div>
</main>

<style>
	main {
		background-color: #3c3c3c;
		width: 100%;
		height: 100%;
	}
	.option-container {
		height: 29px;
        border-radius: 7px;
        background-color: white;	
	}
	div {
		width: 100px;
	}
</style>