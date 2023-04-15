<script lang="ts">
    import { differenceInCalendarDays, format, parse } from 'date-fns';
    import { createEventDispatcher } from 'svelte';
    import CalendarClock from '../icons/Calendar_Clock.svelte';
    import CalendarCheck from '../icons/Calendar_Check.svelte';

    const dispatch = createEventDispatcher();

    export let date: Date | undefined;
    // do / due date
    export let due: boolean = false;
    export let muted: boolean = false;

    const picker_format = 'yyyy-MM-dd';
    let picker: HTMLInputElement;
    let input_value: string;

    const input = (x?: Date) =>
        (input_value = x ? format(x, picker_format) : '');
    const output = (x: string) => {
        date = x ? parse(x, picker_format, new Date()) : undefined;
        dispatch('changed');
    };

    $: input(date);
    $: output(input_value);

    $: distance = date ? differenceInCalendarDays(date, new Date()) : 0;
    $: distance_text = distance ? `${distance}d` : 'today';
</script>

<div
    class="flex items-center gap-1 cursor-pointer text-slate-900 hover:text-opacity-100"
    class:text-opacity-30={muted && !date}
    class:past={distance < 0}
    on:click={() => picker.showPicker()}
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

    <!-- invisible absolute ist der einzige Weg, dass das blöde Input nicht im Weg ist -->
    <input
        type="date"
        class="invisible absolute"
        bind:this={picker}
        bind:value={input_value}
    />
</div>

<style lang="postcss">
    .past {
        @apply font-extrabold italic;
    }
</style>
