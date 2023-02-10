<script lang="ts">
	import { db } from '$lib/db_store';
	import type { Task } from '$lib/types';
	import Checkbox from './subcomponents/Checkbox.svelte';
	import DateIndicator from './subcomponents/DateIndicator.svelte';
	import Open from './icons/Open.svelte';
	import Path from './subcomponents/Path.svelte';

	export let task: Task;
	export let open: (file_path: string) => void;
	export let move_file: (from_path: string, to_path: string) => Promise<void>;

	async function save() {
		$db.tasks = $db.tasks;
		await db.save();
	}

	async function toggle_done(e: Event) {
		const checked = (e.target as any).checked;

		const old_path = task.file_path;
		db.toggle_done(task, checked);
		const new_path = task.file_path;
		await move_file(old_path, new_path);
	}
</script>

<div class="relative text-sm">
	{#if task.done}
		<div class="absolute inset-0 flex items-center bg-neutral-100/70 rounded-lg px-2 py-4">
			<div class="inline w-min">
				<Checkbox checked={!!task.done} on:change={toggle_done} />
			</div>
		</div>
	{/if}

	<div
		class="flex items-center justify-between border border-solid border-teal-600 rounded-lg bg-teal-600/10 px-2 py-1"
	>
		<div class="flex-1 flex items-center gap-1">
			<Checkbox checked={!!task.done} on:change={toggle_done} />

			<div class="flex-1 flex flex-col gap-0.5">
				<div>
					{task.name}
				</div>

				<Path parents={task.parents} {open} size="s" />
			</div>
		</div>

		<div class="flex items-center gap-1">
			<DateIndicator bind:date={task.do_date} on:changed={save} />
			<DateIndicator due bind:date={task.due_date} on:changed={save} />

			<div
				on:click={() => open(task.file_path)}
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
