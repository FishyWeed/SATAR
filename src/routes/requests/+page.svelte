<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>My Requests</h1>
{#if data.requests.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Date</th><th>Status</th><th>Manager note</th><th>Reviewer note</th><th></th></tr></thead>
			<tbody>
				{#each data.requests as r (r.id)}
					<tr>
						<td>{r.tool}</td><td>{fmtDate(r.date)}</td><td>{r.status}</td><td>{r.mgrNote ?? '-'}</td><td>{r.revNote ?? '-'}</td>
						<td><a href="/requests/{r.id}">View</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">You have no requests yet</p>
{/if}
<a class="button" href="/requests/new">New request</a>
