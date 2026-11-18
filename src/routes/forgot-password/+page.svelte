<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<h1>Forgot Password</h1>
<p class="muted">Enter the email id of your account. SATAR sends a link to reset the password.</p>
<Msg {form} />
<form method="POST" class="stack" novalidate>
	<label>Email id <input name="email" type="email" value={form?.email ?? ''} /></label>
	<div class="row"><button>Send reset link</button></div>
	<a href="/login">Back to sign in</a>
</form>
