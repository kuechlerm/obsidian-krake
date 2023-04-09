<script lang="ts">
    import { db } from '../../stores/db';
    import { byStringProperty, get_collection } from '../../helper';
    import { paths } from '../../paths';
    import type { Child, Entry } from '../../types';
    import Flag from '../icons/Flag.svelte';
    import Folder from '../icons/Folder.svelte';
    import Open from '../icons/Open.svelte';
    import Checkbox from '../subcomponents/Checkbox.svelte';
    import { dragging_entry, drop, drag_over, drag_start } from './dnd';

    export let parent_entry: Entry & { children: Child[] };
    export let open: (file_path: string) => void;
    export let move_file: (from_path: string, to_path: string) => Promise<void>;

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

    const toggle_done = (task: any) => async (e: Event) => {
        const checked = (e.target as any).checked;

        const old_path = task.file_path;
        db.toggle_done(task, checked);
        const new_path = task.file_path;
        await move_file(old_path, new_path);
    };
</script>

<div
    class="flex flex-col gap-2 border border-solid p-2 rounded-lg bg-neutral-100 min-w-[100px]"
>
    {#each children as entry}
        <div
            draggable={can_drag(entry)}
            on:dragstart={drag_start(entry)}
            on:drop={drop(entry, $dragging_entry)}
            on:dragover={drag_over(entry, $dragging_entry)}
            class="flex gap-1 items-center justify-between p-2 border border-solid rounded-lg cursor-pointer {entry.type ===
            0
                ? 'border-teal-600'
                : entry.type === 1
                ? 'border-violet-600'
                : 'border-pink-600'} {entry.type === 0
                ? 'bg-teal-600'
                : entry.type === 1
                ? 'bg-violet-600'
                : 'bg-pink-600'} bg-opacity-10 text-neutral-900"
            class:selected={selected_child?.file_path === entry?.file_path}
            on:click={() => (selected_child = entry)}
            on:keyup
        >
            <div class="flex items-center gap-1">
                <div class="w-5 flex items-center">
                    {#if entry.type === 0}
                        <Checkbox
                            checked={!!entry.done}
                            on:change={toggle_done(entry)}
                        />
                    {:else if entry.type === 1}
                        <Flag />
                    {:else}
                        <Folder />
                    {/if}
                </div>
                {entry.name}
            </div>

            <div
                on:click={() => open(entry.file_path)}
                on:keyup
                class="w-5 flex items-center cursor-pointer"
            >
                <Open />
            </div>
        </div>
    {/each}
</div>

{#if selected_child && !selected_child.file_path.startsWith(paths.task)}
    {#key selected_child}
        <svelte:self parent_entry={selected_child} {open} {move_file} />
    {/key}
{/if}

<style lang="postcss">
    .selected {
        @apply bg-opacity-50;
    }
</style>
