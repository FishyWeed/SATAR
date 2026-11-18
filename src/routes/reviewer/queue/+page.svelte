<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Risk Review Queue</h1>
{#if data.requests.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Department</th><th>Requested by</th><th>Manager approved</th><th></th></tr></thead>
			<tbody>
				{#each data.requests as r (r.id)}
					<tr>
						<td>{r.tool}</td><td>{r.department}</td><td>{r.employee} {r.employeeLast}</td><td>{fmtDate(r.approvedAt)}</td>
						<td><a href="/reviewer/queue/{r.id}">Check</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No requests are waiting</p>
{/if}
