<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const t = $derived(data.tool), r = $derived(data.request);
	// After an error, keep what the Reviewer typed; otherwise start from the tool's current values.
	const v = $derived(form && 'error' in form ? form : { risk: t.tol_risk ?? '', dataClass: t.tol_data_class ?? r.req_data_class, conditions: t.tol_conditions ?? '', reviewDate: '', decision: 'Approve', reason: '' });
</script>

<h1>Risk Check</h1>
<Msg {form} />
<dl>
	<dt>Tool</dt><dd><a href="/register/{t.tol_id}">{t.tol_name}</a> ({t.tol_vendor}, <a href={t.tol_url} rel="noopener noreferrer" target="_blank">{t.tol_url}</a>)</dd>
	<dt>Requested by</dt><dd>{data.employee} ({data.department})</dd>
	<dt>Purpose</dt><dd>{r.req_purpose}</dd>
	<dt>Requested data class</dt><dd>{r.req_data_class}</dd>
	<dt>Manager note</dt><dd>{r.req_mgr_note ?? '-'}</dd>
	<dt>Tool status</dt><dd>{t.tol_status}{t.tol_review_date ? `, review date ${fmtDate(t.tol_review_date)}` : ''}</dd>
</dl>
{#if data.canDecide}
	<form method="POST" class="stack" novalidate>
		<label>Risk level
			<select name="risk"><option value="">Select</option>{#each data.risks as x (x)}<option selected={x === v.risk}>{x}</option>{/each}</select>
		</label>
		<label>Allowed data class (the most sensitive data that the tool may receive)
			<select name="dataClass"><option value="">Select</option>{#each data.dataClasses as x (x)}<option selected={x === v.dataClass}>{x}</option>{/each}</select>
		</label>
		<label>Conditions of use <textarea name="conditions" maxlength="500">{v.conditions}</textarea></label>
		<label>Next review date <input type="date" name="reviewDate" min={data.today} value={v.reviewDate} /></label>
		<div class="radio">Decision
			{#each data.decisions as x (x)}<label><input type="radio" name="decision" value={x} checked={x === v.decision} /> {x}</label>{/each}
		</div>
		<label>Reason <textarea name="reason" maxlength="500">{v.reason}</textarea></label>
		<div class="row"><button>Save decision</button><a class="button" href="/reviewer/queue">Cancel</a></div>
	</form>
{:else}
	<p class="muted">Status of the request: {r.req_status}. Reviewer note: {r.req_rev_note ?? '-'}</p>
	<p><a class="button" href="/reviewer/queue">Back to queue</a></p>
{/if}
