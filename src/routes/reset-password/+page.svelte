<script lang="ts">
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head><title>Reset password · SATAR</title></svelte:head>

<div><h1>Reset Password</h1><p class="s-sub">Choose a password you do not use anywhere else.</p></div>
<Msg {form} />
<form method="POST" class="s-form" novalidate>
	<Field id="password" label="New password" hint="8 to 64 characters">
		<div class="s-input-group" data-password><input class="s-input" id="password" name="password" type="password" autocomplete="new-password" aria-describedby="password-hint" /><button type="button" class="s-input-btn" aria-label="Show password"></button></div>
	</Field>
	<Field id="confirm" label="Confirm password">
		<div class="s-input-group" data-password><input class="s-input" id="confirm" name="confirm" type="password" autocomplete="new-password" /><button type="button" class="s-input-btn" aria-label="Show password"></button></div>
	</Field>
	<button class="s-btn s-btn--primary s-btn--block">Save password</button>
</form>
