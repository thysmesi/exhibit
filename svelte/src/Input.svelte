<script>
    import { onMount } from 'svelte';
    export let label = 'asdf'
    export let value = ''
    export let type = 'text'
    export let max = false
    export let min = false
    export let accept = "*"
    export let multiple = false

    let opacity = type=="file"?1:.5
    let input

    onMount(()=>{
        input.addEventListener('focus', function(){
            opacity = 1
        })
        input.addEventListener('focusout', function(){
            opacity = .5
        })
        if(type === 'number') {
            if(max) input.value = Math.min(max, input.value)
            if(min) input.value = Math.max(min, input.value)
        }
    })

    function handleInput(event){
        if(type === 'number') {
            if(event.data === '-') {
                let negative = value==null?null:-value
                if(min){
                    input.value = Math.max(min,negative)
                } else {
                    input.value = negative
                }
            }
            if(input.value != ''){
                if(max) input.value = Math.min(max, input.value)
                if(min) input.value = Math.max(min, input.value)
            }
        }
        if(type === 'files') {
            value = input.files
        }
    }
    function handleClick(event){
        if(type==='file'){
            let input = document.createElement("input")
            input.type = type
            input.accept = accept
            input.multiple = multiple

            input.onchange = () => {
                let output = []

                for (let i = 0; i < input.files.length; i++) {
                    let file = input.files[i]
                    if (
                        file.type === "application/pdf" ||
                        file.type === "application/wps-office.pdf" ||
                        file.type === 'application/pdf' || file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === "image/png"
                    ) {
                        output.push(file)
                    }
                }
                value = output
            }
            input.click()
        }
    }
</script>
<div style={`opacity:${opacity}`} class="input-container" on:click={handleClick}>
    {#if type != 'file'}
    <label>{label===''?'':`${label} |`}</label>
    {/if}
    {#if type==='number'}
        <input class="input" type=number on:input={handleInput} bind:value={value} bind:this={input}>
    {:else if type==='file'}
        <div class="input" bind:this={input}>{label}</div>
        <!-- <input type="file" accept={accept} on:input={handleInput} bind:value={data} bind:this={input} multiple/> -->
    {:else}
        <input class="input" on:input={handleInput} bind:value={value} bind:this={input}>
    {/if}
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