<script>
    export let label = "label"
    export let change = ()=>{}

    let mark = `mark-${Math.floor(Math.random() * 1000000)}`

    function handleInput(event){
        change(event.target.checked)
    }
</script>

<div>
    <input type="checkbox" id="{mark}" on:input={handleInput} checked>
    <label for="{mark}">{label}</label>
</div>

<style>
    *{
        cursor: pointer;
    }
    div{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    input {
        margin-bottom: 0;
        position: relative;
        width: 18px;
        height: 18px;
        -webkit-appearance: none;
        -moz-appearance: none;
        -o-appearance: none;
        appearance: none;
        background: transparent;
        border: 1px solid #949494;
        border-radius: 4px;
        margin: 0;
        outline: none;
        transition: 0.15s ease;
        opacity: 0.8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    input:checked {
        border-color: #949494;
        background-color: #949494;
    }
    input:checked:before {
        position: absolute;
        display: block;
        content: '\2713';
        text-align: center;
        color: #3C3C3C;
        font-family: Arial;
        font-size: 14px;
        font-weight: 800;
    }
    label{
        margin-left: 8px;
    }
</style>