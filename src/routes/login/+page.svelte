<script lang="ts">
	import { enhance } from '$app/forms';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
</script>

<h1 class="text-lg">Log in</h1>
<br />
<form class="w-64" action="?/login" use:enhance method="POST">
	<Label for="username">Username</Label>
	<Input name="username" id="username" /><br />
	<Label for="password">Password</Label>
	<Input type="password" name="password" id="password" /><br />
	<Button type="submit">Continue</Button>
	<br />
	<a data-sveltekit-preload-data="tap" href="/signup"> Sign up </a>
</form>
