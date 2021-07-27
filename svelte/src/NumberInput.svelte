<script>
    export let style = ""
    export let placeholder = "";
    export let value = ""
    export let min = 0
    export let max = 100
    export let input = ()=>{}
    export let change = ()=>{}

    let first = value

    function handleInput(event){
        let value = event.target.value
        if(value === '') {
            event.target.value = value
            return
        }
        
        let output = value
        if(isNaN(event.data) && event.data != '.' && event.data != '-') output = output.substring(0, output.length - 1);
        if(value.replace(/[^.]/g, "").length > 1) output = output.substring(0, output.length - 1);
        
        let parsed = parseFloat(output)
        if(event.data === '-') parsed = -parsed
        if(output[output.length-1] != '.' && !isNaN(parsed)){
            output = parsed
            if(output > max) output = max
            if(output < min) output = min
        }

        event.target.value = output

        input(output == '' ? 0 : output)
    }
    function handleChange(event){
        let value = parseFloat(event.target.value)
        change(isNaN(value) ? 0 : value)
    }
</script>
<input type="text" style={style} placeholder={placeholder} value={first} on:input={handleInput} on:change={handleChange}/>
<style>
    input{
        width: 100px;
        height: 26px;
        font-weight: 500;
        color:  #949494;
        background-color: inherit;
        border: none;
        border-bottom: 1.5px solid #949494;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 10px;
        font-size: 1.15rem;
        text-align: center;
        margin-right: 22px;
        margin-bottom: 0;
    }
    input:focus{
        color:  #fff;
        border-bottom: 2px solid #fff;
        outline: none;
    }
</style>