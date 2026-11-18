<script lang="ts">
	import { page } from '$app/state';
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<h1>Sign In</h1>
{#if page.url.searchParams.has('link')}<p class="msg error">The link has expired. Ask for a new one.</p>{/if}
{#if page.url.searchParams.has('reset')}<p class="msg">Password saved. Please sign in</p>{/if}
<Msg {form} />
<form method="POST" class="stack" novalidate>
	<label>Email id <input name="email" type="email" autocomplete="username" value={form?.email ?? ''} /></label>
	<label>Password <input name="password" type="password" autocomplete="current-password" /></label>
	<div class="row"><button>Sign in</button></div>
	<a href="/forgot-password">Forgot password?</a>
</form>
