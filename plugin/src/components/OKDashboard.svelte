<script lang="ts">
    import type { Move_File, Open_File, Write_Metadata } from '../types';
    import Actions from './Actions.svelte';
    import Overview from './structure/Overview.svelte';
    import Button from './subcomponents/Button.svelte';

    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;
    export let init_db: () => Promise<void>;

    export let migrate_db: () => Promise<void>;

    let current_tab = 'overview';
</script>

<div class="space-y-4">
    <div
        class="flex justify-between items-center text-center bg-slate-600/70 rounded-lg px-4 py-0.5"
    >
        <div class="flex gap-2 text-slate-200 font-medium">
            <div
                class="inline-block cursor-pointer p-3
                    border-0 border-b-4 border-solid border-transparent hover:text-white hover:border-slate-50"
                class:border-slate-50={current_tab === 'overview'}
                class:text-white={current_tab === 'overview'}
                on:click={() => (current_tab = 'overview')}
                on:keyup
            >
                Overview
            </div>
            <div
                class="inline-block cursor-pointer p-3
                    border-0 border-b-4 border-solid border-transparent hover:text-white hover:border-slate-50"
                class:border-slate-50={current_tab === 'actions'}
                class:text-white={current_tab === 'actions'}
                on:click={() => (current_tab = 'actions')}
                on:keyup
            >
                Actions
            </div>
        </div>

        <div>
            <Button label="Reload" on:click={init_db} />
        </div>
    </div>

    {#if current_tab === 'overview'}
        <Overview {open} {move_file} {write_metadata} />
    {:else if current_tab === 'actions'}
        <Actions {migrate_db} />
    {/if}
</div>
