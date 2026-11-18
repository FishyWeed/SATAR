<script lang="ts">
	import { fmtTime } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Audit Log</h1>
<form method="GET" class="row">
	<label>From date <input type="date" name="from" value={data.from} /></label>
	<label>To date <input type="date" name="to" value={data.to} /></label>
	<button>Filter</button>
</form>
<br />
{#if data.error}
	<p class="msg error" role="alert">{data.error}</p>
{:else if data.rows.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Date and time</th><th>User</th><th>Action</th><th>Tool</th><th>Reason</th></tr></thead>
			<tbody>
				{#each data.rows as r (r.id)}<tr><td>{fmtTime(r.time)}</td><td>{r.first} {r.last}</td><td>{r.action}</td><td>{r.tool}</td><td>{r.reason}</td></tr>{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No decisions in this period</p>
{/if}
