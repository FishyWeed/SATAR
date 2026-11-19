<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import { icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Check your email · SATAR</title></svelte:head>

<div class="check-mail">{@html icon('mail', 's-ic--xl')}</div>
<div>
	<h1>Check your email</h1>
	<p class="s-sub" style="margin-top:12px">SATAR sent a confirmation link to <strong style="color:var(--text-strong)">{data.email || 'your email address'}</strong>. Open the email and click the link to finish your account.</p>
	<p class="s-sub">The email can take a minute. Look in the spam folder too.</p>
</div>
<Msg {form} />
<form method="POST" action="?/resend" class="s-btn-row">
	<button class="s-btn s-btn--secondary">{@html icon('refresh')}Resend email</button>
	<a class="s-btn s-btn--tertiary" href="/login">{@html icon('arrow-left')}Back to sign in</a>
</form>
