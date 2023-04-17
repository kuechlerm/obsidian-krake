<script lang="ts">
    import { db } from '../../stores/db';
    import { byStringProperty, get_collection } from '../../helper';
    import { paths } from '../../paths';
    import type {
        Child,
        Entry,
        Move_File,
        Open_File,
        Write_Metadata,
    } from '../../types';
    import { dragging_entry, drop, drag_over, drag_start } from './dnd';
    import OverviewEntry from './OverviewEntry.svelte';

    export let parent_entry: Entry & { children: Child[] };
    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;

    $: children = (parent_entry?.children ?? [])
        .map((c) =>
            get_collection($db, c.type).find((e) => e.file_path === c.file_path)
        )
        .filter((e?: Entry & { done?: Date }) => !!e && !e.done)
        .map((x) => x as Entry & { done?: Date })
        .sort(sort_entries);

    const sort_entries = (a: Entry, b: Entry) => {
        if (a.type > b.type) return -1;
        if (a.type < b.type) return 1;

        return byStringProperty('name')(a, b);
    };

    let selected_child: Entry | null = null;

    // TODO entry mit mehreren Parents später behandeln
    const can_drag = (entry: Entry) => entry.parents.length < 2;
</script>

<div
    class="flex flex-col gap-2 border border-solid rounded-lg border-slate-600/20 p-3 min-w-[160px]"
>
    {#each children as entry}
        <div
            draggable={can_drag(entry)}
            on:dragstart={drag_start(entry)}
            on:drop={drop(entry, $dragging_entry, write_metadata)}
            on:dragover={drag_over(entry, $dragging_entry)}
            on:click={() => (selected_child = entry)}
            on:keyup
        >
            <OverviewEntry
                {entry}
                {open}
                {move_file}
                {write_metadata}
                selected={entry.file_path === selected_child?.file_path}
            />
        </div>
    {/each}
</div>

{#if selected_child && !selected_child.file_path.startsWith(paths.task)}
    {#key selected_child}
        <svelte:self parent_entry={selected_child} {open} {move_file} />
    {/key}
{/if}
