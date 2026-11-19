<script lang="ts">
	import { page } from '$app/state';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const next = $derived(page.url.searchParams.get('next'));
</script>

<svelte:head><title>Sign up · SATAR</title></svelte:head>

<div><span class="s-eyebrow">Get started</span><h1 style="margin-top:10px">Create your account</h1><p class="s-sub">After you confirm your email, you create your organization or join one with an invite link.</p></div>
<Msg {form} />
<form method="POST" class="s-form" novalidate>
	<div class="s-grid-2" style="gap:16px">
		<Field id="first" label="First name"><input class="s-input" id="first" name="first" maxlength="50" autocomplete="given-name" value={form?.first ?? ''} /></Field>
		<Field id="last" label="Last name"><input class="s-input" id="last" name="last" maxlength="50" autocomplete="family-name" value={form?.last ?? ''} /></Field>
	</div>
	<Field id="email" label="Email id"><input class="s-input" id="email" name="email" type="email" maxlength="60" autocomplete="email" value={form?.email ?? ''} /></Field>
	<Field id="password" label="Password" hint="8 to 64 characters">
		<div class="s-input-group" data-password><input class="s-input" id="password" name="password" type="password" autocomplete="new-password" aria-describedby="password-hint" /><button type="button" class="s-input-btn" aria-label="Show password"></button></div>
	</Field>
	<Field id="confirm" label="Confirm password">
		<div class="s-input-group" data-password><input class="s-input" id="confirm" name="confirm" type="password" autocomplete="new-password" /><button type="button" class="s-input-btn" aria-label="Show password"></button></div>
	</Field>
	<button class="s-btn s-btn--primary s-btn--block">Create account</button>
</form>
<p class="s-auth__foot">Already have an account? <a class="s-link" href="/login{next ? `?next=${encodeURIComponent(next)}` : ''}">Sign in</a></p>
