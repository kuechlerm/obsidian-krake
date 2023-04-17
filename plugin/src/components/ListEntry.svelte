<script lang="ts">
    import type {
        Task,
        Project,
        Topic,
        Write_Metadata,
        Open_File,
        Move_File,
    } from '../types';
    import Checkbox from './subcomponents/Checkbox.svelte';
    import DateIndicator from './subcomponents/DateIndicator.svelte';
    import Open from './icons/Open.svelte';
    import { toggle_done_workflow } from '../workflows/toggle_done';
    import Flag from './icons/Flag.svelte';
    import Inbox from './icons/Inbox.svelte';
    import Folder from './icons/Folder.svelte';
    import { change_date_workflow } from '../workflows/change_date';
    import HoverContent from './subcomponents/HoverContent.svelte';
    import Sprout from './icons/Sprout.svelte';

    // better type checking for do_date and due_date
    export let entry: Task | Project | Topic;

    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;

    $: color =
        entry.type === 0 ? 'teal' : entry?.type === 1 ? 'violet' : 'pink';

    async function change_date() {
        await change_date_workflow(entry, write_metadata);
    }

    async function toggle_done(e: { detail: boolean }) {
        const checked = e.detail;
        // TODO cleanup type
        entry = (await toggle_done_workflow(
            entry,
            checked,
            move_file,
            write_metadata
        )) as Task | Project | Topic;
    }
</script>

<div
    class="flex text-neutral-900 shadow-md rounded-lg rounded-r-sm overflow-hidden"
>
    <div
        class="w-7 px-1.5 flex items-center bg-{color}-600 bg-opacity-70 h-auto rounded-l-lg
                border-0"
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

    <div class="flex-1 flex relative">
        {#if entry.done}
            <div
                class="absolute inset-0 flex items-center bg-slate-100/70 rounded-lg px-2 py-4"
            />
        {/if}

        <div
            class="flex-1 flex gap-2 border border-l-0 border-r-0 bg-slate-300 bg-opacity-10
                border-solid border-slate-600 border-opacity-30"
        >
            <div class="flex-1 px-3 py-2 flex flex-col gap-0.5">
                <div>
                    {entry.name}
                </div>

                <!-- <Path parents={entry.parents} {open} size="s" /> -->
            </div>
        </div>

        <div
            class="p-2 flex gap-2 items-stretch bg-slate-300 bg-opacity-10
        border border-l-0 border-solid border-slate-600 border-opacity-30"
        >
            {#if entry.type === 0}
                <DateIndicator
                    muted
                    bind:date={entry.do_date}
                    on:changed={change_date}
                />
            {/if}
            {#if entry.type !== 2}
                <DateIndicator
                    due
                    muted
                    bind:date={entry.due_date}
                    on:changed={change_date}
                />
            {/if}

            <div
                on:click={() => open(entry.file_path)}
                on:keyup
                class="w-5 flex items-center cursor-pointer border-0 text-slate-900 text-opacity-30 hover:text-opacity-100"
            >
                <Open />
            </div>
        </div>
    </div>
</div>
