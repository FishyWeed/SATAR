<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Employee Home</h1>
<div class="cards">
	<div class="card">Approved tools<b>{data.approvedTools}</b></div>
	<div class="card">My pending requests<b>{data.pending}</b></div>
	<div class="card">My approved requests<b>{data.approvedMine}</b></div>
</div>
<h2>My recent requests</h2>
{#if data.recent.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Date</th><th>Status</th></tr></thead>
			<tbody>
				{#each data.recent as r (r.id)}
					<tr><td><a href="/requests/{r.id}">{r.tool}</a></td><td>{fmtDate(r.date)}</td><td>{r.status}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="muted">You have no requests yet</p>
{/if}
<a class="button" href="/requests/new">New request</a>
