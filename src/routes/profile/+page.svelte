<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { enhance, applyAction } from '$app/forms';
	import Input from '$lib/components/ui/input/input.svelte';
	import { tick } from 'svelte';
	import { page } from '$app/stores';

	export let data: PageData;
	export let form;
	let disableInput = true;
	let ref: HTMLInputElement;
	$: data;
	$: disableInput;
	$: form;

	const toggleInput = async () => {
		disableInput = !disableInput;
		await tick();
		ref?.focus();
	};

	const handleUsernameChange = (event) => {
		const username = event.formData.get('username');
		data.user.name = username;
		return async ({ result }) => {
			if (result.type === 'success') {
				applyAction(result);
				toggleInput();
			}
		};
	};
</script>

<nav class="mb-10 flex items-center justify-between">
	<h1 class="text-2xl">Profile</h1>
	<div class="flex flex-row gap-3">
		<Button variant="ghost"><a href="/dashboard">Dashboard</a></Button>
		<form method="POST" action="/?/logout" use:enhance>
			<Button type="submit">Logout</Button>
		</form>
	</div>
</nav>
<main class="m-auto max-w-lg space-y-2 p-4">
	<h2 class="text-xl font-semibold">Change username</h2>
	<form
		class="flex gap-4"
		method="post"
		action="?/change_username"
		use:enhance={handleUsernameChange}
	>
		<input
			bind:this={ref}
			class="flex w-full rounded-md border border-input bg-background px-2 py-0 text-base text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={disableInput}
			name="username"
			value={data?.user?.name}
		/>
		{#if disableInput}
			<Button variant="outline" on:click={toggleInput} class="w-48">Edit</Button>
		{/if}
		{#if !disableInput}
			<Button type="submit" variant="outline" class="w-48">Save</Button>
		{/if}
	</form>
</main>
