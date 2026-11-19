<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge } from '#lib/ui.ts';
	import type { PageProps } from './$types';
	import TableWrap from '#lib/TableWrap.svelte';

	let { data }: PageProps = $props();
</script>

<PageHead title="Department Requests" desc="Requests from your department that wait for your decision. Oldest first." />
{#if data.requests.length}
	<TableWrap label="Department requests" md>
		<thead><tr><th scope="col">Employee</th><th scope="col">Tool</th><th scope="col">Purpose</th><th scope="col">Data class</th><th scope="col">Date</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
		<tbody>
			{#each data.requests as r (r.id)}
				<tr>
					<td data-label="Employee"><a href="/manager/requests/{r.id}">{r.employee} {r.employeeLast}</a></td>
					<td data-label="Tool">{r.tool}</td>
					<td data-label="Purpose"><span style="display:block;max-width:320px">{r.purpose}</span></td>
					<td data-label="Data class">{@html badge(r.dataClass)}</td>
					<td data-label="Date">{fmtDate(r.date)}</td>
					<td data-label="Action" class="s-actions"><a class="s-btn s-btn--primary s-btn--sm" href="/manager/requests/{r.id}">Review</a></td>
				</tr>
			{/each}
		</tbody>
	</TableWrap>
{:else}
	<Empty ic="check-circle" title="No requests are waiting" text="You are all caught up." />
{/if}
