<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { enhance, applyAction } from '$app/forms';
	import { tick } from 'svelte';
	import * as Table from '$lib/components/ui/table';
	import { page } from '$app/stores';
	import { pushState } from '$app/navigation';
	import Input from '$lib/components/ui/input/input.svelte';

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

	function showModalCat() {
		pushState('', {
			showModalCat: true
		});
	}

	function confirmDelete() {
		pushState('', {
			confirmDelete: false,
			buttonId: null
		});
	}

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
<main class="m-auto max-w-xl space-y-12">
	<section>
		<h2 class="text-2xl font-semibold">Change username</h2>
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
	</section>
	<section>
		<div class="flex items-center justify-between border-b p-2">
			<h2 class="pb-1 text-2xl font-semibold">Categories</h2>

			{#if !$page.state.showModalCat}
				<Button variant="secondary" class="h-8 w-28 px-3" on:click={showModalCat}
					>New category</Button
				>
			{/if}
			{#if $page.state.showModalCat}
				<Button
					variant="destructive"
					class="h-8 w-28 px-3"
					on:click={() => pushState('', { showModalCat: false })}>Close</Button
				>
			{/if}
		</div>
		{#if $page.state.showModalCat}
			<form class="border-b p-2" method="POST" action="?/add_category" use:enhance>
				<div class="flex items-center justify-between gap-3">
					<Input
						class=" border-0 p-0 text-base focus-visible:ring-0"
						placeholder="name"
						name="categoryName"
						type="text"
					/>
					<Button class="min-w-20" type="submit">Add</Button>
				</div>
			</form>
		{/if}
		<Table.Root>
			<Table.Caption>A list of available categories</Table.Caption>
			<Table.Body>
				{#each data.categories as category}
					<Table.Row>
						<Table.Cell class="text-base">{category.name}</Table.Cell>
						<Table.Cell class="text-right">
							<form action="?/delete_category" method="post" use:enhance>
								<input type="number" hidden name="id" value={category.id} />
								{#if $page.state.buttonId !== category.id}
									<Button
										class="min-w-20"
										variant="outline"
										on:click={() => pushState('', { confirmDelete: true, buttonId: category.id })}
										>Delete</Button
									>
								{/if}

								{#if $page.state.confirmDelete && $page.state.buttonId === category.id}
									<Button class="min-w-20" type="submit" variant="destructive">Confirm</Button>
								{/if}
							</form>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</section>
</main>
