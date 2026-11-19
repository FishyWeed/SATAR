<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import Stats from '#lib/Stats.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHead title="Employee Home" desc="Check a tool before you use it, or request one that is new.">
	<a class="s-btn s-btn--primary" href="/requests/new">{@html icon('plus')}New request</a>
</PageHead>
<Stats items={[
	{ label: 'Approved tools', value: data.approvedTools, icon: 'shield-check', href: '/register' },
	{ label: 'My pending requests', value: data.pending, icon: 'clock', href: '/requests' },
	{ label: 'My approved requests', value: data.approvedMine, icon: 'check-circle', href: '/requests' }
]} />
<section class="s-section">
	<div class="s-section__head">
		<h2 class="s-section-title">My recent requests</h2>
		{#if data.recent.length}<a class="s-link s-link--standalone" href="/requests">View all{@html icon('arrow-right')}</a>{/if}
	</div>
	{#if data.recent.length}
		<TableWrap label="My recent requests">
			<thead><tr><th scope="col">Tool</th><th scope="col">Date</th><th scope="col">Status</th></tr></thead>
			<tbody>
				{#each data.recent as r (r.id)}
					<tr><td data-label="Tool"><a href="/requests/{r.id}">{r.tool}</a></td><td data-label="Date">{fmtDate(r.date)}</td><td data-label="Status">{@html badge(r.status)}</td></tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="inbox" title="You have no requests yet" text="When you need an AI tool that is not in the register, request it here.">
			<a class="s-btn s-btn--primary" href="/requests/new">{@html icon('plus')}New request</a>
		</Empty>
	{/if}
</section>
