<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import Stats from '#lib/Stats.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHead title="Reviewer Home" desc="Requests approved by managers wait for your risk check." />
<Stats items={[
	{ label: 'Waiting for review', value: data.waiting.length, icon: 'shield-check', href: '/reviewer/queue' },
	{ label: 'Overdue reviews', value: data.overdue, icon: 'hourglass', href: '/reviewer/overdue' },
	{ label: 'Banned tools', value: data.banned, icon: 'ban' }
]} />
<section class="s-section">
	<div class="s-section__head"><h2 class="s-section-title">Approved by managers</h2></div>
	{#if data.waiting.length}
		<TableWrap label="Requests approved by managers">
			<thead><tr><th scope="col">Tool</th><th scope="col">Department</th><th scope="col">Date</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
			<tbody>
				{#each data.waiting as r (r.id)}
					<tr>
						<td data-label="Tool"><a href="/reviewer/queue/{r.id}">{r.tool}</a></td><td data-label="Department">{r.department}</td><td data-label="Date">{fmtDate(r.date)}</td>
						<td data-label="Action" class="s-actions"><a class="s-btn s-btn--primary s-btn--sm" href="/reviewer/queue/{r.id}">Check</a></td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="shield-check" title="Nothing to review" text="Requests approved by managers show here." />
	{/if}
</section>
