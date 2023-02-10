<script lang="ts">
	export let checked: boolean;
	export let readonly: boolean = false;

	export let color: string = 'teal-500';
</script>

<label class="flex gap-1.5">
	<input
		type="checkbox"
		bind:checked
		class:checked
		disabled={readonly}
		class="focus:ring-{color} disabled:text-{color}"
		on:change
	/>
	<span>
		<slot />
	</span>
</label>

<style lang="postcss">
	input[type='checkbox'],
	input[type='checkbox']:disabled {
		@apply bg-neutral-100 border-neutral-500 text-teal-500 rounded-md cursor-pointer;
	}

	input[type='checkbox'].checked {
		@apply bg-teal-500 border-teal-500;
	}
</style>
