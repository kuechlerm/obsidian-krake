import type { DB, DbAdapter } from './types';

export const create_test_db_adapter = (): DbAdapter => ({
	load: async () => {
		return null;
	},

	save: async (db: DB) => {
		console.log('SAVE', db);
	},

	create_inbox: async () => {
		console.log('create inbox file');
	},
});
