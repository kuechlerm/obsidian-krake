<script lang="ts">
	import { db } from '$lib/db_store';
	import Open from './icons/Open.svelte';
	import type { Topic } from '$lib/types';
	import Path from './subcomponents/Path.svelte';

	export let topic: Topic;
	export let open: (file_path: string) => void;
</script>

<div class="relative text-sm">
	<div
		class="flex items-center justify-between border border-solid rounded-lg border-pink-600 bg-pink-600/10 px-2 py-1"
	>
		<div class="flex items-center gap-0.5">
			<div>
				{topic.name}
			</div>

			<Path parents={topic.parents} {open} size="s" />
		</div>

		<div class="flex items-center gap-1">
			<div
				on:click={() => open(topic.file_path)}
				on:keyup
				class="w-5 flex items-center cursor-pointer"
			>
				<Open />
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
</style>
