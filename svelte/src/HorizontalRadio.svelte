<script>
    export let options = []
    export let change = ()=>{}

    let radio = `radio-${Math.floor(Math.random() * 1000000)}`

    function capital(word){
        word = word.toLowerCase()
        return word[0].toUpperCase() + word.substring(1);
    }
    function handleInput(event){
        change(event.target.value)
    }
</script>
<div style="width: 100%;justify-content: space-between;">
        {#each options as option, i}
            <div>
                {#if i === 0}
                    <input type="radio" id="{option}" name="{radio}" value="{option}" on:input={handleInput} checked >
                {:else} 
                    <input type="radio" id="{option}" name="{radio}" value="{option}" on:input={handleInput} >
                {/if}
                <label for="{option}">{capital(option)}</label>
            </div>
        {/each}
</div>
<style>
    *{
        cursor: pointer;
    }
    div {
        display: flex;
        align-items: center;
    }
    label{
        margin-left: 5px;
    }

    input {
        margin: 0;
        visibility: hidden; /* hide default radio button */
    /* you may need to adjust margin here, too */
    }
    input::before { /* create pseudoelement */
        border: 2px solid #949494; /* thickness, style, color */
        height: .55em; /* height adjusts with font */
        width: .55em; /* width adjusts with font */
        border-radius: 50%; /* make it round */
        display: block; /* or flex or inline-block */
        content: " "; /* won't display without this */
        cursor: pointer; /* appears clickable to mouse users */
        visibility: visible; /* reverse the 'hidden' above */
    }

    input:checked::before { /* selected */
        background: radial-gradient(#949494 36%, transparent 38%);
    }
</style>