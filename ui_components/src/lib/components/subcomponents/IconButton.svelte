<script lang="ts">
	export let color: string;
	export let id: string | null = null;
</script>

<div
	{id}
	class="flex items-center border border-solid border-{color}-600 bg-{color}-600 bg-opacity-30 rounded-lg px-1.5 py-1 cursor-pointer"
	on:click
	on:keyup
>
	<div class="w-5 flex items-center">
		<slot />
	</div>
</div>
