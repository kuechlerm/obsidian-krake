<script lang="ts">
	import { differenceInCalendarDays, format, parse } from 'date-fns';
	import { createEventDispatcher } from 'svelte';
	import Calendar from '../icons/Calendar.svelte';

	const dispatch = createEventDispatcher();

	export let date: Date | undefined;
	// do / due date
	export let due: boolean = false;

	const picker_format = 'yyyy-MM-dd';
	let picker: HTMLInputElement;
	let input_value: string;

	const input = (x?: Date) => (input_value = x ? format(x, picker_format) : '');
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
	class="flex items-center gap-0.5 rounded-lg px-1.5 py-1 cursor-pointer {due
		? 'bg-orange-500/30 border-orange-500'
		: 'bg-sky-500/30 border-sky-500'} text-neutral-900
		border border-solid"
	class:past={distance < 0}
	on:click={() => picker.showPicker()}
	on:keyup
>
	<Calendar classes="w-5" />

	{#if date}
		<div class="text-sm">
			{distance_text}
		</div>
	{/if}

	<!-- invisible absolute ist der einzige Weg, dass das blöde Input nicht im Weg ist -->
	<input type="date" class="invisible absolute" bind:this={picker} bind:value={input_value} />
</div>

<style lang="postcss">
	.past {
		@apply font-extrabold italic;
	}
</style>
