<script>
	import { afterUpdate } from 'svelte';
	import Alert from './Alert.svelte'
	import Input from './Input.svelte'
	let options = {
		margin: 1
	}
	afterUpdate(()=>{
		console.log(options.margin)
	})
</script>
<main>
	<Input type="files"bind:value={options.margin}/>
</main>

<style>
	main {
		background-color: #3c3c3c;

		width: 100%;
		height: 100%;
	}
</style>