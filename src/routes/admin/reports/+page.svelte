<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="no-print">
	<h1>Reports</h1>
	<form method="GET" class="row">
		<label>Report type
			<select name="type">
				<option value="">Select</option>
				{#each data.types as t (t.value)}<option value={t.value} selected={t.value === data.type}>{t.label}</option>{/each}
			</select>
		</label>
		<label>From date <input type="date" name="from" value={data.from} /></label>
		<label>To date <input type="date" name="to" value={data.to} /></label>
		<button>View report</button>
		{#if data.report}<button type="button" onclick={() => window.print()}>Print</button>{/if}
	</form>
	<br />
	{#if data.error}<p class="msg error" role="alert">{data.error}</p>{/if}
</div>

{#if data.report}
	{@const r = data.report}
	<section>
		<div class="report-head">
			<h2>{r.title}</h2>
			<p>Shadow AI Tool Approval Register (SATAR)</p>
			<p><strong>{r.organization}</strong></p>
		</div>
		<div class="row" style="justify-content: space-between">
			<small>Period: {fmtDate(data.from)} to {fmtDate(data.to)}</small><small>Printed on: {r.printedOn}</small>
		</div>
		<div class="table-wrap">
			<table>
				<thead><tr>{#each r.head as h, i (i)}<th>{h}</th>{/each}</tr></thead>
				<tbody>
					{#each r.rows as row, j (j)}<tr>{#each row as c, i (i)}<td>{c}</td>{/each}</tr>{/each}
					{#if !r.rows.length}<tr><td colspan={r.head.length}>No records</td></tr>{/if}
				</tbody>
				{#if r.total}<tfoot><tr>{#each r.total as c, i (i)}<th>{c}</th>{/each}</tr></tfoot>{/if}
			</table>
		</div>
	</section>
{/if}
