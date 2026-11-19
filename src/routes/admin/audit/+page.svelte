<script lang="ts">
	import Banner from '#lib/Banner.svelte';
	import Empty from '#lib/Empty.svelte';
	import Field from '#lib/Field.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { fmtTime } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';
	import TableWrap from '#lib/TableWrap.svelte';

	let { data }: PageProps = $props();
	// The badge colour of a decision: banned, rejected or approved.
	const kind = (a: string) => (/ban/i.test(a) ? 'banned' : /reject/i.test(a) ? 'rejected' : 'approved');
</script>

<PageHead title="Audit Log" desc="Every decision on a request or a tool. Kept for compliance.">
	<a class="s-btn s-btn--secondary" href="/admin/reports?type=audit&from={data.from}&to={data.to}">{@html icon('printer')}Print as report</a>
</PageHead>
{#if data.error}<Banner kind="error" title={data.error}><p>The From date must be on or before the To date.</p></Banner>{/if}
<form method="GET" class="s-filterbar" style="grid-template-columns:repeat(2,minmax(160px,1fr)) auto">
	<Field id="from" label="From"><input class="s-input" type="date" id="from" name="from" value={data.from} /></Field>
	<Field id="to" label="To"><input class="s-input" type="date" id="to" name="to" value={data.to} /></Field>
	<div class="s-btn-row"><button class="s-btn s-btn--secondary">{@html icon('filter')}Filter</button></div>
</form>
<section class="s-section">
	{#if data.rows.length}
		<TableWrap label="Audit log" md>
			<thead><tr><th scope="col">Date and time</th><th scope="col">User</th><th scope="col">Action</th><th scope="col">Tool</th><th scope="col">Reason</th></tr></thead>
			<tbody>
				{#each data.rows as r (r.id)}
					<tr>
						<td data-label="Date and time"><span class="s-num" style="white-space:nowrap">{fmtTime(r.time)}</span></td>
						<td data-label="User">{r.first} {r.last}</td>
						<td data-label="Action">{@html badge(kind(r.action), r.action)}</td>
						<td data-label="Tool">{r.tool}</td>
						<td data-label="Reason"><span style="display:block;max-width:320px">{r.reason}</span></td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else if !data.error}
		<Empty ic="history" title="No decisions in this period" text="Try a wider date range." />
	{/if}
</section>
