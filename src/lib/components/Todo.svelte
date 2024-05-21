<script lang="ts">


	let props: props;
</script>

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
