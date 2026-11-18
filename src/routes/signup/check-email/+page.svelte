<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>Check your email</h1>
<Msg {form} />
<p>SATAR sent a confirmation link to <strong>{data.email || 'your email address'}</strong>. Open the email and click the link to finish your account.</p>
<p class="muted">The email can take a minute. Look in the spam folder too.</p>
<form method="POST" action="?/resend" class="row">
	<button>Resend email</button>
	<a class="button" href="/login">Back to sign in</a>
</form>
