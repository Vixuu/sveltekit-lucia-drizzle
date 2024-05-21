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
			console.log(result);
		} catch (error) {
			const errors = error.flatten().fieldErrors;
			console.log(errors);
			return {
				errors,
				data: { username }
			};
		}

		// if (
		// 	typeof username !== 'string' ||
		// 	username.length < 3 ||
		// 	username.length > 31 ||
		// 	!/^[a-z0-9_-]+$/.test(username)
		// ) {
		// 	return fail(400, {
		// 		message: 'Invalid username'
		// 	});
		// }
		// if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
		// 	return fail(400, {
		// 		message: 'Invalid password'
		// 	});
		// }

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
