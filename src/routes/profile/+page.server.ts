import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	return {
		user: event.locals.user
	};
}) satisfies PageServerLoad;

export const actions = {
	change_username: async ({ locals, request }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		console.log(username);

		if (!locals.user) redirect(302, '/login');

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
	}
};
