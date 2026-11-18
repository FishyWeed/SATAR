<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Department Requests</h1>
{#if data.requests.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Employee</th><th>Tool</th><th>Purpose</th><th>Data class</th><th>Date</th><th></th></tr></thead>
			<tbody>
				{#each data.requests as r (r.id)}
					<tr>
						<td>{r.employee} {r.employeeLast}</td><td>{r.tool}</td><td>{r.purpose}</td><td>{r.dataClass}</td><td>{fmtDate(r.date)}</td>
						<td><a href="/manager/requests/{r.id}">Review</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No requests are waiting</p>
{/if}
