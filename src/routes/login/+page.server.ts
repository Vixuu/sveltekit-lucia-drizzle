import { lucia } from '$lib/server/auth/';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { userTable } from '$lib/server/db/schema';
import { z } from 'zod';

const loginSchema = z.object({
	username: z
		.string({ required_error: 'Username is required' })
		.min(1, { message: 'Username is required' })
		.trim(),
	password: z
		.string({ required_error: 'Password is required' })
		.min(1, { message: 'Password is required' })
		.trim()
});

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username').toString();
		const password = formData.get('password').toString();

		try {
			const result = loginSchema.parse({ username, password });
			if (!result) fail(400, { message: 'Invalid input' });
		} catch (error) {
			const errors = error.flatten().fieldErrors;
			return {
				errors,
				data: { username }
			};
		}

		const existingUser = await db.select().from(userTable).where(eq(userTable.name, username));
		if (!existingUser[0]) {
			return fail(400, {
				message: 'Incorrect username or password',
				data: { username }
			});
		}

		const validPassword = await Bun.password.verify(password, existingUser[0].password);

		if (!validPassword) {
			return fail(400, {
				message: 'Incorrect username or password',
				data: { username }
			});
		}

		const session = await lucia.createSession(existingUser[0].id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/dashboard');
	}
};
