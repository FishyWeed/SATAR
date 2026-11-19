<script lang="ts">
	import PageHead from '#lib/PageHead.svelte';
	import Stats from '#lib/Stats.svelte';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const most = $derived(Math.max(1, ...data.risk.map((r) => r.n)));
	const reviewed = $derived(data.risk.reduce((s, r) => s + r.n, 0));
	const ICON: Record<string, string> = { Approved: 'check-circle', Pending: 'clock', Rejected: 'x-circle', Banned: 'ban' };
</script>

<PageHead title="Administrator Dashboard" desc="Your organization at a glance.">
	<a class="s-btn s-btn--secondary" href="/admin/reports">{@html icon('file')}Reports</a>
	<a class="s-btn s-btn--primary" href="/admin/users">{@html icon('plus')}Invite user</a>
</PageHead>
<Stats items={data.status.map((s) => ({ label: s.label, value: s.n, icon: ICON[s.label] ?? 'chart' }))} />
<section class="s-card" style="margin-top:32px">
	<div class="s-card__head"><h2 class="s-section-title">Tools by risk level</h2><span class="s-muted" style="font-size:13px">Reviewed tools: {reviewed}</span></div>
	{#if reviewed}
		<div class="s-chart" role="img" aria-label="Tools by risk level: {data.risk.map((r) => `${r.label} ${r.n}`).join(', ')}">
			{#each data.risk as r (r.label)}
				<div class="s-chart__row">
					<span class="s-chart__label">{@html badge(r.label)}</span>
					<span class="s-chart__track"><span class="s-chart__bar s-chart__bar--{r.label.toLowerCase()}" data-value="{(r.n / most) * 100}%"></span></span>
					<span class="s-chart__value">{r.n}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="s-empty" style="padding:24px"><p>No tools have been reviewed yet.</p></div>
	{/if}
</section>
