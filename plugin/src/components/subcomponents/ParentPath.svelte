<script lang="ts">
    import type { Open_File, Parent } from '../../types';
    import { createEventDispatcher } from 'svelte';
    import XMark from '../icons/XMark.svelte';

    const dispatch = createEventDispatcher();

    export let parents: Parent[];
    export let open: Open_File;

    export let size: 's' | 'm' = 'm';
    export let can_remove: boolean = false;

    function get_parts(parent: Parent): Parent[] {
        return [parent, ...parent.parents.flatMap(get_parts)];
    }

    function open_parent(parent: Parent) {
        open(parent.file_path);
    }
</script>

{#if parents.length}
    <div class="flex gap-2 items-center">
        {#each parents as parent}
            {@const parts = get_parts(parent).reverse()}
            <div class="flex items-center">
                <div
                    class="flex items-baseline gap-0.5 {size === 's'
                        ? 'text-xs'
                        : 'text-sm'}"
                >
                    {#each parts as part, ii}
                        <!-- Tasks cannot be a Parent -->
                        <div
                            class="border-2 border-solid {part.type === 1
                                ? 'border-violet-300'
                                : 'border-pink-300'}
                                {part.type === 1
                                ? 'bg-violet-300'
                                : 'bg-pink-300'}
                                bg-opacity-10 hover:bg-opacity-50
                                rounded-lg px-1 py-0.5 cursor-pointer"
                            on:click={() => open_parent(part)}
                            on:keyup
                        >
                            {part.name}
                        </div>
                        {#if ii < parts.length - 1}
                            <div class="text-pink-600/40 text-base">/</div>
                        {/if}
                    {/each}
                </div>

                {#if can_remove && parent.name !== 'Inbox'}
                    <div on:click={() => dispatch('remove', parent)} on:keyup>
                        <XMark
                            classes="w-3.5 hover:text-red-600 cursor-pointer"
                        />
                    </div>
                {/if}
            </div>
        {/each}
    </div>
{/if}
