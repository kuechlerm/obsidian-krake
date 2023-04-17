<script lang="ts">
    import Checkbox from '../subcomponents/Checkbox.svelte';
    import DateIndicator from '../subcomponents/DateIndicator.svelte';
    import Add from '../icons/Add.svelte';
    import Cog from '../icons/Cog.svelte';
    import Eye from '../icons/Eye.svelte';
    import Flag from '../icons/Flag.svelte';
    import ParentPath from '../subcomponents/ParentPath.svelte';
    import XMark from '../icons/XMark.svelte';
    import Folder from '../icons/Folder.svelte';
    import Trash from '../icons/Trash.svelte';
    import Pen from '../icons/Pen.svelte';
    import Flyout from '../subcomponents/Flyout.svelte';
    import type {
        Task,
        Project,
        Topic,
        Parent,
        EntryType,
        Write_Metadata,
        Move_File,
        Open_File,
        Delete_File,
        Suggest_Parent,
    } from '../../types';
    import { paths } from '../../paths';
    import { days_ago_text, get_collection } from '../../helper';
    import { db } from '../../stores/db';
    import { toggle_done_workflow } from '../../workflows/toggle_done';
    import { delete_entry_workflow } from '../../workflows/delete_entry';
    import { add_parent_workflow } from '../../workflows/add_parent';
    import Inbox from '../icons/Inbox.svelte';
    import { change_date_workflow } from '../../workflows/change_date';
    import HeaderFrame from './HeaderFrame.svelte';
    import HeaderLists from './HeaderLists.svelte';
    import Check from '../icons/Check.svelte';
    import HoverContent from '../subcomponents/HoverContent.svelte';
    import Sprout from '../icons/Sprout.svelte';
    import { remove_parent_workflow } from '../../workflows/remove_parent';

    export let path: string;
    // TODO alle actions zu db-store/adapter schieben
    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;
    export let suggest_parent: Suggest_Parent;
    export let delete_file: Delete_File;

    let hide_done = true;

    // TODO path_to_collection?
    $: entry_type = (
        path.startsWith(paths.task) ? 0 : path.startsWith(paths.project) ? 1 : 2
    ) as EntryType;

    $: entry = get_collection($db, entry_type).find(
        (t) => t.file_path === path
    ) as Task | Project | Topic | undefined;

    $: color = entry_type === 0 ? 'teal' : entry_type === 1 ? 'violet' : 'pink';

    let actions_visible = false;
    let show_entry_picker = false;

    async function change_date() {
        if (!entry) return;

        change_date_workflow(entry, write_metadata);
    }

    async function toggle_done(e: { detail: boolean }) {
        if (!entry) return;

        console.log('ping', e);
        const checked = e.detail;

        await toggle_done_workflow(entry, checked, move_file, write_metadata);
    }

    function toggle_actions() {
        actions_visible = !actions_visible;
    }

    async function add_project_parent() {
        if (!entry) return;

        await add_parent_workflow(entry, 1, suggest_parent, write_metadata);

        actions_visible = false;
    }

    async function add_topic_parent() {
        if (!entry) return;

        await add_parent_workflow(entry, 2, suggest_parent, write_metadata);

        actions_visible = false;
    }

    async function remove_parent(e: { detail: Parent }) {
        if (!entry) return;
        const parent = e.detail;

        // TODO move to workflow?
        const parent_entry = get_collection($db, parent.type).find(
            (t) => t.file_path === parent.file_path
        ) as Project | Topic | undefined;

        if (!parent_entry) throw new Error('Parent not found');

        await remove_parent_workflow(entry, parent_entry, write_metadata);
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

        db.change_type(entry, to, new_path);
    }
</script>

<HeaderFrame>
    {#if entry}
        <div class="flex gap-2">
            <div
                class="w-10 px-2.5 flex items-center bg-{color}-600 bg-opacity-70 h-auto rounded-br-lg"
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
                    <HoverContent>
                        <Flag classes="text-white" />

                        <Checkbox
                            slot="hover_content"
                            checked={!!entry.done}
                            on:changed={toggle_done}
                        />
                    </HoverContent>
                {:else if entry.name === 'Inbox'}
                    <Inbox classes="text-white" />
                {:else}
                    <Folder classes="text-white" />
                {/if}
            </div>

            <div class="flex-1 pr-4 py-2 flex items-center justify-end">
                <div class="flex gap-3 items-center">
                    <div class="flex items-center gap-1 text-sm font-light">
                        <div class="w-5 flex items-center">
                            <Add />
                        </div>

                        {#if entry.created}
                            {days_ago_text(entry.created)}
                        {/if}
                    </div>
                    <div class="flex items-center gap-1 text-sm font-light">
                        <div class="w-5 flex items-center">
                            <Eye />
                        </div>

                        {days_ago_text(entry.last_review)}
                    </div>

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
                        class="w-5 flex items-center cursor-pointer text-slate-900"
                        on:click={toggle_actions}
                        on:keyup
                    >
                        {#if actions_visible}
                            <XMark />
                        {:else}
                            <Cog />
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        {#if actions_visible}
            <div class="flex justify-end gap-2 items-enter pr-4">
                <div
                    class="w-5 flex items-center cursor-pointer text-slate-900"
                    on:click={delete_entry}
                    on:keyup
                >
                    <Trash />
                </div>

                <Flyout target="entry_picker" bind:show={show_entry_picker}>
                    <div class="flex flex-col gap-1">
                        {#if entry_type !== 0}
                            <div
                                class="bg-slate-50 text-slate-900 rounded-lg px-2 py-1 cursor-pointer"
                                on:click={() => change_type(0)}
                                on:keyup
                            >
                                to Task
                            </div>
                        {/if}

                        {#if entry_type !== 1}
                            <div
                                class="bg-slate-50 text-slate-900 rounded-lg px-2 py-1 cursor-pointer"
                                on:click={() => change_type(1)}
                                on:keyup
                            >
                                to Project
                            </div>
                        {/if}

                        {#if entry_type !== 2}
                            <div
                                class="bg-slate-50 text-slate-900 rounded-lg px-2 py-1 cursor-pointer"
                                on:click={() => change_type(2)}
                                on:keyup
                            >
                                to Topic
                            </div>
                        {/if}
                    </div>
                </Flyout>

                <div
                    id="entry_picker"
                    class="w-5 flex items-center cursor-pointer text-slate-900"
                    on:click={() => (show_entry_picker = true)}
                    on:keyup
                >
                    <Pen />
                </div>

                {#if entry_type !== 2}
                    <div
                        class="w-5 flex items-center cursor-pointer text-slate-900"
                        on:click={add_project_parent}
                        on:keyup
                    >
                        <Flag />
                    </div>
                {/if}

                <div
                    class="w-5 flex items-center cursor-pointer text-slate-900"
                    on:click={add_topic_parent}
                    on:keyup
                >
                    <Folder />
                </div>
            </div>
        {/if}

        <div class="p-4">
            <div class="flex items-end justify-between">
                <div class="">
                    <ParentPath
                        parents={entry.parents}
                        {open}
                        can_remove
                        on:remove={remove_parent}
                    />
                </div>
            </div>

            <HeaderLists
                filter_info={{ parent_file_path: entry.file_path }}
                {hide_done}
                {open}
                {move_file}
                {write_metadata}
            />
        </div>
    {:else}
        Error. Entry not found.
    {/if}
</HeaderFrame>
