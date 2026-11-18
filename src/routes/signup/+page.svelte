<script lang="ts">
	import { page } from '$app/state';
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const next = $derived(page.url.searchParams.get('next'));
</script>

<h1>Create your account</h1>
<p class="muted">After you confirm your email, you create your organization or join one with an invite link.</p>
<Msg {form} />
<form method="POST" class="stack" novalidate>
	<label>First name <input name="first" maxlength="50" autocomplete="given-name" value={form?.first ?? ''} /></label>
	<label>Last name <input name="last" maxlength="50" autocomplete="family-name" value={form?.last ?? ''} /></label>
	<label>Email id <input name="email" type="email" maxlength="60" autocomplete="email" value={form?.email ?? ''} /></label>
	<label>Password <input name="password" type="password" autocomplete="new-password" /></label>
	<label>Confirm password <input name="confirm" type="password" autocomplete="new-password" /></label>
	<p class="muted">The password must have 8 to 64 characters.</p>
	<div class="row"><button>Create account</button></div>
	<a href="/login{next ? `?next=${encodeURIComponent(next)}` : ''}">I already have an account</a>
</form>
