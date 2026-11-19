<script lang="ts">
	import Banner from '#lib/Banner.svelte';
	import Field from '#lib/Field.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="s-noprint">
	<PageHead title="Reports" desc="View a report on screen, then print it or save it as PDF." />
	{#if data.error}<Banner kind="error" title={data.error} />{/if}
	<form method="GET" class="s-filterbar" style="grid-template-columns:minmax(220px,2fr) repeat(2,minmax(150px,1fr)) auto">
		<Field id="type" label="Report type">
			<select class="s-select" id="type" name="type">
				<option value="">Select a report type</option>
				{#each data.types as t (t.value)}<option value={t.value} selected={t.value === data.type}>{t.label}</option>{/each}
			</select>
		</Field>
		<Field id="from" label="From"><input class="s-input" type="date" id="from" name="from" value={data.from} /></Field>
		<Field id="to" label="To"><input class="s-input" type="date" id="to" name="to" value={data.to} /></Field>
		<div class="s-btn-row">
			<button class="s-btn s-btn--secondary">View report</button>
			{#if data.report}<button class="s-btn s-btn--primary" type="button" onclick={() => window.print()}>{@html icon('printer')}Print</button>{/if}
		</div>
	</form>
</div>

{#if data.report}
	{@const r = data.report}
	<section class="s-section">
		<article class="s-report" aria-label="Printable report">
			<header class="s-report__head">
				<div>
					<h2>{r.title}</h2>
					<p class="s-report__sys">Shadow AI Tool Approval Register (SATAR)</p>
					<p style="margin-top:10px;font-weight:600">{r.organization}</p>
				</div>
				<dl class="s-report__meta"><dt>Period</dt><dd>{fmtDate(data.from)} to {fmtDate(data.to)}</dd><dt>Printed on</dt><dd>{r.printedOn}</dd></dl>
			</header>
			<table>
				<thead><tr>{#each r.head as h, i (i)}<th>{h}</th>{/each}</tr></thead>
				<tbody>
					{#each r.rows as row, j (j)}<tr>{#each row as c, i (i)}<td>{c}</td>{/each}</tr>{/each}
					{#if !r.rows.length}<tr><td colspan={r.head.length}>No records</td></tr>{/if}
				</tbody>
				{#if r.total}<tfoot><tr>{#each r.total as c, i (i)}<td>{c}</td>{/each}</tr></tfoot>{/if}
			</table>
			<footer class="s-report__foot"><span>SATAR · {r.organization} · Confidential</span></footer>
		</article>
	</section>
{/if}
