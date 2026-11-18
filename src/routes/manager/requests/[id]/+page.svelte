<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const r = $derived(data.request);
</script>

<h1>Review Request</h1>
<Msg {form} />
<dl>
	<dt>Employee</dt><dd>{data.employee} ({data.department})</dd>
	<dt>Tool</dt><dd>{data.tool.tol_name}</dd>
	<dt>Vendor</dt><dd>{data.tool.tol_vendor}</dd>
	<dt>Purpose</dt><dd>{r.req_purpose}</dd>
	<dt>Data class</dt><dd>{r.req_data_class}</dd>
	<dt>Date</dt><dd>{fmtDate(r.req_date)}</dd>
	<dt>Status</dt><dd>{r.req_status}</dd>
	{#if r.req_mgr_note}<dt>Manager note</dt><dd>{r.req_mgr_note}</dd>{/if}
</dl>
{#if r.req_status === 'Pending Manager'}
	<form method="POST" class="stack" novalidate>
		<div class="radio">Decision
			<label><input type="radio" name="decision" value="Approve" checked /> Approve</label>
			<label><input type="radio" name="decision" value="Reject" /> Reject</label>
		</div>
		<label>Reason <textarea name="reason" maxlength="500">{form?.reason ?? ''}</textarea></label>
		<div class="row"><button>Save decision</button><a class="button" href="/manager/requests">Cancel</a></div>
	</form>
{:else}
	<p><a class="button" href="/manager/requests">Back to requests</a></p>
{/if}
