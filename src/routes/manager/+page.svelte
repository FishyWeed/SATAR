<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import Stats from '#lib/Stats.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHead title="Manager Home" desc="Requests from your department wait for your decision." />
<Stats items={[
	{ label: 'Pending requests', value: data.pending.length, icon: 'clock', href: '/manager/requests' },
	{ label: 'Department tools', value: data.toolCount, icon: 'grid', href: '/manager/tools' },
	{ label: 'Rejected this month', value: data.rejected, icon: 'x-circle' }
]} />
<section class="s-section">
	<div class="s-section__head"><h2 class="s-section-title">Waiting for my decision</h2></div>
	{#if data.pending.length}
		<TableWrap label="Requests waiting for my decision">
			<thead><tr><th scope="col">Employee</th><th scope="col">Tool</th><th scope="col">Date</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
			<tbody>
				{#each data.pending as r (r.id)}
					<tr>
						<td data-label="Employee"><a href="/manager/requests/{r.id}">{r.employee} {r.employeeLast}</a></td><td data-label="Tool">{r.tool}</td><td data-label="Date">{fmtDate(r.date)}</td>
						<td data-label="Action" class="s-actions"><a class="s-btn s-btn--primary s-btn--sm" href="/manager/requests/{r.id}">Review</a></td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="check-circle" title="No requests are waiting" text="New requests from your department show here." />
	{/if}
</section>
