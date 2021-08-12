<script>
    export let open = false
    export let width = false
    export let height = false
</script>
{#if open}
    <div class="alert-background" on:click={()=>{open=false}}>
        <div style={`width:${width}px;height:${height}px`} class="alert-body">
            Couldn't Find JSON
        </div>
    </div>
{/if}
<style>
    div {
        color: #3c3c3c;

        display: flex;
        justify-content: center;
        align-items: center;

        -webkit-user-select: none;
    }
    .alert-background{
		width: 100%;
		height: 100%;

        cursor: pointer;
    }
    .alert-body {
        width: fit-content;
        height: fit-content;
        min-width: 110px;

        flex-direction: column;
        padding: 10px;
        background-color: white;
        border: 1px solid rgb(212, 212, 212);
        border-radius: 8px;
    }
    .alert-close {
        padding: 4px 7px;
        margin-top: 10px;
        background-color: rgb(192, 62, 112);
        border: 1px solid rgb(211, 89, 136);
        color: white;
        border-radius: 8px;
        cursor: pointer;
    }
</style>