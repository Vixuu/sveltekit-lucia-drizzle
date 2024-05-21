<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';

	export let data: PageData;
</script>

<nav class="mb-10 flex items-center justify-between ">
	<h1 class="text-2xl">Todo App</h1>
	<div class="flex flex-row gap-3">
		<Button variant="ghost"><a href="/dashboard">Dashboard</a></Button>
		<form method="POST" action="/?/logout" use:enhance>
			<Button type="submit">Logout</Button>
		</form>
	</div>
</nav>
<h1 class="text-center text-2xl">Profile</h1>
<p>{data.user.name}</p>
