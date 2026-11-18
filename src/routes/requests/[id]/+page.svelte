<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const r = $derived(data.request);
	// How far the request has moved through the workflow (Submitted, Manager, Reviewer, Decision).
	const done = $derived(r.req_status === 'Pending Manager' ? 1 : r.req_status === 'Pending Reviewer' ? 2 : 4);
</script>

<h1>Request Details</h1>
<ol class="steps">
	{#each ['Submitted', 'Manager', 'Reviewer', 'Decision'] as s, i (s)}<li class:done={i < done}>{s}</li>{/each}
</ol>
<dl>
	<dt>Tool</dt><dd><a href="/register/{data.tool.tol_id}">{data.tool.tol_name}</a></dd>
	<dt>Purpose</dt><dd>{r.req_purpose}</dd>
	<dt>Data class</dt><dd>{r.req_data_class}</dd>
	<dt>Date</dt><dd>{fmtDate(r.req_date)}</dd>
	<dt>Status</dt><dd>{r.req_status}</dd>
	<dt>Manager note</dt><dd>{r.req_mgr_note ?? '-'}</dd>
	<dt>Reviewer note</dt><dd>{r.req_rev_note ?? '-'}</dd>
</dl>
<p><a class="button" href="/requests">Back</a></p>
