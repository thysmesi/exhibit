<script>
	import { afterUpdate } from 'svelte';
	import Status from './Status.svelte'
	import NumberInput from './NumberInput.svelte'
	import PdfPreview from './PdfPreview.svelte';
	import {
		importFiles,
		loadImage,
		convertPDFtoImages,
		fitImageTo
	} from './thysmesi.js'
	import Alert from './Alert.svelte'
	import ImageInput from './ImageInput.svelte'
	import { format } from './format.js'

	let options = {
		page: {
			width: 12,
			height: 18
		},
		fill: 'cover',
		width: 5,
		height: 7,
		bleed: {
			value: .125,
			type: 'mirror'
		},
		marks: true,
		margin: .125,
		spacing: 0,
		pack: 'linear',
		dpi: 600,
		originals: [],
		numberOfEach: false
	}

	let compressing = false
	let converting = false
	// let originals = []
	let hover = false

	afterUpdate(()=>{
		console.log(options.page.width)
	})

	async function addOriginalsHandleClick(){
		let files = await importFiles('image/*,.pdf', true)

		let images = []
		for(let index = 0; index < files.length; index++){
			let file = files[index]

			if(file.type === "application/pdf") {
				converting = {
					name: file.name,
					value: 0
				}
				let datas = await convertPDFtoImages(URL.createObjectURL(file), async (progress)=>{
					converting = {...converting, value:progress}
				})
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
		converting = false
		for(let index = 0; index < images.length; index++){
			let image = images[index]
			compressing = {
				value: (index+1) / images.length,
				name: image.name
			}
			let compressed = await fitImageTo(image, 250, 250, {rotate: false})
			await new Promise(r=>setTimeout(r,1))
			options.originals = [...options.originals,{full: image, low: compressed}]

		}
		compressing = false
	}
	function deleteOriginal(index){
		options.originals.splice(index, 1)
		options.originals = options.originals
	}
</script>
<aside>
	<div id="originals-options">
		<div class="originals-options-item" on:click={addOriginalsHandleClick}>
			<img src="plus.svg">
		</div>
	</div>
	<div id="orginals">
		{#each options.originals as {low}, i}
			<div class="section-container original-thumbnail" on:mouseenter={()=>{hover = i}} on:mouseleave={()=>hover=false}>
				<div class="original-info">
					<h3>{i}</h3>
					{#if hover === i}
						<div class="originals-options-item" on:click={()=>{deleteOriginal(i)}}>
							<img src="trash.svg">
						</div>
					{/if}
				</div>
				<img class="thumbnail" src={low}>
			</div>
		{/each}
	</div>
</aside>
<main>
	<div id="editor-options">
		<div class="editor-options-container">
			<h3 class="editor-options-header">Page</h3>
			<div class="editor-options">
				<NumberInput label="Width" min={0} bind:value={options.page.width}/>
				<NumberInput label="Height" min={0} bind:value={options.page.height}/>
				<NumberInput label="Margin" min={0} bind:value={options.margin}/>
			</div>
		</div>
		<div class="editor-options-container">
			<h3 class="editor-options-header">Cutting</h3>
			<div class="editor-options">
				<NumberInput label="Width" min={0} bind:value={options.page.width}/>
				<NumberInput label="Height" min={0} bind:value={options.page.height}/>
				<NumberInput label="Margin" min={0} bind:value={options.page.margin}/>
			</div>
		</div>
	</div>
	<div id="editor-preview">
		<PdfPreview options={options}/>
	</div>
</main>
{#if compressing != false} 
	<Status message="Compressing {compressing.name}" value={compressing.value}/>
{/if}
{#if converting != false} 
	<Status message="Converting {converting.name}" value={converting.value}/>
{/if}

<style>
	.editor-options-container{
		padding: 7px 0px;
		border-radius: 7px;
		background-color: rgba(255, 255, 255, .05);
		display: flex;
		margin-top: 30px;
		width: 400px;
		flex-direction: column;
	}
	.editor-options-header{
		width: 100%;
		border-bottom: 1px solid #505050;
		padding-left: 7px;
		padding-bottom: 7px;
	}
	.editor-options {
		width: 100%;
	}
	#editor-options{
		min-width: 450px;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		padding-top: 20px;
	}
	#editor-preview{
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 15px;
	}
	main {
		background-color: #353535;
		width: calc(100% - 190px);
		height: 100%;
		display: flex;
		color: white;
	}
	aside {
		-webkit-box-sizing: border-box;
		height: 100%;
		width: 190px;
		background-color: #393939;
		border-right: 1px solid #505050;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	h3, h2{
		margin: 0;
	}
	.thumbnail {
		width: calc(100% - 25px);
		object-fit: contain;
		border-radius: 5px;
	}
	.originals-options-item {
		width: 25px;
		height: 25px;
		padding: 5px;
		border-radius: 5px;
		display: flex;
		justify-content: flex-end;
		fill: white;
		cursor: pointer;
		-webkit-user-select: none;
	}
	.original-info {
		width: 25px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.originals-options-item:hover {
		background-color: rgba(255, 255, 255, .05);
	}
	#originals-options{
		width: 100%;
		height: 35px;
		background-color: #353535;
		border-bottom: 1px solid #505050;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 5px;
	}
	#orginals {
		box-sizing: initial;
		height: calc(100% - 35px);
		width: calc(100% - 20px);
		padding: 0px 10px;
		overflow-y: scroll;
	}
	.original-thumbnail {
		height: 130px;
		margin-top: 10px;
		opacity: .6;
		cursor: pointer;
		padding-left: 4px !important;
		/* border: 2px solid white */
	}
	.original-thumbnail:hover {
		opacity: 1;
	}
	.option-container {
		height: 29px;
        border-radius: 7px;
        background-color: #ffffff;	
		color: black;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.section-container {
		padding: 7px;
		border-radius: 7px;
		background-color: rgba(255, 255, 255, .05);
		display: flex;
		justify-content: flex-end;
	}
	#select-originals {
		width: 130px;
		margin-top: 10px;
		cursor: pointer;
		font-size: .9rem;
	}
</style>