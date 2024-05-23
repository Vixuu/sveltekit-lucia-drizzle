import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { todoCategoryTable, userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	const categories = await db
		.select()
		.from(todoCategoryTable)
		.where(eq(todoCategoryTable.userId, event.locals.user.id));

	return {
		user: event.locals.user,
		categories: categories.reverse()
	};
}) satisfies PageServerLoad;

export const actions = {
	change_username: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const formData = await request.formData();
		const username = formData.get('username');

		if (!username) {
			return fail(400, { message: 'No username provided' });
		}

		if (username === locals.user.name) {
			return { success: true, message: 'Username changed!' };
		}

		try {
			const existingUser = await db.select().from(userTable).where(eq(userTable.name, username));
			if (existingUser.length > 0) {
				return fail(400, { message: 'Username already exists' });
			}
		} catch (error) {
			console.log(error);
		}

		try {
			await db.update(userTable).set({ name: username }).where(eq(userTable.id, locals.user.id));
			return { success: true };
		} catch (error) {
			console.log(error);
		}
	},
	add_category: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const categoryName = data.get('categoryName');

		const newCategory = await db.insert(todoCategoryTable).values({
			name: categoryName.toString(),
			userId: locals.user.id
		});

		return { succes: true, newCategory };
	},
	delete_category: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		console.log(id);

		if (!id) fail(400, { message: 'No id provided' });

		try {
			const deleted = await db
				.delete(todoCategoryTable)
				.where(eq(todoCategoryTable.id, Number(id)));
			return { succes: true, deleted };
		} catch (error) {
			console.log(error);
		}
	}
};
