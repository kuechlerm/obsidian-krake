<script lang="ts">
    import { db } from '../stores/db';
    import type { Task, Project, Topic } from '../types';
    import Checkbox from './subcomponents/Checkbox.svelte';
    import DateIndicator from './subcomponents/DateIndicator.svelte';
    import Open from './icons/Open.svelte';
    import Path from './subcomponents/Path.svelte';
    import { toggle_done_workflow } from '../workflows/toggle_done';
    import Flag from './icons/Flag.svelte';
    import Inbox from './icons/Inbox.svelte';
    import Folder from './icons/Folder.svelte';
    import { change_date_workflow } from 'src/workflows/change_date';

    // better type checking for do_date and due_date
    export let entry: Task | Project | Topic;

    export let open: (file_path: string) => void;
    export let move_file: (from_path: string, to_path: string) => Promise<void>;
    export let write_metadata: (
        file_path: string,
        metadata: { [key: string]: string }
    ) => Promise<void>;

    $: color = entry.type === 0 ? 'teal' : entry.type === 1 ? 'violet' : 'pink';

    async function change_date() {
        await change_date_workflow(entry, write_metadata);
    }

    async function toggle_done(e: Event) {
        const checked = (e.target as any).checked;

        await toggle_done_workflow(entry, checked, move_file);
    }
</script>

<div
    class="flex text-neutral-900 cursor-pointer shadow-md rounded-lg overflow-hidden"
>
    <div
        class="w-7 px-1.5 flex items-center bg-{color}-600 bg-opacity-70 h-auto rounded-l-lg
                border border-solid border-{color}-600 border-opacity-0"
    >
        {#if entry.type === 0}
            <Checkbox checked={!!entry.done} on:change={toggle_done} />
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
        <div class="flex-1 px-3 py-2 flex flex-col gap-0.5">
            <div>
                {entry.name}
            </div>

            <Path parents={entry.parents} {open} size="s" />
        </div>

        <div class="flex items-center gap-1">
            {#if entry.type === 0}
                <DateIndicator
                    bind:date={entry.do_date}
                    on:changed={change_date}
                />
            {/if}
            {#if entry.type !== 2}
                <DateIndicator
                    due
                    bind:date={entry.due_date}
                    on:changed={change_date}
                />
            {/if}

            <div
                on:click={() => open(entry.file_path)}
                on:keyup
                class="w-7 flex items-center cursor-pointer pr-2"
            >
                <Open />
            </div>
        </div>
    </div>
</div>
