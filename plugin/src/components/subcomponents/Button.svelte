<script lang="ts">
    export let label: string;
</script>

<div
    class="inline-block rounded-lg px-3 py-2 cursor-pointer
        border border-solid border-slate-600 hover:border-purple-600 shadow-md hover:shadow-purple-600/30
        bg-slate-50"
    on:click
    on:keyup
>
    {label}
</div>
