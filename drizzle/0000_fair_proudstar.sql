CREATE TABLE `movies` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`release_year` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text,
	`text_modifiers` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`int_modifiers` integer DEFAULT false NOT NULL
);
