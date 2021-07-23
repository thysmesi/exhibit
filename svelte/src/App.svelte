<script>
	import { afterUpdate } from 'svelte';
	import CheckMark from './CheckMark.svelte'
	import NumberInput from './NumberInput.svelte'
	import HorizontalRadio from './HorizontalRadio.svelte'
	import PDF from './PDF.svelte'
	import {samplePDF} from './tests.js'
	import PdfViewer from 'svelte-pdf';

	let optionsWidth = 460
	let present
	let mainWidth
	let pageContainerHeight
	let pdfWidth
	let pdfHeight

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
	let options = {
		page: {
			width: 8.5,
			height: 11
		},
		fill: 'cover', // cover, fit
		width: 5,
		height: 7,
		bleed: {
			value: 0,
			type: 'inset' // inset, mirror, edge
		},
		marks: true,
		margin: 0.25,
		spacing: 0,
		pack: 'linear', // linear, tumble
		dpi: 600
	}
</script>
<svelte:window/>
<main bind:clientWidth={mainWidth} bind:clientHeight={mainHeight}>
	<div id="options">
		<p class="options-section-label">Original Options</p>
		<div class="option-container">
			<div id="fill-type" class="contained-option">
				<HorizontalRadio options={['cover','fit']} change={(value)=>{options.fill=value; console.log(options)}}/>
			</div>
		</div>
		<p class="options-section-label">Cutting Options</p>
		<div class="option-container">
			<NumberInput placeholder="Width" value={options.width} min={0} max={options.page.width} change={(value)=>{options.width=value}}/>
		</div>
		<div class="option-container">
			<NumberInput placeholder="Height" value={options.height} min={0} max={options.page.height} change={(value)=>{options.height=value}}/>
			<div id="fit" class="contained-option">
				Fit
			</div>
		</div>
		<div class="option-container">
			<NumberInput placeholder="Bleed" min={0} max={1} change={(value)=>{options.bleed.value=value}}/>
			<div id="bleed-type" class="contained-option">
				<HorizontalRadio options={['inset','mirror','edge']} change={(value)=>{options.bleed.type=value}}/>
			</div>
		</div>
		<div class="option-container">
			<div class="contained-option">
				<CheckMark label="Marks" change={(value)=>{options.marks=value}}/>
			</div>
		</div>
		<p class="options-section-label">Layout Options</p>
		<div class="option-container">
			<NumberInput placeholder="Margin" value={.25} min={0} max={Math.min(options.width,options.height)/2} change={(value)=>{options.margin=value}}/>
		</div>
		<div class="option-container">
			<NumberInput placeholder="Spacing" min={0} max={Math.min(options.width,options.height)/4} change={(value)=>{options.spacing=value}}/>
		</div>
		<div class="option-container">
			<div id="pack-type" class="contained-option">
				<HorizontalRadio options={['linear','tumble']} change={(value)=>{options.pack=value}}/>
			</div>
		</div>
		<p class="options-section-label">Output Options</p>
		<div class="option-container">
			<NumberInput placeholder="Max DPI" value={600} min={0} max={1200} change={(value)=>{options.dpi=value}}/>
		</div>
	</div>
	<div id="present" bind:this={present}>
		<div style="width:{pdfWidth}" id="page-container" bind:clientHeight={pageContainerHeight}>
			<PDF data={samplePDF} width={pdfWidth} height={pdfHeight}/>
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
	#options{
		margin-top: 50px;
		width: 460px;
		height: 756px;
	}
	#fit{
		cursor: pointer;
	}
	#fill-type{
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
		margin: 30px 0 0 0;
	}
	.options-section-label:first-of-type {
		margin: 0;
	}
	.option-container{
		padding-left: 20px;
		margin: 8px 0px;
		display: flex;
		align-items: center;
	}
	.contained-option{
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
		padding: 50px 0 0 0;
	}
	#page-container{
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}
</style>