<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';
	import TableWrap from '#lib/TableWrap.svelte';

	let { data }: PageProps = $props();
</script>

<PageHead title="Risk Review Queue" desc="Check the data risk of each tool. Oldest first." />
{#if data.requests.length}
	<TableWrap label="Risk review queue" md>
		<thead><tr><th scope="col">Tool</th><th scope="col">Department</th><th scope="col">Requested by</th><th scope="col">Manager approved</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
		<tbody>
			{#each data.requests as r (r.id)}
				<tr>
					<td data-label="Tool"><a href="/reviewer/queue/{r.id}">{r.tool}</a></td><td data-label="Department">{r.department}</td>
					<td data-label="Requested by">{r.employee} {r.employeeLast}</td><td data-label="Manager approved">{fmtDate(r.approvedAt)}</td>
					<td data-label="Action" class="s-actions"><a class="s-btn s-btn--primary s-btn--sm" href="/reviewer/queue/{r.id}">Check</a></td>
				</tr>
			{/each}
		</tbody>
	</TableWrap>
{:else}
	<Empty ic="shield-check" title="No requests are waiting" text="Requests approved by managers show here." />
{/if}
