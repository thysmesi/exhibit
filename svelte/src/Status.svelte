<script>
    export let message
    export let value = 1
</script>
<div class="alert-background">
    <div class="alert-body">
        <span>{message}</span>
        <progress value={value} max={1}> 32% </progress>
    </div>
</div>
<style>
    div {
        color: #3c3c3c;

        display: flex;
        justify-content: center;
        align-items: center;

        -webkit-user-select: none;
    }
    progress {
        width: 250px;
        margin-top: 5px;
        align-self: center;
    }
    span {
        width: calc(100% - 12px);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    .alert-background{
        position: absolute;
        left: 0;
        top: 0;
		width: 100vw;
		height: 100vh;
        background-color: rgba(0, 0, 0, .6);
    }
    .alert-body {
        width: 350px;
        height: fit-content;
        align-items: flex-start;
        flex-direction: column;
        padding: 6px 12px;
        background-color: #ececec;
        border: 1px solid #ebebeb;
        border-radius: 8px;
    }
    .alert-close {
        padding: 4px 7px;
        margin-top: 10px;
        border-radius: 8px;
        cursor: pointer;
    }
</style>