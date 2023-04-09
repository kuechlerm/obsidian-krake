<script lang="ts">
    import { db } from '../stores/db';
    import { create_date_filter } from '../helper';

    import type { Task as TaskType, TaskBlockConfig } from '../types';
    import { isSameDay, parse } from 'date-fns';
    import Task from './Task.svelte';

    export let config: TaskBlockConfig;
    export let open: (path: string) => void;
    export let move_file: (from_path: string, to_path: string) => Promise<void>;
    export let write_metadata: (
        file_path: string,
        metadata: { [key: string]: string }
    ) => Promise<void>;

    function filter_tasks(tasks: TaskType[], config: TaskBlockConfig) {
        let filtered = tasks;

        if (config.done === 'true') {
            filtered = filtered.filter((task) => !!task.done);
        }

        if (config.done === 'false') {
            filtered = filtered.filter((task) => !task.done);
        }

        if (config.done?.startsWith('=')) {
            const done_date = parse(
                config.done.substring(1),
                'dd.MM.yyyy',
                new Date()
            );
            filtered = filtered.filter(
                (task) => !task.done || isSameDay(task.done, done_date)
            );
        }

        if (config.do_date) {
            const date_filter = create_date_filter(config.do_date);
            filtered = filtered.filter(
                (task) => !!task.do_date && date_filter(task.do_date)
            );
        }

        if (config.due_date) {
            const date_filter = create_date_filter(config.due_date);
            filtered = filtered.filter(
                (task) => !!task.due_date && date_filter(task.due_date)
            );
        }

        if (config.parent) {
            filtered = filtered.filter((task) =>
                task.parents.some((p) => p.name === config.parent)
            );
        }

        if (config.children) {
            filtered = filtered.filter((task) =>
                task.parents.some((p) => p.file_path === config.file_path)
            );
        }

        return filtered;
    }

    $: filered_tasks = filter_tasks($db.tasks, config);
</script>

<div class="tasks flex flex-col gap-2 mt-4">
    {#each filered_tasks as task (task.file_path)}
        <Task {task} {open} {move_file} {write_metadata} />
    {:else}
        <div class="text-neutral-400">No tasks found</div>
    {/each}
</div>
