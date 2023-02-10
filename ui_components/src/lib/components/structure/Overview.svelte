<script lang="ts">
	import { db } from '$lib/db_store';
	import { byStringProperty } from '$lib/helper';
	import type { Child, Entry, Topic } from '$lib/types';
	import Folder from '../icons/Folder.svelte';
	import Inbox from '../icons/Inbox.svelte';
	import Open from '../icons/Open.svelte';
	import Column from './Column.svelte';
	import { dragging_entry, drop, drag_over, drag_start } from './dnd';

	export let open: (file_path: string) => void;
	export let move_file: (from_path: string, to_path: string) => Promise<void>;

	$: first_level_topics = $db.topics.filter((t) => t.parents.length === 0).sort(sort_topic);

	let selected_entry: (Entry & { children: Child[] }) | null = null;

	const sort_topic = (a: Topic, b: Topic) => {
		if (a.name === 'Inbox') return -1;
		if (b.name === 'Inbox') return 1;

		return byStringProperty('name')(a, b);
	};
</script>

<div class="flex gap-4 align-stretch">
	<div class="flex flex-col gap-2 border border-solid p-2 rounded-lg bg-neutral-100">
		{#each first_level_topics as topic}
			<div
				class="flex gap-1 items-center justify-between p-2 border border-solid rounded-lg border-pink-600 bg-pink-600/10 cursor-pointer"
				class:selected={topic.file_path === selected_entry?.file_path}
				on:click={() => (selected_entry = topic)}
				on:keyup
				on:dragstart={drag_start(topic)}
				on:drop={drop(topic, $dragging_entry)}
				on:dragover={drag_over(topic, $dragging_entry)}
			>
				<div class="flex items-center gap-1">
					<div class="w-5 flex items-center">
						{#if topic.name === 'Inbox'}
							<Inbox />
						{:else}
							<Folder />
						{/if}
					</div>
					{topic.name}
				</div>

				<div
					on:click={() => open(topic.file_path)}
					on:keyup
					class="w-5 flex items-center cursor-pointer"
				>
					<Open />
				</div>
			</div>
		{/each}
	</div>

	{#if selected_entry}
		{#key selected_entry}
			<Column parent_entry={selected_entry} {move_file} {open} />
		{/key}
	{/if}
</div>

<style lang="postcss">
	.selected {
		@apply bg-pink-600/50;
	}
</style>
