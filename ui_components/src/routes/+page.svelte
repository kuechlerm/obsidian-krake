<script lang="ts">
	import {
		create_default_project,
		create_default_task,
		create_default_topic,
		db,
		paths,
		type Parent,
	} from '$lib';
	import DailyHeader from '$lib/components/DailyHeader.svelte';
	import EntryHeader from '$lib/components/EntryHeader.svelte';
	import ProjectsList from '$lib/components/ProjectsList.svelte';
	import Overview from '$lib/components/structure/Overview.svelte';
	import Flyout from '$lib/components/subcomponents/Flyout.svelte';
	import TasksList from '$lib/components/TasksList.svelte';
	import TopicsList from '$lib/components/TopicsList.svelte';
	import { create_test_db_adapter } from '$lib/test_db_adapter';
	import { add } from 'date-fns';
	import { onMount } from 'svelte';

	const topic1_path = `${paths.topic}/Topic 1.md`;
	const topic2_path = `${paths.topic}/Topic 2.md`;
	const project1_path = `${paths.project}/Project 1.md`;
	const task1_path = `${paths.task}/Task 1.md`;
	const task2_path = `${paths.task}/Task 2.md`;
	const task3_path = `${paths.task}/Task 3.md`;

	onMount(async () => {
		await db.init(create_test_db_adapter());

		await db.add_topic(
			create_default_topic({
				name: 'Topic 1',
				file_path: topic1_path,
				children: [{ file_path: project1_path, type: 1 }],
			}),
		);

		await db.add_topic(
			create_default_topic({
				name: 'Topic 2',
				file_path: topic2_path,
			}),
		);

		await db.add_project(
			create_default_project({
				name: 'Project 1',
				file_path: project1_path,
				parents: [{ file_path: topic1_path, name: 'Topic 1', type: 2, parents: [] }],
				children: [{ file_path: task3_path, type: 0 }],
			}),
		);

		await db.add_task(
			create_default_task({
				name: 'Task 1',
				file_path: task1_path,
				do_date: add(new Date(), { days: 2 }),
				due_date: add(new Date(), { days: -2 }),
				created: add(new Date(), { days: -22 }),
			}),
		);
		await db.add_task(
			create_default_task({
				name: 'Task 2',
				file_path: task2_path,
				done: new Date(),
				do_date: new Date(),
			}),
		);
		await db.add_task(
			create_default_task({
				name: 'Task 3',
				file_path: task3_path,
				parents: [
					{
						name: 'Project 1',
						file_path: project1_path,
						type: 1,
						parents: [{ file_path: topic1_path, name: 'Topic 1', type: 2, parents: [] }],
					},
				],
			}),
		);
	});

	function open(path: string) {
		console.log('OPEN', path);
	}

	function suggest_project() {
		return Promise.resolve<Omit<Parent, 'parents'>>({
			type: 1,
			file_path: 'project1',
			name: 'Project 1',
		});
	}

	function suggest_topic(no: string) {
		return Promise.resolve<Omit<Parent, 'parents'>>({
			type: 2,
			file_path: 'topic' + no,
			name: 'Topic ' + no,
		});
	}

	function move_file(f: string, t: string) {
		return Promise.resolve();
		// noop
	}

	function delete_file() {
		return Promise.resolve();
	}

	let show = false;
</script>

<div class="p-4 border">
	<DailyHeader {open} />
</div>

<div class="p-4 border">
	<div id="h1" class="text-xl" on:click={() => (show = !show)} on:keyup>Topic 1</div>
	<Flyout target="h1" bind:show>Hallo das ist eine längere Info</Flyout>

	<EntryHeader
		path={topic1_path}
		{open}
		{suggest_project}
		suggest_topic={() => suggest_topic('2')}
		{delete_file}
		{move_file}
	/>
</div>

<div class="p-4 border">
	<h2 class="text-xl">Alle Topics</h2>
	<TopicsList {open} config={{ type: 'topics', file_path: 'egal' }} />
</div>

<div class="p-4 border">
	<h2 class="text-xl">Inbox</h2>
	<ProjectsList
		{open}
		config={{ type: 'projects', parent: 'Inbox', file_path: 'egal' }}
		{move_file}
	/>
	<TasksList {open} config={{ type: 'tasks', parent: 'Inbox', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<div class="text-xl">Project 1</div>
	<EntryHeader
		path={project1_path}
		{open}
		{suggest_project}
		suggest_topic={() => suggest_topic('1')}
		{move_file}
		{delete_file}
	/>
</div>

<div class="p-4 border">
	<h2 class="text-xl">Alle Projects</h2>
	<ProjectsList {open} config={{ type: 'projects', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<div class="text-xl">Task 1</div>
	<EntryHeader
		path={task1_path}
		{suggest_project}
		suggest_topic={() => suggest_topic('2')}
		{open}
		{move_file}
		{delete_file}
	/>
</div>

<div class="p-4 border">
	<h2 class="text-xl">Alle Tasks</h2>
	<TasksList {open} config={{ type: 'tasks', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<h2 class="text-xl">Done Tasks</h2>
	<TasksList {open} config={{ type: 'tasks', done: 'true', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<h2 class="text-xl">Not Done Tasks</h2>
	<TasksList {open} config={{ type: 'tasks', done: 'false', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<h2 class="text-xl">Tasks "do today"</h2>
	<TasksList {open} config={{ type: 'tasks', do_date: 'today', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<h2 class="text-xl">Tasks "do &lt;today+1d"</h2>
	<TasksList
		{open}
		config={{ type: 'tasks', do_date: '<today+1d', file_path: 'egal' }}
		{move_file}
	/>
</div>

<div class="p-4 border">
	<h2 class="text-xl">Tasks "do &lt;today+5d"</h2>
	<TasksList
		{open}
		config={{ type: 'tasks', do_date: '<today+5d', file_path: 'egal' }}
		{move_file}
	/>
</div>

<div class="p-4 border">
	<h2 class="text-xl">Tasks "due today"</h2>
	<TasksList {open} config={{ type: 'tasks', due_date: 'today', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<h2 class="text-xl">Tasks "due &lt;today"</h2>
	<TasksList {open} config={{ type: 'tasks', due_date: '<today', file_path: 'egal' }} {move_file} />
</div>

<div class="p-4 border">
	<h2 class="text-xl">Tasks of "Project 1"</h2>
	<TasksList
		{open}
		config={{ type: 'tasks', file_path: project1_path, children: 'true' }}
		{move_file}
	/>
</div>

<div class="p-4 border">
	<Overview {move_file} {open} />
</div>
