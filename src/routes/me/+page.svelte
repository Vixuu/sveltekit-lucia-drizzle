<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>User Profile</h1>
<p>{data.user.name}</p>
