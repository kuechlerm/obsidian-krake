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
    import type { Entry, Parent, EntryType } from '../types';
    import { paths } from '../paths';
    import {
        days_ago_text,
        get_collection,
        name_from_file_path,
    } from '../helper';
    import { db } from '../stores/db';
    import { toggle_done_workflow } from '../workflows/toggle_done';
    import { delete_entry_workflow } from '../workflows/delete_entry';

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
    export let write_metadata: (
        file_path: string,
        metadata: { [key: string]: string }
    ) => Promise<void>;

    $: entry_type = (
        path.startsWith(paths.task) ? 0 : path.startsWith(paths.project) ? 1 : 2
    ) as EntryType;
    $: color = entry_type === 0 ? 'teal' : entry_type === 1 ? 'violet' : 'pink';
    $: entry = get_collection($db, entry_type).find(
        (t) => t.file_path === path
    ) as (Entry & { do_date?: Date; due_date?: Date }) | undefined;

    let actions_visible = false;
    let show_entry_picker = false;

    async function save() {
        if (!entry) return;

        if (entry_type === 0) $db.tasks = $db.tasks;
        if (entry_type === 1) $db.projects = $db.projects;
        if (entry_type === 2) $db.topics = $db.topics;

        const metadata: any = {};
        if (entry.do_date)
            metadata['do_date'] = entry.do_date.getTime().toString();
        if (entry.due_date)
            metadata['due_date'] = entry.due_date.getTime().toString();

        // TODO fires 3 times!?
        await write_metadata(entry.file_path, metadata);
    }

    async function toggle_done(e: Event) {
        if (!entry) return;

        const checked = (e.target as any).checked;

        await toggle_done_workflow(entry, checked, move_file);
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

        const parent = $db.projects.find(
            (p) => p.file_path === parent_info.file_path
        );

        if (parent) {
            const children = [
                ...parent.children.map(
                    (c) => `${c.type},${name_from_file_path(c.file_path)}`
                ),
            ]
                .filter(Boolean)
                .join(';');

            await write_metadata(parent_info.file_path, {
                children,
            });
        }

        actions_visible = false;
    }

    async function add_topic_parent() {
        if (!entry) return;

        const parent_info = await suggest_topic(
            entry.parents.map((p) => p.file_path)
        );
        await db.add_parent(entry, parent_info);

        const parent = $db.topics.find(
            (p) => p.file_path === parent_info.file_path
        );

        if (parent) {
            const children = [
                ...parent.children.map(
                    (c) => `${c.type},${name_from_file_path(c.file_path)}`
                ),
            ]
                .filter(Boolean)
                .join(';');

            await write_metadata(parent_info.file_path, {
                children,
            });
        }

        actions_visible = false;
    }

    async function remove_parent(e: { detail: Parent }) {
        if (!entry) return;
        const parent = e.detail;

        await db.remove_parent(entry, parent);
    }

    async function delete_entry() {
        if (!entry) return;

        await delete_entry_workflow(entry, delete_file, write_metadata);
    }

    async function change_type(to: EntryType) {
        if (!entry) return;

        const map_path = (type: EntryType) =>
            type === 0 ? paths.task : type === 1 ? paths.project : paths.topic;
        const new_path = entry.file_path.replace(
            map_path(entry.type),
            map_path(to)
        );

        await move_file(entry.file_path, new_path);

        await db.change_type(entry, to, new_path);
    }
</script>

<!-- need this frame to simulate the code-block in obsidian  -->
<div class="p-2 overflow-hidden">
    <div
        class="rounded-lg overflow-hidden pr-2 bg-slate-400 bg-opacity-10 border border-solid border-{color}-600 space-y-2 mt-4 shadow-md"
    >
        {#if entry}
            <div class="flex gap-2">
                <div class="bg-{color}-600 bg-opacity-70 h-auto w-3" />

                <div class="flex-1 py-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        {#if entry_type !== 2}
                            <Checkbox
                                checked={!!entry.done}
                                on:change={toggle_done}
                            />
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

                        {#if entry_type === 0}
                            <DateIndicator
                                bind:date={entry.do_date}
                                on:changed={save}
                            />
                        {/if}
                        {#if entry_type !== 2}
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
                        <IconButton
                            color="violet"
                            on:click={add_project_parent}
                        >
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
</div>
