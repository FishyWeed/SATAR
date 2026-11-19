<script lang="ts">
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import { icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head><title>Forgot password · SATAR</title></svelte:head>

<a class="s-link s-link--standalone s-link--back" href="/login">{@html icon('arrow-left')}Back to sign in</a>
<div><h1>Forgot Password</h1><p class="s-sub">Enter the email id of your account. SATAR sends a link to reset the password.</p></div>
<Msg {form} />
<form method="POST" class="s-form" novalidate>
	<Field id="email" label="Email id"><input class="s-input" id="email" name="email" type="email" autocomplete="email" value={form?.email ?? ''} /></Field>
	<button class="s-btn s-btn--primary s-btn--block">Send reset link</button>
</form>
