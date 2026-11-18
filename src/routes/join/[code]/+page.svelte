<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const next = $derived(encodeURIComponent(`/join/${data.code}`));
	const PROBLEM: Record<string, string> = {
		notFound: 'This invite link is not valid. Ask the Administrator of your organization for a new one.',
		expired: 'This invite link has expired. Ask the Administrator of your organization for a new one.',
		used: 'This invite link has already been used. Each link works once.',
		member: 'You already belong to an organization. One account can belong to one organization only.',
		wrongEmail: 'This invite link is for another email id. Sign in with the account that it was sent to.'
	};
</script>

<h1>Join an organization</h1>
<Msg {form} />
{#if data.invite && (data.state === 'ready' || data.state === 'signedOut')}
	<div class="card invite-card">
		<p>You are invited to join</p>
		<h2>{data.invite.org}</h2>
		<p>as <strong>{data.invite.role}</strong> in the <strong>{data.invite.department}</strong> department.</p>
		<p class="muted">The invite expires on {fmtDate(data.invite.expires)}.</p>
		{#if data.state === 'ready'}
			<form method="POST"><button>Join {data.invite.org}</button></form>
		{:else}
			<div class="row">
				<a class="button" href="/signup?next={next}">Create an account to join</a>
				<a class="button" href="/login?next={next}">Sign in to join</a>
			</div>
		{/if}
	</div>
{:else}
	<p class="msg error" role="alert">{PROBLEM[data.state]}</p>
	<a class="button" href="/">Home</a>
{/if}
