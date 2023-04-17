<script lang="ts">
    import { toggle_done_workflow } from '../../workflows/toggle_done';
    import type {
        Entry,
        Move_File,
        Open_File,
        Write_Metadata,
    } from '../../types';
    import Flag from '../icons/Flag.svelte';
    import Folder from '../icons/Folder.svelte';
    import Inbox from '../icons/Inbox.svelte';
    import Open from '../icons/Open.svelte';
    import Checkbox from '../subcomponents/Checkbox.svelte';
    import HoverContent from '../subcomponents/HoverContent.svelte';
    import Sprout from '../icons/Sprout.svelte';

    export let entry: Entry;
    export let selected: boolean;
    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;

    $: color = entry.type === 0 ? 'teal' : entry.type === 1 ? 'violet' : 'pink';

    async function toggle_done(e: { detail: boolean }) {
        const checked = e.detail;

        await toggle_done_workflow(entry, checked, move_file, write_metadata);
    }
</script>

<div
    class="flex text-neutral-900 cursor-pointer shadow-md rounded-lg overflow-hidden"
>
    <div
        class="w-7 px-1.5 flex items-center bg-{color}-600 bg-opacity-30 h-auto rounded-l-lg"
        class:selected
    >
        {#if entry.type === 0}
            <HoverContent>
                <Sprout classes="text-white" />

                <Checkbox
                    slot="hover_content"
                    checked={!!entry.done}
                    on:changed={toggle_done}
                />
            </HoverContent>
        {:else if entry.type === 1}
            <Flag classes="text-white" />
        {:else if entry.name === 'Inbox'}
            <Inbox classes="text-white" />
        {:else}
            <Folder classes="text-white" />
        {/if}
    </div>

    <div
        class="flex-1 flex gap-2 border border-l-0 bg-slate-300 bg-opacity-10 rounded-r-lg
                border-solid border-slate-600 border-opacity-30"
    >
        <div class="flex-1 px-3 py-2.5">
            {entry.name}
        </div>

        <div
            on:click={() => open(entry.file_path)}
            on:keyup
            class="w-6 flex items-center cursor-pointer pr-2"
        >
            <Open />
        </div>
    </div>
</div>

<style lang="postcss">
    .selected {
        @apply bg-opacity-70;
    }
</style>
