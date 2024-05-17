import { db } from '$lib/server/db';
import { movies } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { lucia } from '$lib/server/auth';

export const load = (async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	const data = await db.select().from(movies);

	return {
		movies: data,
		user: event.locals.user
	};
}) satisfies PageServerLoad;

export const actions = {
	add_movie: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title');
		const year = data.get('year');

		const newMovie = await db
			.insert(movies)
			.values({ title: title.toString(), releaseYear: Number(year) });

		return { succes: true, newMovie };
		window.location.reload();
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) fail(400, { message: 'No id provided' });

		try {
			const deleted = await db.delete(movies).where(eq(movies.id, Number(id)));
			return deleted;
		} catch (error) {
			console.log(error);
		}
		return { succes: true };
	},
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/login');
	}
};
