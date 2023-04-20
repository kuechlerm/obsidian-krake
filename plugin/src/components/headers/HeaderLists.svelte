<script lang="ts">
    import { isSameDay } from 'date-fns';
    import { by_date_property, get_collection } from '../../helper';
    import { db } from '../../stores/db';
    import type {
        DB,
        EntryType,
        Move_File,
        Open_File,
        Project,
        Task,
        Topic,
        Write_Metadata,
    } from '../../types';
    import ListEntry from '../ListEntry.svelte';
    import Check from '../icons/Check.svelte';

    export let filter_info:
        | { parent_file_path: string }
        | { due_date_before?: Date; do_date_before?: Date; done_on?: Date };

    export let hide_done: boolean = false;

    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;

    export let show_parents: boolean = false;

    $: filtered_topics = filter_entries($db, 2, hide_done).sort(
        by_date_property('created')
    );
    $: filtered_projects = filter_entries($db, 1, hide_done).sort(
        by_date_property('created')
    );
    $: filtered_tasks = filter_entries($db, 0, hide_done).sort(
        by_date_property('created')
    );

    function filter_entries(db: DB, list_entry_type: EntryType, done: boolean) {
        const collection = get_collection(db, list_entry_type) as (
            | Task
            | Project
            | Topic
        )[];

        collection.filter((entry) => entry.file_path === '/');

        let result;

        if ('parent_file_path' in filter_info) {
            const parent_path = filter_info.parent_file_path;

            result = collection.filter((entry) =>
                entry.parents.some((p) => p.file_path === parent_path)
            );
        } else {
            const { done_on, do_date_before, due_date_before } = filter_info;

            const by_dates = (entry: Task | Project | Topic) => {
                if (done_on && entry.done) {
                    return isSameDay(entry.done, done_on);
                } else {
                    if (
                        do_date_before &&
                        entry.type === 0 &&
                        entry.do_date &&
                        entry.do_date < do_date_before
                    )
                        return true;

                    if (
                        due_date_before &&
                        entry.type !== 2 &&
                        entry.due_date &&
                        entry.due_date < due_date_before
                    )
                        return true;
                }

                return false;
            };

            result = collection.filter(by_dates);
        }

        if (done) result = result.filter((entry) => !entry.done);

        return result;
    }
</script>

{#if filtered_topics.length || filtered_projects.length || filtered_tasks.length}
    <div class="space-y-1">
        <div class="flex justify-end">
            <div
                class="cursor-pointer flex items-center"
                class:opacity-20={!hide_done}
                on:click={() => (hide_done = !hide_done)}
                on:keyup
            >
                <Check classes="w-4" />
            </div>
        </div>

        <div class="space-y-2">
            {#if filtered_topics.length}
                <div class="space-y-2">
                    {#each filtered_topics as topic (topic.file_path)}
                        <ListEntry
                            entry={topic}
                            {show_parents}
                            {open}
                            {move_file}
                            {write_metadata}
                        />
                    {/each}
                </div>
            {/if}

            {#if filtered_projects.length}
                <div class="space-y-2">
                    {#each filtered_projects as project (project.file_path)}
                        <ListEntry
                            entry={project}
                            {show_parents}
                            {open}
                            {move_file}
                            {write_metadata}
                        />
                    {/each}
                </div>
            {/if}

            {#if filtered_tasks.length}
                <div class="space-y-2">
                    {#each filtered_tasks as task (task.file_path)}
                        <ListEntry
                            entry={task}
                            {show_parents}
                            {open}
                            {move_file}
                            {write_metadata}
                        />
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{/if}
