<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	export let data: PageData;
	$: ({ todos } = data);
</script>

<h1>Hello {data.user.name}</h1>
<form method="POST" action="?/logout" use:enhance>
	<Button type="submit">Logout</Button>
</form>
<div class="mt-5 border p-5">
	<form method="POST" action="?/add_todo" use:enhance>
		<Label>
			Title
			<Input name="title" type="text" />
		</Label>
		<Label>
			Description
			<Input name="desc" type="text" />
		</Label>
		<Button type="submit" class="mt-2">Add</Button>
	</form>
</div>
<div>
	{#each todos.reverse() as todo}
		<Card.Root class="my-5">
			<Card.Header>
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
