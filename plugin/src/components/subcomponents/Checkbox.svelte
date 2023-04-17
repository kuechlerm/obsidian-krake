<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Check from '../icons/Check.svelte';

    const dispatch = createEventDispatcher();

    export let checked: boolean;
    export let label: string = '';
    export let readonly: boolean = false;

    const check = () => {
        if (!readonly) {
            checked = !checked;
            dispatch('changed', checked);
        }
    };
</script>

<div
    class="flex gap-1 items-center cursor-pointer hover:text-opacity-100"
    class:text-opacity-40={!checked}
    class:text-opacity-100={checked}
    class:text-slate-600={!checked}
    class:text-slate-50={checked}
    on:click={check}
    on:keyup
>
    <Check classes="w-4" />
    {#if label}
        <span>{label}</span>
    {/if}
</div>
