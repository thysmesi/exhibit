<script>
	import { afterUpdate } from 'svelte';
	import { selectFiles, convertFileToBase64} from './helpers'
	import { constructPDF } from './pdf-constructor'
	import ImageThumbnail from './ImageThumbnail.svelte'
	import CheckMark from './CheckMark.svelte'
	import NumberInput from './NumberInput.svelte'
	import HorizontalRadio from './HorizontalRadio.svelte'
	import PDF from './PDF.svelte'
	import {samplePDF, sampleImage1, sampleImage2} from './tests.js'

	let optionsWidth = 460
	let present
	let mainWidth
	let pageContainerHeight
	let pdfWidth
	let pdfHeight

	let options = {
		page: {
			width: 8.5,
			height: 11
		},
		fill: 'cover',
		width: 5,
		height: 7,
		bleed: {
			value: 0,
			type: 'inset'
		},
		marks: true,
		margin: 0.25,
		spacing: 0,
		pack: 'linear',
		dpi: 600,
		originals: [sampleImage2, sampleImage1],
		numberOfEach: false
	};

	// ;(async function(){ pdfData = (await } )()

	afterUpdate(()=>{
		let aspectRatio = options.page.width / options.page.height
		let areaWidth = mainWidth - optionsWidth
		if(areaWidth / pageContainerHeight > aspectRatio){
			pdfHeight = pageContainerHeight * .95
			pdfWidth = pageContainerHeight * aspectRatio * .95
		} else {
			pdfWidth = areaWidth * .95
			pdfHeight = areaWidth / aspectRatio * .95
		}
	})

	async function updatePDF(){
		let text = await constructPDF(options)
		pdfData = text
	}
	async function handleSelectImagesClick(){
		let files = await selectFiles("image/*,.pdf")
		for(let i = 0; i < files.length; i++){
			let file = files[i]
			let base64 = await convertFileToBase64(file)
			options.originals = [...options.originals, ...base64]
		}
	}
	async function deleteOriginalAt(index){
		let temp = options.originals
		temp.splice(index,1)
		options.originals = temp
	}
	function scrollHorizontally(event) {
        event = window.event || event;
        var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        event.target.scrollLeft -= (delta * 40);
        event.preventDefault();
    }
</script>
<svelte:window/>
<main bind:clientWidth={mainWidth}>
	<div id="options">
		{#if options.originals.length === 0 }
			<div on:click={handleSelectImagesClick} style="cursor:pointer; align-self: center;" class="contained-option">Select Images</div>
		{:else}
			<div id="files-manager-container" class="contained-option" onmousewheel={scrollHorizontally}>
				{#each options.originals as original,i}
					<div style="width:55px;height:55px;flex-shrink:0;">
						<ImageThumbnail data={original} click={()=>{deleteOriginalAt(i)}}/>
					</div>
				{/each}
			</div>
		{/if}
		<p class="options-section-label">Original Options</p>
		<div class="option-container">
			<div id="fill-type" class="contained-option">
				<HorizontalRadio options={['cover','fit']} input={(value)=>{options.fill=value}}/>
			</div>
		</div>
		<p class="options-section-label">Cutting Options</p>
		<div class="option-container">
			<NumberInput placeholder="Width" value={options.width} min={0} max={options.page.width} input={(value)=>{options.width=value;updatePDF()}}/>
		</div>
		<div class="option-container">
			<NumberInput placeholder="Height" value={options.height} min={0} max={options.page.height} input={(value)=>{options.height=value}}/>
			<div id="fit" class="contained-option">
				Fit
			</div>
		</div>
		<div class="option-container">
			<NumberInput placeholder="Bleed" min={0} max={1} input={(value)=>{options.bleed.value=value}}/>
			<div id="bleed-type" class="contained-option">
				<HorizontalRadio options={['inset','mirror','edge']} input={(value)=>{options.bleed.type=value}}/>
			</div>
		</div>
		<div class="option-container">
			<div class="contained-option">
				<CheckMark label="Marks" input={(value)=>{options.marks=value}}/>
			</div>
		</div>
		<p class="options-section-label">Layout Options</p>
		<div class="option-container">
			<NumberInput placeholder="Margin" value={.25} min={0} max={Math.min(options.width,options.height)/2} input={(value)=>{options.margin=value}}/>
		</div>
		<div class="option-container">
			<NumberInput placeholder="Spacing" min={0} max={Math.min(options.width,options.height)/4} input={(value)=>{options.spacing=value}}/>
		</div>
		<div class="option-container">
			<div id="pack-type" class="contained-option">
				<HorizontalRadio options={['linear','tumble']} input={(value)=>{options.pack=value}}/>
			</div>
		</div>
		<p class="options-section-label">Output Options</p>
		<div class="option-container">
			<NumberInput placeholder="Max DPI" value={600} min={0} max={1200} input={(value)=>{options.dpi=value}}/>
		</div>
	</div>
	<div id="present" bind:this={present}>
		<div class="contained-option" id="page-options">
			<NumberInput value={options.page.width} max={100} min={1} style="margin-right:10px;height: 20px; width: 40px;font-size: 1rem;" placeholder="w" change={(value)=>{options.page.width=value}}/>
			<NumberInput value={options.page.height} max={100} min={1} style="margin-right:15px;height: 20px; width: 40px;font-size: 1rem;" placeholder="h" change={(value)=>{options.page.height=value}}/>
			<div style="cursor:pointer;"><span class="dot"></span></div>
		</div>
		<div style="width:{pdfWidth}" id="page-container" bind:clientHeight={pageContainerHeight}>
			<PDF options={options} width={pdfWidth} height={pdfHeight}/>
		</div>
	</div>
</main>

<style>
	main{
		display: flex;
		padding: 30px;
		height: 100vh;
		justify-content: center;
	}
	.dot {
		height: 10px;
		width: 10px;
		background-color: #bbb;
		border-radius: 50%;
		display: inline-block;
	}
	#files-manager-container{
		width: 400px;
		height: 70px;
		padding: 8px;
		display: flex;
		overflow-y: hidden;
		overflow-x: scroll;
	}
	#files-manager-container::-webkit-scrollbar {
		display: none;
	}

	#files-manager-container > div {
		margin-right: 10px;
	}
	#options{
		margin-top: 50px;
		width: 460px;
		height: 756px;
		display: flex;
		flex-direction: column;
	}
	#page-options{
		width: 145px;
		margin-bottom: 15px;
		padding-right: 10px;
		/* justify-content: space-around; */
	}
	#fit{
		cursor: pointer;
	}
	#fill-type{
		margin-top: 5px;
		width: 146px;
	}
	#bleed-type{
		width: 250px;
	}
	#pack-type{
		margin-top: 5px;
		width: 197px;
	}
	.options-section-label {
		font-size: .9rem;
		margin: 20px 0 0 0;
	}
	.options-section-label:first-of-type {
		margin-top: 105x;
	}
	.option-container{
		padding-left: 20px;
		margin: 5px 0px;
		display: flex;
		align-items: center;
	}
	.contained-option{
		width: fit-content;
		padding: 8px 13px;
		background-color: #3C3C3C;
		border: 1px solid #6a6a6a;
		font-size: 1.05rem;
		border-radius: 9px;
		height: 36px;
		display: flex;
		align-items: center;
		user-select: none;
	}
	#present{
		height: 100%;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	#page-container{
		height: calc(100% - 50px);
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}
</style>