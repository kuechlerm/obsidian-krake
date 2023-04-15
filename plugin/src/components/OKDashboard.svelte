<script lang="ts">
    import type { Move_File, Open_File, Write_Metadata } from '../types';
    import Actions from './Actions.svelte';
    import Overview from './structure/Overview.svelte';

    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;

    export let migrate_db: () => Promise<void>;

    let current_tab = 'overview';
</script>

<div class="space-y-4">
    <div
        class="border-0 border-b-2 border-solid border-slate-600/30 p-2 flex justify-between"
    >
        <div class="flex gap-2">
            <div
                class="cursor-pointer p-2 {current_tab === 'overview'
                    ? 'bg-slate-400'
                    : 'bg-slate-100'} rounded-lg"
                on:click={() => (current_tab = 'overview')}
                on:keyup
            >
                Overview
            </div>
            <div
                class="cursor-pointer p-2 {current_tab === 'actions'
                    ? 'bg-slate-400'
                    : 'bg-slate-100'} rounded-lg"
                on:click={() => (current_tab = 'actions')}
                on:keyup
            >
                Actions
            </div>
        </div>

        <div
            class="cursor-pointer p-2 bg-blue-500 text-white rounded-lg"
            on:click={() => alert('RELOAD')}
            on:keyup
        >
            Reload
        </div>
    </div>

    {#if current_tab === 'overview'}
        <Overview {open} {move_file} {write_metadata} />
    {:else if current_tab === 'actions'}
        <Actions {migrate_db} />
    {/if}
</div>
