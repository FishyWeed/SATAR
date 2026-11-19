<script lang="ts">
	import { page } from '$app/state';
	import Banner from '#lib/Banner.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const next = $derived(page.url.searchParams.get('next'));
</script>

<svelte:head><title>Sign in · SATAR</title></svelte:head>

<div><span class="s-eyebrow">Welcome back</span><h1 style="margin-top:10px">Sign In</h1><p class="s-sub">Use the email id of your SATAR account.</p></div>
{#if page.url.searchParams.has('link')}<Banner kind="warning" title="The link has expired. Ask for a new one." />{/if}
{#if page.url.searchParams.has('reset')}<Banner kind="success" title="Password saved. Please sign in" />{/if}
<Msg {form} />
<form method="POST" class="s-form" novalidate>
	<Field id="email" label="Email id"><input class="s-input" id="email" name="email" type="email" autocomplete="username" value={form?.email ?? ''} /></Field>
	<Field id="password" label="Password">
		<div class="s-input-group" data-password><input class="s-input" id="password" name="password" type="password" autocomplete="current-password" /><button type="button" class="s-input-btn" aria-label="Show password"></button></div>
	</Field>
	<div class="s-row" style="justify-content:flex-end"><a class="s-link" href="/forgot-password">Forgot password?</a></div>
	<button class="s-btn s-btn--primary s-btn--block">Sign in</button>
</form>
<p class="s-auth__foot">New to SATAR? <a class="s-link" href="/signup{next ? `?next=${encodeURIComponent(next)}` : ''}">Create an account</a></p>
