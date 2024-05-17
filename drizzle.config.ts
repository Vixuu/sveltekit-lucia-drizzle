import type { Config } from 'drizzle-kit';
// import { env } from '$env/static/private';

export default {
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		// url: './drizzle/0000_fair_proudstar.sql'
		url: './sqlite.db'
	}
} satisfies Config;
