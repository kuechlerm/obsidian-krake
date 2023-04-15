<script lang="ts">
    import { db } from '../../stores/db';
    import { byStringProperty } from '../../helper';
    import type {
        Child,
        Entry,
        Move_File,
        Open_File,
        Topic,
        Write_Metadata,
    } from '../../types';
    import Column from './Column.svelte';
    import { dragging_entry, drop, drag_over, drag_start } from './dnd';
    import OverviewEntry from './OverviewEntry.svelte';

    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;

    $: first_level_topics = $db.topics
        .filter((t) => t.parents.length === 0)
        .sort(sort_topic);

    let selected_entry: (Entry & { children: Child[] }) | null = null;

    const sort_topic = (a: Topic, b: Topic) => {
        if (a.name === 'Inbox') return -1;
        if (b.name === 'Inbox') return 1;

        return byStringProperty('name')(a, b);
    };
</script>

<div class="flex gap-4 align-stretch">
    <div
        class="flex flex-col gap-2 border border-solid border-slate-600/20 p-3 rounded-lg"
    >
        {#each first_level_topics as topic}
            <div
                on:click={() => (selected_entry = topic)}
                on:keyup
                on:dragstart={drag_start(topic)}
                on:drop={drop(topic, $dragging_entry)}
                on:dragover={drag_over(topic, $dragging_entry)}
            >
                <OverviewEntry
                    entry={topic}
                    {open}
                    {move_file}
                    {write_metadata}
                    selected={topic.file_path === selected_entry?.file_path}
                />
            </div>
        {/each}
    </div>

    {#if selected_entry}
        {#key selected_entry}
            <Column
                parent_entry={selected_entry}
                {move_file}
                {open}
                {write_metadata}
            />
        {/key}
    {/if}
</div>
