<script lang="ts">
	import PageHead from '#lib/PageHead.svelte';
	import { icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const u = $derived(data.user!);
</script>

<PageHead title="My Profile" desc="Your details in SATAR. Ask your Administrator to change your name, role or department." />
<div class="two-col">
	<div class="s-card">
		<div class="s-row" style="margin-bottom:20px;--_gap:16px">
			<span class="s-avatar" style="width:56px;height:56px;font-size:18px" aria-hidden="true">{u.firstName[0]}{u.lastName[0]}</span>
			<div><b style="font-size:18px;color:var(--text-strong)">{u.firstName} {u.lastName}</b><p class="s-muted">{u.role ?? 'No organization yet'}</p></div>
		</div>
		<dl class="s-dl">
			<div><dt>Name</dt><dd>{u.firstName} {u.lastName}</dd></div>
			<div><dt>Email id</dt><dd>{u.email}</dd></div>
			<div><dt>Role</dt><dd>{u.role ?? '-'}</dd></div>
			<div><dt>Department</dt><dd>{data.department}</dd></div>
			<div><dt>Organization</dt><dd>{u.orgName ?? (u.role === 'Owner' ? 'SATAR platform' : '-')}</dd></div>
		</dl>
	</div>
	<form method="POST" action="?/signout" class="s-card s-stack">
		<h2 class="s-section-title">Account</h2>
		<p class="s-muted" style="font-size:14px">Change your password, or sign out of this device.</p>
		<div class="s-stack" style="--_gap:10px">
			<a class="s-btn s-btn--secondary" href="/reset-password">{@html icon('key')}Change password</a>
			<button class="s-btn s-btn--ghost">{@html icon('log-out')}Sign out</button>
		</div>
	</form>
</div>
