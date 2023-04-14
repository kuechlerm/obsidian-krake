<script lang="ts">
    import type {
        Move_File,
        Open_File,
        Project,
        Write_Metadata,
    } from '../types';
    import Checkbox from './subcomponents/Checkbox.svelte';
    import DateIndicator from './subcomponents/DateIndicator.svelte';
    import Open from './icons/Open.svelte';
    import Path from './subcomponents/Path.svelte';
    import { db } from '../stores/db';

    export let project: Project;
    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;

    async function save() {
        $db.projects = $db.projects;

        const metadata: any = {};
        if (project.due_date)
            metadata['due_date'] = project.due_date.getTime().toString();

        // TODO fires 3 times!?
        await write_metadata(project.file_path, metadata);
    }

    async function toggle_done(e: Event) {
        const checked = (e.target as any).checked;

        const old_path = project.file_path;
        db.toggle_done(project, checked);
        const new_path = project.file_path;
        await move_file(old_path, new_path);
    }
</script>

<div class="relative text-sm">
    {#if project.done}
        <div
            class="absolute inset-0 flex items-center bg-neutral-100/70 rounded-lg px-2 py-4"
        >
            <div class="inline w-min">
                <Checkbox checked={!!project.done} on:change={toggle_done} />
            </div>
        </div>
    {/if}

    <div
        class="flex items-center justify-between border border-solid border-violet-600 rounded-lg bg-violet-600/10 px-2 py-1"
    >
        <div class="flex items-center gap-1">
            <Checkbox checked={!!project.done} on:change={toggle_done} />
            <div class="flex flex-col gap-0.5">
                <div>
                    {project.name}
                </div>

                <Path parents={project.parents} {open} size="s" />
            </div>
        </div>

        <div class="flex items-center gap-1">
            <DateIndicator due bind:date={project.due_date} on:changed={save} />

            <div
                on:click={() => open(project.file_path)}
                on:keyup
                class="w-5 flex items-center cursor-pointer"
            >
                <Open />
            </div>
        </div>
    </div>
</div>

<style lang="postcss">
</style>
