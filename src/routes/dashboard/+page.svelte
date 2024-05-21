<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: PageData;
	$: ({ todos } = data);
	$: ({ categories } = data);

	function showModal() {
		pushState('', {
			showModal: true
		});
	}
</script>

<nav class="mb-16 flex items-center justify-between">
	<h1 class="text-2xl">Hello {data.user.name}</h1>
	<div class="flex flex-row gap-3">
		<Button variant="ghost"><a href="/profile">Profile</a></Button>
		<form method="POST" action="/?/logout" use:enhance>
			<Button type="submit">Logout</Button>
		</form>
	</div>
</nav>
<main class="flex space-x-10">
	<!-- <section class="flex w-40 flex-col space-y-2">
		{#if categories.length > 0}
			<Button on:click={displayCategory}>Display all</Button>
			{#each categories as category}
				<Button on:click={displayCategory} value={category.id}>{category.name}</Button>
			{/each}
		{/if}
	</section> -->
	<div class="m-auto flex-grow">
		{#if !$page.state.showModal}
			<Button variant="outline" on:click={showModal}>New todo</Button>
		{/if}
		{#if $page.state.showModal}
			<Button variant="outline" on:click={() => history.back()}>Close</Button>
		{/if}
		{#if $page.state.showModal}
			<div class="mt-5 rounded-lg border p-5">
				<form method="POST" action="?/add_todo" use:enhance>
					<h2 class="mb-3 text-2xl font-bold">Add todo</h2>
					<div class="flex flex-col gap-3">
						<Input placeholder="Title" name="title" type="text" />
						<Input placeholder="Description" name="desc" type="text" />
						{#if categories.length > 0}
							<select name="category" class="rounded-lg border bg-transparent p-2 text-sm">
								<option class="bg-background" selected disabled>Category</option>
								{#each categories as category}
									<option class="bg-background" value={category.id}>{category.name}</option>
								{/each}
							</select>
						{/if}
						<Button type="submit">Add</Button>
					</div>
				</form>
			</div>
		{/if}
		{#each todos as todo}
			<Card.Root class="my-5">
				<Card.Header>
					<div class="text-sm text-zinc-300">
						{#each categories as category}
							{#if category.id === todo.categoryId}
								<div>Kategoria: {category.name}</div>
							{/if}
						{/each}
					</div>
					<Card.Title>{todo.title}</Card.Title>
					<Card.Description>{todo?.desc}</Card.Description>
				</Card.Header>
				<Card.CardContent>
					<form action="?/delete" method="POST" use:enhance>
						<input type="hidden" hidden name="id" value={todo.id} />
						<Button type="submit" variant="outline">Delete</Button>
					</form>
				</Card.CardContent>
			</Card.Root>
		{/each}

	</div>
</main>
