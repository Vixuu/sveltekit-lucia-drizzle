<script lang="ts">
	import { enhance } from '$app/forms';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
</script>

<h1 class="text-lg">Sign up</h1>
<br />
<form method="POST" action="?/signup" use:enhance>
	<Label for="username">Username</Label>
	<Input name="username" id="username" /><br />
	<Label for="password">Password</Label>
	<Input type="password" name="password" id="password" /><br />
	<Button type="submit">Continue</Button>
</form>
