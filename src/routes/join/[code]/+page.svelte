<script lang="ts">
	import Banner from '#lib/Banner.svelte';
	import Msg from '#lib/Msg.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { icon } from '#lib/ui.ts';
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

<div class="join-wrap">
	<div class="s-stack" style="--_gap:20px;width:100%;max-width:480px">
		<Msg {form} />
		{#if data.invite && (data.state === 'ready' || data.state === 'signedOut')}
			<div class="s-invite">
				<span class="s-eyebrow">Invitation</span>
				<div class="s-invite__org">
					<span class="s-invite__logo" aria-hidden="true">{data.invite.org[0]}</span>
					<div><h1>Join an organization</h1><p class="s-muted">You are invited to join {data.invite.org}.</p></div>
				</div>
				<div class="s-invite__facts">
					<div class="s-invite__fact"><span>Organization</span><b>{data.invite.org}</b></div>
					<div class="s-invite__fact"><span>Role</span><b>{data.invite.role}</b></div>
					<div class="s-invite__fact"><span>Department</span><b>{data.invite.department}</b></div>
					<div class="s-invite__fact"><span>Expires</span><b>{fmtDate(data.invite.expires)}</b></div>
				</div>
				{#if data.state === 'ready'}
					<form method="POST"><button class="s-btn s-btn--primary s-btn--block">Join {data.invite.org}</button></form>
				{:else}
					<div class="s-stack" style="--_gap:10px">
						<a class="s-btn s-btn--primary" href="/login?next={next}">{@html icon('log-in')}Sign in to join</a>
						<a class="s-btn s-btn--secondary" href="/signup?next={next}">Create an account to join</a>
					</div>
				{/if}
			</div>
		{:else}
			<h1>Join an organization</h1>
			<Banner kind="warning" title={PROBLEM[data.state]} />
			<div><a class="s-btn s-btn--secondary" href="/" data-sveltekit-reload>{@html icon('home')}Home</a></div>
		{/if}
	</div>
</div>
