<script>
	export let name;

	import PDF from './exhibit-pdf-kit.js'

	// var pdf = new PDF({
	// 	pages: [
	// 		new PDF.Page({
	// 			width: 8.5 * 72,
	// 			height: 11 * 72
	// 		}),
	// 		new PDF.Page({
	// 			width: 8.5 * 72,
	// 			height: 11 * 72
	// 		})
	// 	]
	// })
	let main = document.getElementsByName('main')[0]
	let options = document.getElementById('options')
</script>

<main>
	<div id="options">
		<p class="options-section-label">Original Options</p>
		<p class="options-section-label">Cutting Options</p>
		<p class="options-section-label">Layout Options</p>
		<p class="options-section-label">Output Options</p>
	</div>
	<div id="present">
		<div id="page-container"></div>
	</div>
</main>

<style>
	main{
		display: flex;
		font-family: 'Montserrat';
		padding: 40px;
		height: 100vh;
	}
	#options{
		margin-top: 50px;
		width: 532px;
		height: 756px;
		background-color: darkcyan;
	}
	.options-section-label {
		font-size: .9rem;
		margin: 20px 0 0 0;
	}
	.options-section-label:first-of-type {
		margin: 0;
	}
	#present{
		height: 100%;
		flex-grow: 1;
		background-color: coral;
		padding: 50px 0 0 0;
	}
	#page-container{
		width: 100%;
		height: 100%;
		background-color: cornflowerblue;
	}
</style>