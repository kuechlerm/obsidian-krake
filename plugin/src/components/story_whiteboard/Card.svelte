<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Story } from './types';

    const dispatch = createEventDispatcher();

    export let story: Story;

    let dragging = false;

    let moved = false;

    function start_dragging() {
        dragging = true;
        moved = false;

        document.body.addEventListener('mousemove', mouse_move);
        document.body.addEventListener('mouseup', mouse_up);
    }

    let start_movement = 0;

    function mouse_move(event: MouseEvent) {
        if (!dragging) return;

        start_movement += Math.abs(event.movementX);
        start_movement += Math.abs(event.movementY);

        // verhindern, dass Auswahl von Bewegung ist
        if (!moved && start_movement < 10) return;

        moved = true;

        story.position.x += event.movementX;
        story.position.y += event.movementY;
    }

    function mouse_up() {
        dragging = false;
        start_movement = 0;

        document.body.removeEventListener('mousemove', mouse_move);
        document.body.removeEventListener('mouseup', mouse_up);

        if (!moved) dispatch('select');
        moved = false;
    }
</script>

<div
    class="absolute border border-solid border-neutral-500 bg-neutral-300 rounded-md p-4 cursor-pointer"
    style="transform: translate({story.position.x}px, {story.position.y}px)"
    class:moved
    on:mousedown|stopPropagation={start_dragging}
    on:dblclick
>
    {story.titel}
</div>

<style lang="postcss">
    .moved {
        @apply cursor-move;
    }
</style>
