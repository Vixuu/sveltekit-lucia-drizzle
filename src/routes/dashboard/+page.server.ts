import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { todoCategoryTable, todoTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const load = (async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	const todos = await db.select().from(todoTable).where(eq(todoTable.userId, event.locals.user.id));
	const categories = await db
		.select()
		.from(todoCategoryTable)
		.where(eq(todoCategoryTable.userId, event.locals.user.id));

	return {
		todos,
		categories,
		user: event.locals.user
	};
}) satisfies PageServerLoad;

export const actions = {
	add_todo: async ({ locals, request }) => {
		const data = await request.formData();
		const title = data.get('title');
		const desc = data.get('desc');
		const categoryId = data.get('category');

		if (!locals.user) redirect(302, '/login');
		const newTodo = await db.insert(todoTable).values({
			title: title.toString(),
			desc: desc.toString(),
			userId: locals.user.id,
			categoryId: categoryId
		});

		return { succes: true, newTodo };
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) fail(400, { message: 'No id provided' });

		try {
			const deleted = await db.delete(todoTable).where(eq(todoTable.id, Number(id)));
			return { succes: true, deleted };
		} catch (error) {
			console.log(error);
		}
	},
	add_category: async ({ locals, request }) => {
		const data = await request.formData();
		const name = data.get('name');

		if (!locals.user) redirect(302, '/login');
		const newCategory = await db.insert(todoCategoryTable).values({
			name: name.toString(),
			userId: locals.user.id
		});

		return { succes: true, newCategory };
	}
};
