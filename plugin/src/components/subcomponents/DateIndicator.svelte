<script lang="ts">
    import { differenceInCalendarDays } from 'date-fns';
    import { createEventDispatcher } from 'svelte';
    import CalendarClock from '../icons/Calendar_Clock.svelte';
    import CalendarCheck from '../icons/Calendar_Check.svelte';
    import CalendarFlyout from './CalendarFlyout.svelte';

    const dispatch = createEventDispatcher();

    export let date: Date | undefined;
    // do / due date
    export let due: boolean = false;
    export let muted: boolean = false;

    let target_element: HTMLElement;
    let show_picker = false;

    $: distance = date ? differenceInCalendarDays(date, new Date()) : 0;
    $: distance_text = distance ? `${distance}d` : 'today';

    function date_changed() {
        show_picker = false;
        dispatch('changed');
    }
</script>

<CalendarFlyout
    {target_element}
    bind:show={show_picker}
    bind:selectedDate={date}
    on:select={date_changed}
/>

<div
    bind:this={target_element}
    class="flex items-center gap-1 cursor-pointer text-slate-900 hover:text-opacity-100"
    class:text-opacity-30={muted && !date}
    class:past={distance < 0}
    on:click={() => (show_picker = true)}
    on:keyup
>
    {#if due}
        <CalendarCheck classes="w-5" />
    {:else}
        <CalendarClock classes="w-5" />
    {/if}

    {#if date}
        <div class="text-sm font-light">
            {distance_text}
        </div>
    {/if}
</div>

<style lang="postcss">
    .past {
        @apply font-extrabold italic;
    }
</style>
