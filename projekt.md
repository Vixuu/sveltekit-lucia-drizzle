# Apka

### Stack

SvelteKit

DrizzleORM

LuciaAuth

Tailwind + Shadcn

# Auth

Ten plik konfiguruje system uwierzytelniania dla aplikacji za pomocą biblioteki Lucia. 

```tsx
// src/lib/server/auth/index.ts
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
```

### **dbAdapter**

To jest instancja klasy 'DrizzleSQLiteAdapter', która jest używana do połączenia Lucia z bazą danych SQLite. Jest inicjalizowana za pomocą obiektu 'db' oraz schematów 'sessionTable' i 'userTable'.

### **lucia**

To jest instancja klasy 'Lucia', która jest używana do zarządzania uwierzytelnianiem użytkowników. Jest inicjalizowana za pomocą 'dbAdapter' i obiektu konfiguracyjnego. Obiekt konfiguracyjny zawiera ustawienia dla ciasteczka sesji, funkcję do pobierania atrybutów użytkownika oraz czas wygaśnięcia sesji.

### **Deklaracje typów**

Skrypt rozszerza typy modułu 'lucia' o instancję 'Lucia' oraz interfejs 'DatabaseUserAttributes'. Pozwala to innym częściom aplikacji na korzystanie z tych typów podczas pracy z biblioteką 'lucia'.

### **DatabaseUserAttributes**

To jest interfejs, który definiuje atrybuty użytkownika w bazie danych. Obecnie zawiera tylko atrybut 'name'.

---

# Baza Danych

Ten plik konfiguruje połączenie z bazą danych SQLite za pomocą biblioteki 'drizzle-orm/bun-sqlite'.

```tsx
// lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const sqlite = new Database('sqlite.db', { create: true });
export const db = drizzle(sqlite);
```

### **db**

To jest instancja 'drizzle', która jest eksportowana z modułu. Jest inicjalizowana z instancją 'sqlite'. 'drizzle' jest używane do interakcji z bazą danych.

```tsx
// lib/server/db/schema.ts
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
		.references(() => userTable.id),
	categoryId: integer('category_id').references(() => todoCategoryTable.id)
});

export const todoCategoryTable = sqliteTable('todo_category', {
	id: integer('id').primaryKey().notNull(),
	name: text('name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id)
});

```

### **userTable**

To jest schemat dla tabeli użytkowników. Definiuje kolumny 'id', 'name', 'password', 'created_at' i 'updated_at'.

### **sessionTable**

To jest schemat dla tabeli sesji. Definiuje kolumny 'id', 'user_id', 'expires_at', 'created_at' i 'updated_at'.

---

# Login Page

### **LoginSchema**

Schemat walidacji jest tworzony przy użyciu biblioteki **zod**. Na początku definiujemy obiekt **loginSchema** za pomocą metody **z.object()**. Wewnątrz tego obiektu definiujemy pola username i password, które są wymagane do zalogowania.

```tsx
// src/routes/login/+page.server.ts

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

		// Validate input
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

		// Check if user exists
		const existingUser = await db.select().from(userTable).where(eq(userTable.name, username));
		if (!existingUser[0]) {
			return fail(400, {
				message: 'Incorrect username or password',
				data: { username }
			});
		}

		// Check if password is correct using bun provided utils
		const validPassword = await Bun.password.verify(password, existingUser[0].password);

		if (!validPassword) {
			return fail(400, {
				message: 'Incorrect username or password',
				data: { username }
			});
		}

		// Create session and set cookie
		const session = await lucia.createSession(existingUser[0].id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/dashboard');
	}
}
```

### **Użycie akcji w +page.svelte**

`use:enhance` to dyrektywa w Svelte, która pozwala na dodawanie logiki do elementów DOM bezpośrednio w szablonie komponentu.

```tsx
// /login/+page.svelte
<form action="?/login" use:enhance method="POST">
		<Label for="username">Username</Label>
		<Input name="username" id="username"  />
		<Label for="password">Password</Label>
		<Input type="password" name="password" id="password"  />
		<Button class="mt-4 w-full" type="submit">Log in</Button>
	</form>
```

---

# Dashboard Page

+page.server.ts pozwala exportowac “actions” które poźniej można wywołać używając elementu <form> w +page.svelte

```tsx
// /dashboard/+page.server.ts
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
		
		if(!data) {
			return {succes: false};
		}
		
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
	}
};
```

### **load**

To jest funkcja asynchroniczna, która jest wywoływana, gdy strona jest ładowana. Sprawdza, czy użytkownik jest zalogowany, a następnie pobiera z bazy danych listę ('todos') i ('categories') dla tego użytkownika. Zwraca obiekt zawierający te listy oraz dane użytkownika.

### **actions**

To jest obiekt zawierający metody do obsługi różnych akcji na stronie. Jest to konwencja w SvelteKit

### **add_todo**

Ta metoda jest wywoływana, gdy użytkownik dodaje nowe zadanie. Pobiera dane z formularza, sprawdza, czy użytkownik jest zalogowany, a następnie dodaje nowe zadanie do bazy danych. Zwraca obiekt zawierający informację o powodzeniu operacji oraz dane nowego zadania.

### **delete**

Ta metoda jest wywoływana, gdy użytkownik usuwa zadanie. Pobiera id zadania z formularza, sprawdza, czy id zostało podane, a następnie usuwa zadanie z bazy danych. Zwraca obiekt zawierający informację o powodzeniu operacji oraz liczbę usuniętych zadań.

---

# Register

### **Schemat walidacji**

Schemat walidacji jest zdefiniowany za pomocą biblioteki `zod`. Sprawdza, czy pola `username`, `password` i `confirm_password` są ciągami znaków, które mają co najmniej 6 i nie więcej niż 32 znaki. Dodatkowo, sprawdza, czy pola `password` i `confirm_password` są takie same. Jeśli nie, dodaje problem do kontekstu walidacji.

### **Akcja `signup`**

Jest wywoływana podczas rejestracji. Pobiera dane z formularza, przeprowadza walidację za pomocą `registerSchema` . Jeśli walidacja powiedzie się, generuje unikalne ID dla użytkownika, haszuje hasło za pomocą funkcji `Bun.password.hash` i wstawia nowego użytkownika do bazy danych.

```tsx
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
	})

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

		const userId = generateIdFromEntropySize(10);
		const passwordHash = await Bun.password.hash(password);

		await db.insert(userTable).values({ id: userId, name: username, password: passwordHash });

		// Create session and set cookie
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/dashboard');
	}
};

```

---

## Globalne Typy

Plik `app.d.ts` to plik TypeScript, który jest używany do deklarowania typów i interfejsów, które mogą być używane w całym projekcie.

W tym konkretnym przypadku, plik `app.d.ts` deklaruje globalne interfejsy w przestrzeni nazw `App`. Interfejsy te mogą być następnie używane do typowania zmiennych lub parametrów funkcji w innych plikach TypeScript.

```tsx
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		
		interface PageState {
			showModal?: boolean;
			showModalAdd?: boolean;
			showModalCat?: boolean;
			confirmDelete?: boolean;
			buttonId?: number;
		}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
```

---

## Middleware

Plik `hooks.server.ts` jest częścią aplikacji SvelteKit i służy do obsługi zdarzeń serwera. W tym konkretnym przypadku, kod w tym pliku jest używany do zarządzania sesjami użytkowników.

Funkcja wywoływana jest z każdym requestem do servera SvelteKit.

```tsx
// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

```