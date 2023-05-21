<script lang="ts">
    import { onMount } from 'svelte';
    import type { Content, Story } from './types';
    import Card from './Card.svelte';
    import { fly } from 'svelte/transition';

    export let get_content: () => Content;
    export let set_content: (content: Content) => void;

    let content: Content | null = null;
    let selected_story: Story | null = null;

    // TODO move to Component
    let edit_card_titel = false;
    let titel_input: HTMLInputElement;

    onMount(async () => {
        // wir müssen immer auf den Content warten
        await new Promise((r) => setTimeout(r, 200));

        content = get_content();
        console.log('content', content);
    });

    function add_story() {
        if (!content) return;

        content.stories = [
            ...content.stories,
            {
                titel: 'Neue Story ' + (content.stories.length + 1),
                position: { x: 0, y: 0 },
            },
        ];

        set_content(content);
    }

    function edit_titel() {
        edit_card_titel = true;

        setTimeout(() => titel_input.focus(), 100);
    }

    function edit_card_done() {
        if (!content || !selected_story) return;

        edit_card_titel = false;

        content.stories = content.stories;
        set_content(content);
    }
</script>

{#if content}
    <div class=" h-full flex flex-col gap-2">
        <div class="flex gap-8">
            <button on:click={add_story}>Add Story</button>
        </div>

        <div
            class="relative flex-1 border border-solid border-neutral-300"
            on:click|self={() => (selected_story = null)}
            on:keyup
        >
            {#each content.stories as story}
                <Card
                    {story}
                    on:select={() => (selected_story = story)}
                    on:dblclick={edit_titel}
                />
            {/each}

            {#if selected_story}
                <!-- {#key !edit_card_titel || selected_story.titel} -->
                <div
                    class="absolute right-0 top-0 bottom-0 border-0 border-l border-solid border-neutral-600 bg-neutral-200 w-[20%]"
                    transition:fly={{ x: 100, duration: 300 }}
                >
                    <div class="px-8 p-4">
                        {#if edit_card_titel}
                            <input
                                bind:this={titel_input}
                                type="text"
                                bind:value={selected_story.titel}
                                on:blur={edit_card_done}
                            />
                        {:else}
                            <div class="text-xl">
                                {selected_story.titel}
                            </div>
                        {/if}
                    </div>
                </div>
                <!-- {/key} -->
            {/if}
        </div>
    </div>
{/if}
