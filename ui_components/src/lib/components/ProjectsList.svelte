<script lang="ts">
	import { db } from '$lib/db_store';
	import { create_date_filter } from '$lib/helper';

	import type { Project as ProjectType, ProjectBlockConfig } from '$lib/types';
	import { isSameDay, parse } from 'date-fns';
	import Project from './Project.svelte';

	export let config: ProjectBlockConfig;
	export let open: (path: string) => void;
	export let move_file: (from_path: string, to_path: string) => Promise<void>;

	function filter_projects(projects: ProjectType[], config: ProjectBlockConfig) {
		let filtered = projects;

		if (config.done === 'true') {
			filtered = filtered.filter((project) => !!project.done);
		}

		if (config.done === 'false') {
			filtered = filtered.filter((project) => !project.done);
		}

		if (config.done?.startsWith('=')) {
			const done_date = parse(config.done.substring(1), 'dd.MM.yyyy', new Date());
			filtered = filtered.filter((task) => !task.done || isSameDay(task.done, done_date));
		}

		if (config.due_date) {
			const date_filter = create_date_filter(config.due_date);
			filtered = filtered.filter((project) => !!project.due_date && date_filter(project.due_date));
		}

		if (config.parent) {
			filtered = filtered.filter((project) =>
				project.parents.some((p) => p.name === config.parent),
			);
		}

		if (config.children) {
			filtered = filtered.filter((project) =>
				project.parents.some((p) => p.file_path === config.file_path),
			);
		}

		return filtered;
	}

	$: filered_projects = filter_projects($db.projects, config);
</script>

<div class="flex flex-col gap-2 mt-4">
	{#each filered_projects as project (project.file_path)}
		<Project {project} {open} {move_file} />
	{:else}
		<div class="text-neutral-400">No projects found</div>
	{/each}
</div>
