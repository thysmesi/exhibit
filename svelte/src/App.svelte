<script>
	import { afterUpdate } from 'svelte';
	import CheckMark from './CheckMark.svelte'
	import NumberInput from './NumberInput.svelte'
	import HorizontalRadio from './HorizontalRadio.svelte'
	import PDF from './PDF.svelte'
	import {samplePDF} from './tests.js'

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
<main bind:clientWidth={mainWidth}>
	<div id="options">
		<p class="options-section-label">Original Options</p>
		<div class="option-container">
			<div id="fill-type" class="contained-option">
				<HorizontalRadio options={['cover','fit']} input={(value)=>{options.fill=value; console.log(options)}}/>
			</div>
		</div>
		<p class="options-section-label">Cutting Options</p>
		<div class="option-container">
			<NumberInput placeholder="Width" value={options.width} min={0} max={options.page.width} input={(value)=>{options.width=value}}/>
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
	.dot {
		height: 10px;
		width: 10px;
		background-color: #bbb;
		border-radius: 50%;
		display: inline-block;
	}
	#options{
		margin-top: 50px;
		width: 460px;
		height: 756px;
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