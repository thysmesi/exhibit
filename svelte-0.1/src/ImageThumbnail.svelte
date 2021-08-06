<script>
    export let data
    export let click
</script>
<div on:click={click}>
    <img src={data}>
    <div class="cover">x</div>
</div>
<style>
    div{
        position: relative;
        width: 100%;
        height: 100%;
        opacity: .5;
    }
    div:hover{
        opacity: 1;
    }
    img{
        object-fit: contain;
        width: 100%;
        height: 100%;
        background-color: rgb(36, 36, 36);
        border-radius: 7px;
    }
    .cover{
        width: 100%;
        height: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        opacity: 0;
        font-size: 2.6rem;
        font-weight: bolder;
        line-height: 48px;
        user-select: none;
        color: rgb(211, 211, 211);
        background-color: rgb(0, 0, 0, .5);
        border-radius: 7px;
        cursor: pointer;
    }
    .cover:hover{
        opacity: 1;
    }
</style>