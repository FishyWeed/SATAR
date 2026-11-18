<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Manager Home</h1>
<div class="cards">
	<div class="card">Pending requests<b>{data.pending.length}</b></div>
	<div class="card">Department tools<b>{data.toolCount}</b></div>
	<div class="card">Rejected this month<b>{data.rejected}</b></div>
</div>
<h2>Requests waiting for my decision</h2>
{#if data.pending.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Employee</th><th>Tool</th><th>Date</th><th></th></tr></thead>
			<tbody>
				{#each data.pending as r (r.id)}
					<tr><td>{r.employee} {r.employeeLast}</td><td>{r.tool}</td><td>{fmtDate(r.date)}</td><td><a href="/manager/requests/{r.id}">Review</a></td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="muted">No requests are waiting</p>
{/if}
