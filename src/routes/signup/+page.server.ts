// routes/signup/+page.server.ts
import { lucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { db } from '$lib/server/db';
import { z } from 'zod';

import type { Actions } from './$types';
import { userTable } from '$lib/server/db/schema';

const registerSchema = z
	.object({
		username: z
			.string({ required_error: 'Username is required' })
			.min(3, { message: 'Username must be at least 3 characters' })
			.max(31, { message: 'Username must be less than 32 characters' })
			.trim(),
		password: z
			.string({ required_error: 'Username is required' })
			.min(6, { message: 'Password must be at least 6 characters' })
			.max(32, { message: 'Password must be less than 32 characters' })
			.trim(),
		confirm_password: z
			.string({ required_error: 'confirm_password is required' })
			.min(6, { message: 'Password must be at least 6 characters' })
			.max(32, { message: 'Password must be less than 32 characters' })
			.trim()
	})
	.superRefine(({ password, confirm_password }, ctx) => {
		if (password !== confirm_password) {
			return ctx.addIssue({
				code: 'custom',
				message: 'Passwords do not match',
				path: ['confirm_password']
			});
		}
	});

export const actions: Actions = {
	signup: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username').toString();
		const password = formData.get('password').toString();
		const confirm_password = formData.get('confirm_password').toString();

		try {
			const result = registerSchema.parse({ username, password, confirm_password });
			console.log(result);
		} catch (error) {
			const errors = error.flatten().fieldErrors;
			console.log(errors);
			return {
				errors,
				data: { username }
			};
		}

		const userId = generateIdFromEntropySize(10); // 16 characters long
		const passwordHash = await Bun.password.hash(password);

		// TODO: check if username is already used
		await db.insert(userTable).values({ id: userId, name: username, password: passwordHash });

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/dashboard');
	}
};
