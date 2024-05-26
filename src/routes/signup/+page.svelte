<script lang="ts">
	import { enhance } from '$app/forms';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	export let form;
</script>

<div class="d-flex m-auto mt-[20vh] w-80 justify-center">
	<h1 class="mb-3 text-center text-xl">Sign up</h1>
	<form method="POST" action="?/signup" use:enhance>
		<Label for="username">Username</Label>
		<Input name="username" id="username" />
		{#if form?.errors?.username}
			<div class="text-red-700">
				<span class="block sm:inline">{form?.errors?.username[0]}</span>
			</div>
		{/if}
		<Label for="password">Password</Label>
		<Input type="password" name="password" id="password" />
		{#if form?.errors?.password}
			<div class="text-red-700">
				<span class="block sm:inline">{form?.errors?.password[0]}</span>
			</div>
		{/if}
		<Label for="password">Confirm password</Label>
		<Input type="password" name="confirm_password" id="confirm_password" />
		{#if form?.errors?.confirm_password}
			<div class="text-red-700">
				<span class="block sm:inline">{form?.errors?.confirm_password[0]}</span>
			</div>
		{/if}
		<Button class="mt-4 w-full" type="submit">Continue</Button>
		<div class="mt-2 text-center">
			<a data-sveltekit-preload-data="tap" href="/login">Already have an account? Log in. </a>
		</div>
	</form>
</div>
