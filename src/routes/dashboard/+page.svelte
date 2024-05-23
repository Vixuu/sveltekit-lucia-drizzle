<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Carousel from '$lib/components/ui/carousel/index.js';

	export let data: PageData;
	$: ({ todos } = data);
	$: ({ categories } = data);

	function showModalAdd() {
		pushState('', {
			showModalAdd: true
		});
	}

	const firstUpperCase = (str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};
</script>

<nav class="mb-10 flex items-center justify-between">
	<div>
		{#if !$page.state.showModalAdd}
			<Button variant="outline" on:click={showModalAdd}>New todo</Button>
		{/if}
		{#if $page.state.showModalAdd}
			<Button variant="outline" on:click={() => pushState('', { showModalAdd: false })}
				>Close</Button
			>
		{/if}
		<!-- {#if !$page.state.showModalCat}
			<Button variant="outline" on:click={showModalCat}>New category</Button>
		{/if}
		{#if $page.state.showModalCat}
			<Button variant="outline" on:click={() => pushState('', { showModalCat: false })}
				>Close</Button
			>
		{/if} -->
	</div>
	<div class="flex flex-row gap-3">
		<Button variant="ghost"><a href="/profile">Profile</a></Button>
		<form method="POST" action="/?/logout" use:enhance>
			<Button type="submit">Logout</Button>
		</form>
	</div>
</nav>
<main class="m-auto flex max-w-xl space-x-10">
	<div class="m-auto flex-grow">
		{#if $page.state.showModalAdd}
			<div class="my-6 rounded-lg border p-5">
				<form method="POST" action="?/add_todo" use:enhance>
					<h2 class="mb-3 text-2xl font-bold">Add todo</h2>
					<div class="flex flex-col gap-3">
						<Input required placeholder="Title" name="title" type="text" />
						<Input placeholder="Description" name="desc" type="text" />
						{#if categories.length > 0}
							<select name="category" class="rounded-lg border bg-background p-2 text-sm">
								<option class="bg-background" selected disabled>Category</option>
								{#each categories as category}
									<option class="bg-background" value={category.id}
										>{firstUpperCase(category.name)}</option
									>
								{/each}
							</select>
						{/if}
						<Button type="submit">Add</Button>
					</div>
				</form>
			</div>
		{/if}
		<Carousel.Root>
			<Carousel.Content>
				<Carousel.Item>
					<h1
						class="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
					>
						Wszystkie
					</h1>
					{#if todos.length <= 0}
						No todos to display, add some!
					{/if}
					{#each todos as todo}
						<Card.Root class="my-3 flex flex-row items-center justify-between px-6 py-3">
							<div class="text-sm text-zinc-300">
								<Card.Title>{todo.title}</Card.Title>
								<Card.Description>{todo?.desc}</Card.Description>
							</div>
							<form action="?/delete" method="POST" use:enhance>
								<input type="hidden" hidden name="id" value={todo.id} />
								<Button type="submit" variant="outline">Delete</Button>
							</form>
						</Card.Root>
					{/each}
				</Carousel.Item>
				{#each categories as category}
					{#if todos.filter((t) => t.categoryId === category.id).length > 0}
						<Carousel.Item>
							<h1
								class="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
							>
								{firstUpperCase(category.name)}
							</h1>
							{#each todos.filter((t) => t.categoryId === category.id) as todo}
								<Card.Root class="my-5 flex flex-row items-center justify-between px-6 py-3">
									<div>
										<Card.Title>{todo.title}</Card.Title>
										<Card.Description>{todo?.desc}</Card.Description>
									</div>
									<form action="?/delete" method="POST" use:enhance>
										<input type="hidden" hidden name="id" value={todo.id} />
										<Button type="submit" variant="outline">Delete</Button>
									</form>
								</Card.Root>
							{/each}
						</Carousel.Item>
					{/if}
				{/each}
			</Carousel.Content>
			{#if todos.length > 0}
				<Carousel.Previous />
				<Carousel.Next />
			{/if}
		</Carousel.Root>
	</div>
</main>
