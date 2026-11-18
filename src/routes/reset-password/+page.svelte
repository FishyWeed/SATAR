<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<h1>Reset Password</h1>
<Msg {form} />
<form method="POST" class="stack" novalidate>
	<label>New password <input name="password" type="password" autocomplete="new-password" /></label>
	<label>Confirm password <input name="confirm" type="password" autocomplete="new-password" /></label>
	<p class="muted">The password must have 8 to 64 characters.</p>
	<div class="row"><button>Save password</button></div>
</form>
