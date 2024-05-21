<script lang="ts">
	import { enhance } from '$app/forms';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	export let form;
</script>

<div class="d-flex m-auto mt-[20vh] w-80 justify-center">
	<h1 class="mb-3 text-center text-xl">Log in</h1>
	<form action="?/login" use:enhance method="POST">
		<Label for="username">Username</Label>
		<Input name="username" id="username" value={form?.data.username ?? ''} />
		{#if form?.errors?.username}
			<div class="text-red-700">
				<span class="block sm:inline">{form?.errors?.username[0]}</span>
			</div>
		{/if}
		<Label for="password">Password</Label>
		<Input type="password" name="password" id="password" value={form?.message && ''} />
		{#if form?.errors?.password}
			<div class="text-red-700">
				<span class="block sm:inline">{form?.errors?.password[0]}</span>
			</div>
		{/if}
		{#if form?.message}
			<div class="text-red-700">
				<span class="block sm:inline">{form?.message}</span>
			</div>
		{/if}
		<Button class="mt-4 w-full" type="submit">Log in</Button>
		<div class="mt-2 text-center">
			<a data-sveltekit-preload-data="tap" href="/signup">Not registered? Sign up </a>
		</div>
	</form>
</div>
