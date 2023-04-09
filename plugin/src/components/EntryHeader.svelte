<script lang="ts">
    import Checkbox from './subcomponents/Checkbox.svelte';
    import DateIndicator from './subcomponents/DateIndicator.svelte';
    import Add from './icons/Add.svelte';
    import Cog from './icons/Cog.svelte';
    import Eye from './icons/Eye.svelte';
    import Flag from './icons/Flag.svelte';
    import Path from './subcomponents/Path.svelte';
    import XMark from './icons/XMark.svelte';
    import Folder from './icons/Folder.svelte';
    import Trash from './icons/Trash.svelte';
    import IconButton from './subcomponents/IconButton.svelte';
    import Pen from './icons/Pen.svelte';
    import Flyout from './subcomponents/Flyout.svelte';
    import type { Entry, Parent } from '../types';
    import { paths } from '../paths';
    import { days_ago_text, get_collection } from '../helper';
    import { db } from '../stores/db';

    export let path: string;
    // TODO alle actions zu db-store/adapter schieben
    export let open: (file_path: string) => void;
    export let suggest_project: (
        exclude_paths: string[]
    ) => Promise<Omit<Parent, 'parents'>>;
    export let suggest_topic: (
        exclude_paths: string[]
    ) => Promise<Omit<Parent, 'parents'>>;
    export let move_file: (from_path: string, to_path: string) => Promise<void>;
    export let delete_file: (file_path: string) => Promise<void>;

    $: entry_type = (
        path.startsWith(paths.task) ? 0 : path.startsWith(paths.project) ? 1 : 2
    ) as 0 | 1 | 2;
    $: color = entry_type === 0 ? 'teal' : entry_type === 1 ? 'violet' : 'pink';
    $: entry = get_collection($db, entry_type).find(
        (t) => t.file_path === path
    ) as (Entry & { do_date?: Date; due_date?: Date }) | undefined;

    let actions_visible = false;
    let show_entry_picker = false;

    async function save() {
        if (entry_type === 0) $db.tasks = $db.tasks;
        if (entry_type === 1) $db.projects = $db.projects;
        if (entry_type === 2) $db.topics = $db.topics;
    }

    async function toggle_done(e: Event) {
        if (!entry) return;

        const checked = (e.target as any).checked;

        const old_path = entry.file_path;
        db.toggle_done(entry, checked);
        const new_path = entry.file_path;
        await move_file(old_path, new_path);
    }

    function toggle_actions() {
        actions_visible = !actions_visible;
    }

    async function add_project_parent() {
        if (!entry) return;

        const parent_info = await suggest_project(
            entry.parents.map((p) => p.file_path)
        );
        await db.add_parent(entry, parent_info);

        actions_visible = false;
    }

    async function add_topic_parent() {
        if (!entry) return;

        const parent_info = await suggest_topic(
            entry.parents.map((p) => p.file_path)
        );
        await db.add_parent(entry, parent_info);

        actions_visible = false;
    }

    async function remove_parent(e: { detail: Parent }) {
        if (!entry) return;
        const parent = e.detail;

        await db.remove_parent(entry, parent);
    }

    async function delete_entry() {
        if (!entry) return;

        await delete_file(entry.file_path);
        await db.remove_entry(entry);
    }

    async function change_type(to: 0 | 1 | 2) {
        if (!entry) return;

        const map_path = (type: 0 | 1 | 2) =>
            type === 0 ? paths.task : type === 1 ? paths.project : paths.topic;
        const new_path = entry.file_path.replace(
            map_path(entry.type),
            map_path(to)
        );

        await move_file(entry.file_path, new_path);

        await db.change_type(entry, to, new_path);
    }
</script>

<div
    class="rounded-lg p-2 bg-{color}-600 bg-opacity-10 border border-solid border-{color}-600 space-y-2 mt-4"
>
    {#if entry}
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                {#if entry_type !== 2}
                    <Checkbox checked={!!entry.done} on:change={toggle_done} />
                {/if}

                <Path
                    parents={entry.parents}
                    {open}
                    can_remove
                    on:remove={remove_parent}
                />
            </div>

            <div class="flex gap-1">
                <div
                    class="flex items-center gap-1 bg-neutral-100 rounded-lg px-1 py-1.5 text-sm"
                >
                    <div class="w-5 flex items-center">
                        <Add />
                    </div>

                    {#if entry.created}
                        {days_ago_text(entry.created)}
                    {/if}
                </div>
                <div
                    class="flex items-center gap-1 bg-neutral-100 rounded-lg px-1 py-1.5 text-sm"
                >
                    <div class="w-5 flex items-center">
                        <Eye />
                    </div>

                    {days_ago_text(entry.last_review)}
                </div>

                {#if entry_type !== 2}
                    <DateIndicator
                        bind:date={entry.do_date}
                        on:changed={save}
                    />
                    <DateIndicator
                        due
                        bind:date={entry.due_date}
                        on:changed={save}
                    />
                {/if}

                <IconButton color="slate" on:click={toggle_actions}>
                    {#if actions_visible}
                        <XMark />
                    {:else}
                        <Cog />
                    {/if}
                </IconButton>
            </div>
        </div>

        {#if actions_visible}
            <div class="flex justify-end gap-2 items-enter">
                <IconButton color="red" on:click={delete_entry}>
                    <Trash />
                </IconButton>

                <Flyout target="entry_picker" bind:show={show_entry_picker}>
                    <div class="flex flex-col gap-1">
                        {#if entry_type !== 0}
                            <div
                                class="bg-neutral-700 text-neutral-50 rounded-lg px-2 py-1 cursor-pointer"
                                on:click={() => change_type(0)}
                                on:keyup
                            >
                                to Task
                            </div>
                        {/if}

                        {#if entry_type !== 1}
                            <div
                                class="bg-neutral-700 text-neutral-50 rounded-lg px-2 py-1 cursor-pointer"
                                on:click={() => change_type(1)}
                                on:keyup
                            >
                                to Project
                            </div>
                        {/if}

                        {#if entry_type !== 2}
                            <div
                                class="bg-neutral-700 text-neutral-50 rounded-lg px-2 py-1 cursor-pointer"
                                on:click={() => change_type(2)}
                                on:keyup
                            >
                                to Topic
                            </div>
                        {/if}
                    </div>
                </Flyout>

                <IconButton
                    id="entry_picker"
                    color="sky"
                    on:click={() => (show_entry_picker = true)}
                >
                    <Pen />
                </IconButton>

                {#if entry_type !== 2}
                    <IconButton color="violet" on:click={add_project_parent}>
                        <Flag />
                    </IconButton>
                {/if}

                <IconButton color="pink" on:click={add_topic_parent}>
                    <Folder />
                </IconButton>
            </div>
        {/if}
    {:else}
        Error. Entry not found.
    {/if}
</div>
