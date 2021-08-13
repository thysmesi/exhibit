<script>
    import { onMount } from 'svelte';
    export let value = ''
    export let max = false
    export let min = false
    export let label = ''
    export let disabled = false

    let input
    let textValue = `${value}`
    let opacity = .5

    onMount(()=>{
        input.addEventListener('focus', function(){
            opacity = 1
        })
        input.addEventListener('focusout', function(){
            opacity = .5
        })
        if(max) input.value = Math.min(max, input.value)
        if(min) input.value = Math.max(min, input.value)
    })
    function handleInput(event){
        if(event.data === '-') {
            if(textValue.includes('-')) {
                event.target.value = event.target.value.slice(0, -1).substring(1);
            }
            else {
                event.target.value = `-${event.target.value.slice(0, -1)}`
            }
        }
        else if(event.data === '.') {
            if(textValue.includes('.')) event.target.value = event.target.value.slice(0, -1); 
        }
        else if(isNaN(event.data)){
            event.target.value = event.target.value.slice(0, -1); 
        }
        let parsed = parseFloat(event.target.value)

        let negative = event.target.value.includes('-')
        let decimal = event.target.value.indexOf('.')
                
        let length = event.target.value.length
        if(negative && length > 1) {
            if(min) parsed = Math.max(min, parsed)
            if(max) parsed = Math.min(max, parsed)
            
            event.target.value = isNaN(parsed) ? '' : parsed
            console.log(event.target.value.substring(0, decimal))
            if(decimal) event.target.value = event.target.value.substring(0, decimal) + '.'// + event.target.value.substring(decimal)
        }

        value = isNaN(parsed) ? 0 : parsed
    }
</script>
<div style={`opacity:${opacity}`} class="input-container">
    <label>{label===''?'':`${label} |`}</label>
    <input class="input" on:input={handleInput} bind:value={textValue} bind:this={input}>
</div>
<style>
    .input-container {
        width: 100%;
        border-bottom: 2px solid rgba(255,255,255,.5);;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0px 10px;
    }
    label{
        color: rgba(255,255,255,.5);
        white-space: nowrap;
    }
    .input {
        width: 100%;
        background-color: rgba(0,0,0,0);
        border: none;
        color: white;
        -webkit-appearance: none;
        margin: 0;
        padding: 5px;
    }
    #file-upload-button{
        background-color: orange;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }
    input:focus {
        outline: none;
    }
</style>