<script>
	import { afterUpdate } from 'svelte';
	import Status from './Status.svelte'
	import {
		importFiles,
		loadImage,
		convertPDFtoImages,
		fitImageTo
	} from './thysmesi.js'
	import {sampleImage1, sampleImage2} from './tests.js'
	import Alert from './Alert.svelte'
	import ImageInput from './ImageInput.svelte'
	import { format } from './format.js'

	// let options = {
	// 	page: {
	// 		width: 8.5,
	// 		height: 11
	// 	},
	// 	fill: 'cover',
	// 	width: 1,
	// 	height: 1,
	// 	bleed: {
	// 		value: .125,
	// 		type: 'mirror'
	// 	},
	// 	marks: true,
	// 	margin: 0,
	// 	spacing: 0,
	// 	pack: 'linear',
	// 	dpi: 50,
	// 	originals: [sampleImage1, sampleImage2],
	// 	numberOfEach: false
	// }

	let compressing = false
	let converting = false
	let originals = []

	// afterUpdate(()=>{
	// 	console.log(converting !== false)
	// })
	async function selectOriginalsHandleClick(){
		let files = await importFiles('image/*,.pdf', true)

		let images = []
		for(let index = 0; index < files.length; index++){
			let file = files[index]

			if(file.type === "application/pdf") {
				// converting = {
				// 	value: 0,
				// 	name: file.name
				// }
				converting = {
					name: file.name,
					value: 0
				}
				let datas = await convertPDFtoImages(URL.createObjectURL(file), async (progress)=>{
					converting = {...converting, value:progress}
				})
				console.log('a')
				converting = false

				for(let i = 0; i < datas.length; i++){
					let data = datas[i]
					let image = await loadImage(data)
					image.name = `${file.name} - ${i+1}`
					images.push(image)
				}
			}
			if(file.type.includes("image/")) {
				let image = await loadImage(URL.createObjectURL(file))
				image.name = file.name
				images.push(image)
			}
		}
		for(let index = 0; index < images.length; index++){
			let image = images[index]

			compressing = {
				value: (index+1) / images.length,
				name: image.name
			}
			await fitImageTo(image, 500, 500)
		}
		compressing = false
	}
</script>
<aside>
	{#if originals.length === 0}
		<div id="select-originals" class="option-container" on:click={selectOriginalsHandleClick}>Select Originals</div>
	{:else}
	{/if}
</aside>
<main>

</main>
{#if compressing !== false} 
	<Status message="Compressing {compressing.name}" value={compressing.value}/>
{/if}
{#if converting != false} 
	<Status message="Converting {converting.name}" value={converting.value}/>
{/if}
<style>
	main {
		background-color: #3c3c3c;
		width: 100%;
		height: 100%;
	}
	aside {
		height: 100%;
		width: 165px;
		background-color: #353535;
		border-right: 1px solid #464646;
		padding-top: 15px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.option-container {
		height: 29px;
        border-radius: 7px;
        background-color: #ececec;	
		color: black;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#select-originals {
		width: 130px;
		cursor: pointer;
	}
</style>