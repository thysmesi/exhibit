<script>
    export let label = ''
    export let accept = '*'
    export let multiple = false
    export let value

    function handleClick(){
        let input = document.createElement("input")
        input.type = 'file'
        input.accept = accept
        input.multiple = multiple

        input.onchange = () => {
            value = input.files
        }
        input.click()
    }
</script>
<div on:click={handleClick}>
    {label}
</div>
<style>
    div {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: white;
        mix-blend-mode: difference;
        cursor: pointer;
    }
</style>