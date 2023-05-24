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

    let can_pan = false;
    function set_key(e: KeyboardEvent) {
        if (e.code === 'Space') {
            can_pan = true;
        }
    }

    function unset_key(e: KeyboardEvent) {
        can_pan = false;
    }

    let canvas_position = { x: 0, y: 0 };

    let dragging = false;

    function start_dragging() {
        dragging = can_pan;
    }

    function drag(event: MouseEvent) {
        if (!dragging) return;

        canvas_position.x += event.movementX;
        canvas_position.y += event.movementY;
    }

    function stop_dragging() {
        dragging = false;
    }

    let zoom_level = 1;

    function zoom(direction: 'in' | 'out') {
        if (direction === 'in') {
            zoom_level += 0.1;
        } else {
            zoom_level -= 0.1;
        }

        zoom_level = Math.round(zoom_level * 10) / 10;

        if (zoom_level < 0.1) zoom_level = 0.1;

        console.log('ZOOM', zoom_level);
    }
</script>

<svelte:body on:keydown={set_key} on:keyup={unset_key} />

{#if content}
    <div class=" h-full flex flex-col gap-2">
        <div class="flex gap-8">
            <button on:click={add_story}>Add Story</button>
        </div>

        <div
            id="canvas-wrapper"
            class="relative flex-1 border border-solid border-neutral-300 overflow-hidden"
            on:click|self={() => (selected_story = null)}
            on:mousedown={start_dragging}
            on:mousemove={drag}
            on:mouseup={stop_dragging}
            on:keyup
        >
            <svg class="absolute inset-0 h-full w-full"
                ><pattern
                    id="canvas-background-pattern"
                    patternUnits="userSpaceOnUse"
                    x={canvas_position.x}
                    y={canvas_position.y}
                    width="17.013343219017127"
                    height="17.013343219017127"
                    ><circle
                        class="stroke-neutral-300"
                        cx="0.7"
                        cy="0.7"
                        r="0.7"
                    /></pattern
                ><rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#canvas-background-pattern)"
                /></svg
            >

            <!-- <svg class="absolute inset-0 h-full w-full">
            <line
                x1={content.stories.at(0)?.position.x}
                y1={content.stories[0].position.y}
                x2={content.stories.at(1)?.position.x}
                y2={content.stories[1].position.y}
                stroke="black"
            />
        </svg> -->

            <div
                id="canvas"
                class="absolute w-full h-full"
                style="transform: translate({canvas_position.x}px, {canvas_position.y}px) scale({zoom_level})"
                class:cursor-move={can_pan}
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

            <div id="canvas-menu" class="absolute right-2 top-2">
                <div class="flex flex-col gap-2">
                    <button
                        class="cursor-pointer bg-neutral-200"
                        on:click={() => zoom('in')}>+</button
                    >
                    <button
                        class="cursor-pointer bg-neutral-200"
                        on:click={() => zoom('out')}>-</button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}

<style lang="postcss">
</style>
