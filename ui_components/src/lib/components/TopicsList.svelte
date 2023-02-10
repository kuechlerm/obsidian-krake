<script lang="ts">
	import { db } from '$lib/db_store';

	import type { TopicBlockConfig, Topic as TopicType } from '$lib/types';
	import Topic from './Topic.svelte';

	export let config: TopicBlockConfig;
	export let open: (path: string) => void;

	function filter_topics(topics: TopicType[], config: TopicBlockConfig) {
		let filtered = topics;

		if (config.parent) {
			filtered = filtered.filter((task) => task.parents.some((p) => p.name === config.parent));
		}

		if (config.children) {
			filtered = filtered.filter((topic) =>
				topic.parents.some((p) => p.file_path === config.file_path),
			);
		}

		return filtered;
	}

	$: filered_topics = filter_topics($db.topics, config);
</script>

<div class="flex flex-col gap-2 mt-4">
	{#each filered_topics as topic (topic.file_path)}
		<Topic {topic} {open} />
	{:else}
		<div class="text-neutral-400">No topics found</div>
	{/each}
</div>
