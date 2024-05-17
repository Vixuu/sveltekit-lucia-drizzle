// src/lib/server/auth.ts
import { Lucia, TimeSpan } from 'lucia';
import { dev } from '$app/environment';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { sessionTable, userTable } from '../db/schema';
import { db } from '../db';
const dbAdapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(dbAdapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			name: attributes.name
		};
	},
	sessionExpiresIn: new TimeSpan(60, 'm')
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	name: string;
}
