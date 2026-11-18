<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Reviewer Home</h1>
<div class="cards">
	<div class="card">Waiting for review<b>{data.waiting.length}</b></div>
	<div class="card">Overdue reviews<b>{data.overdue}</b></div>
	<div class="card">Banned tools<b>{data.banned}</b></div>
</div>
<h2>Requests approved by managers</h2>
{#if data.waiting.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Department</th><th>Date</th><th></th></tr></thead>
			<tbody>
				{#each data.waiting as r (r.id)}
					<tr><td>{r.tool}</td><td>{r.department}</td><td>{fmtDate(r.date)}</td><td><a href="/reviewer/queue/{r.id}">Check</a></td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="muted">No requests are waiting</p>
{/if}
