<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const r = $derived(data.request);
</script>

<PageHead title="Review Request" desc="{data.employee} requests {data.tool.tol_name}" back={['/manager/requests', 'Back to department requests']} />
<Msg {form} />
<div class="review-grid">
	<div class="s-card">
		<h2 class="s-section-title" style="margin-bottom:12px">Request</h2>
		<dl class="s-dl">
			<div><dt>Employee</dt><dd>{data.employee} · {data.department}</dd></div>
			<div><dt>Tool</dt><dd>{data.tool.tol_name}</dd></div>
			<div><dt>Vendor</dt><dd>{data.tool.tol_vendor}</dd></div>
			<div><dt>Purpose</dt><dd>{r.req_purpose}</dd></div>
			<div><dt>Data class</dt><dd>{@html badge(r.req_data_class)}</dd></div>
			<div><dt>Date</dt><dd>{fmtDate(r.req_date)}</dd></div>
			<div><dt>Status</dt><dd>{@html badge(r.req_status)}</dd></div>
			{#if r.req_mgr_note}<div><dt>Manager note</dt><dd>{r.req_mgr_note}</dd></div>{/if}
		</dl>
	</div>
	{#if r.req_status === 'Pending Manager'}
		<form method="POST" class="s-card s-form" novalidate style="max-width:none">
			<h2 class="s-section-title">Your decision</h2>
			<p class="s-muted" style="font-size:14px;margin-top:-12px">Check the business need. The Reviewer checks the data risk next.</p>
			<fieldset class="s-choices">
				<legend class="s-label">Decision</legend>
				<label class="s-choice s-choice--approve"><input type="radio" name="decision" value="Approve" checked /><span class="s-choice__icon">{@html icon('check')}</span><span class="s-choice__label">Approve<small>Send to the Reviewer</small></span></label>
				<label class="s-choice s-choice--reject"><input type="radio" name="decision" value="Reject" /><span class="s-choice__icon">{@html icon('x')}</span><span class="s-choice__label">Reject<small>Close the request</small></span></label>
			</fieldset>
			<div class="s-field" data-counter>
				<label class="s-label" for="reason">Reason</label>
				<textarea class="s-textarea" id="reason" name="reason" rows="3" maxlength="500" aria-describedby="reason-hint">{form?.reason ?? ''}</textarea>
				<div class="s-field-foot"><p class="s-hint" id="reason-hint">The employee sees this note.</p><span class="s-count" aria-live="polite"></span></div>
			</div>
			<div class="s-form-actions"><button class="s-btn s-btn--primary">Save decision</button><a class="s-btn s-btn--secondary" href="/manager/requests">Cancel</a></div>
		</form>
	{:else}
		<div class="s-card s-stack">
			<h2 class="s-section-title">Decision made</h2>
			<p class="s-muted" style="font-size:14px">This request has left your queue.</p>
			<div><a class="s-btn s-btn--secondary" href="/manager/requests">{@html icon('arrow-left')}Back to requests</a></div>
		</div>
	{/if}
</div>
