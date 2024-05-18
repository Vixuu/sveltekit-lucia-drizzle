import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('user', {
	id: text('id').primaryKey().notNull(),
	name: text('name').notNull(),
	password: text('password').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer('expires_at').notNull()
});

export const todoTable = sqliteTable('todo', {
	id: integer('id').primaryKey().notNull(),
	title: text('title').notNull(),
	desc: text('desc'),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id)
});
