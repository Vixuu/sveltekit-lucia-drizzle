<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';

	export let data: PageData;
	$: ({ movies } = data);
</script>

<main class="m-3">
	<h1>Hello {data.user.name}</h1>
	<form method="POST" action="?/logout" use:enhance>
		<Button type="submit">Logout</Button>
	</form>
	<div class="border p-5 mt-5">
		<form method="POST" action="?/add_movie" use:enhance>
			<Label>
				Title
				<Input name="title" type="text" />
			</Label>
			<Label>
				Year
				<Input name="year" type="number" />
			</Label>
			<Button type="submit" class="mt-2">Add</Button>
		</form>
	</div>
	<div>
		{#each movies as movie}
			<Card.Root class="my-5">
				<Card.Header>
					<Card.Title>{movie.title}</Card.Title>
					<Card.Description>{movie?.releaseYear}</Card.Description>
				</Card.Header>
				<Card.CardContent>
					<form action="?/delete" method="POST" use:enhance>
						<input type="hidden" hidden name="id" value={movie.id} />
						<Button type="submit" variant="outline">Delete</Button>
					</form>
				</Card.CardContent>
			</Card.Root>
		{/each}
	</div>
</main>
