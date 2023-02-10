import {
	create_default_project,
	create_default_task,
	create_default_topic,
	db,
} from '$lib/db_store';
import { create_test_db_adapter } from '$lib/test_db_adapter';
import { describe, it, expect, beforeEach } from 'vitest';
import { paths } from './paths';
import type { Project, Task, Topic } from './types';

describe('db_store', () => {
	let topic1: Topic, topic2: Topic, project1: Project, task1: Task, task2: Task;

	beforeEach(async () => {
		await db.init(create_test_db_adapter());

		topic1 = create_default_topic({
			name: 'Topic 1',
			file_path: `${paths.topic}/topic1.md`,
			children: [{ file_path: `${paths.project}/project1.md`, type: 1 }],
		});
		await db.add_topic(topic1);

		topic2 = create_default_topic({
			name: 'Topic 2',
			file_path: `${paths.topic}/topic2.md`,
		});
		await db.add_topic(topic2);

		project1 = create_default_project({
			name: 'Project 1',
			file_path: `${paths.project}/project1.md`,
			parents: [{ file_path: `${paths.topic}/topic1.md`, name: 'Topic 1', type: 2, parents: [] }],
			children: [{ file_path: `${paths.task}/task1.md`, type: 0 }],
		});
		await db.add_project(project1);

		task1 = create_default_task({
			name: 'Task 1',
			file_path: `${paths.task}/task1.md`,
			parents: [
				{
					file_path: `${paths.project}/project1.md`,
					name: 'Project 1',
					type: 1,
					parents: [
						{ file_path: `${paths.topic}/topic1.md`, name: 'Topic 1', type: 2, parents: [] },
					],
				},
			],
		});
		await db.add_task(task1);

		task2 = create_default_task({
			name: 'Task 2',
			file_path: `${paths.task}/Task 2.md`,
		});
		await db.add_task(task2);
	});

	it('add_parent', async () => {
		db.add_parent(topic1, { type: 2, name: topic2.name, file_path: topic2.file_path });

		// CHECKS
		expect(topic1.parents.at(0)).toStrictEqual({
			file_path: `${paths.topic}/topic2.md`,
			name: 'Topic 2',
			type: 2,
			parents: [],
		});

		expect(topic2.children.at(0)).toStrictEqual({
			file_path: `${paths.topic}/topic1.md`,
			type: 2,
		});

		expect(task1.parents.at(0)).toStrictEqual({
			file_path: `${paths.project}/project1.md`,
			name: 'Project 1',
			type: 1,
			parents: [
				{
					file_path: `${paths.topic}/topic1.md`,
					name: 'Topic 1',
					type: 2,
					parents: [
						{ file_path: `${paths.topic}/topic2.md`, name: 'Topic 2', type: 2, parents: [] },
					],
				},
			],
		});
	});

	it('chage_path', async () => {
		await db.change_path(
			`${paths.project}/project1.md`,
			`${paths.project}/project1_renamed.md`,
			'Project 1 renamed',
		);

		expect(project1.file_path).toBe(`${paths.project}/project1_renamed.md`);
		expect(project1.name).toBe('Project 1 renamed');
		expect(topic1.children.at(0)?.file_path).toBe(`${paths.project}/project1_renamed.md`);
		expect(task1.parents.at(0)?.file_path).toBe(`${paths.project}/project1_renamed.md`);
	});

	it('remove parent', async () => {
		const parent = project1.parents.at(0);
		if (!parent) throw Error('No');

		await db.remove_parent(project1, parent);

		expect(project1.parents).toStrictEqual([]);
		expect(topic1.children).toStrictEqual([]);
		expect(task1.parents.at(0)).toStrictEqual({
			file_path: `${paths.project}/project1.md`,
			name: 'Project 1',
			type: 1,
			parents: [],
		});
	});

	it('default task ist in Inbox', () => {
		expect(task2.parents.at(0)?.file_path).toBe(`${paths.topic}/Inbox.md`);
	});

	it('default task wird Project zugeordnet, entfernt Inbox', async () => {
		await db.add_parent(task2, { type: 1, name: project1.name, file_path: project1.file_path });

		expect(task2.parents).toStrictEqual([
			{
				name: project1.name,
				file_path: project1.file_path,
				type: 1,
				parents: [
					{
						name: topic1.name,
						file_path: topic1.file_path,
						type: 2,
						parents: [],
					},
				],
			},
		]);
	});
});
