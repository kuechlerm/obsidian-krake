<script lang="ts">
    import { toggle_done_workflow } from '../../workflows/toggle_done';
    import type { Entry } from '../../types';
    import Flag from '../icons/Flag.svelte';
    import Folder from '../icons/Folder.svelte';
    import Inbox from '../icons/Inbox.svelte';
    import Open from '../icons/Open.svelte';
    import Checkbox from '../subcomponents/Checkbox.svelte';

    export let entry: Entry;
    export let open: (file_path: string) => void;
    export let move_file: (from_path: string, to_path: string) => Promise<void>;

    export let selected: boolean = false;

    async function toggle_done(e: Event) {
        const checked = (e.target as any).checked;

        await toggle_done_workflow(entry, checked, move_file);
    }
</script>

<div
    class="flex gap-1 items-center justify-between p-2 border border-solid rounded-lg {entry.type ===
    0
        ? 'border-teal-600'
        : entry.type === 1
        ? 'border-violet-600'
        : 'border-pink-600'} {entry.type === 0
        ? 'bg-teal-600'
        : entry.type === 1
        ? 'bg-violet-600'
        : 'bg-pink-600'} bg-opacity-10 text-neutral-900 cursor-pointer"
    class:selected
    class:inbox={entry.name === 'Inbox'}
>
    <div class="flex items-center gap-1">
        <div class="w-5 flex items-center">
            {#if entry.type === 0}
                <Checkbox checked={!!entry.done} on:change={toggle_done} />
            {:else if entry.type === 1}
                <Flag />
            {:else if entry.name === 'Inbox'}
                <Inbox />
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

<style lang="postcss">
    .selected {
        @apply bg-opacity-50;
    }

    .inbox {
        @apply bg-blue-600/20 border-blue-600;
    }
</style>
