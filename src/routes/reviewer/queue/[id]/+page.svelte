<script lang="ts">
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const t = $derived(data.tool), r = $derived(data.request);
	// After an error, keep what the Reviewer typed; otherwise start from the tool's current values.
	const v = $derived(form && 'error' in form ? form : { risk: t.tol_risk ?? '', dataClass: t.tol_data_class ?? r.req_data_class, conditions: t.tol_conditions ?? '', reviewDate: '', decision: 'Approve', reason: '' });
	const CHOICE: Record<string, [string, string, string]> = { Approve: ['approve', 'check', ''], Reject: ['reject', 'x', ''], Ban: ['danger', 'ban', 'No one may use it'] };

	// A ban needs a second confirmation, because no one in the organization may use the tool after it.
	function confirmBan(e: SubmitEvent) {
		const f = e.currentTarget as HTMLFormElement;
		if (new FormData(f).get('decision') !== 'Ban' || f.dataset.confirmed) return;
		e.preventDefault();
		window.SATAR.confirm({ title: `Ban ${t.tol_name}?`, body: 'No one in your organization may use this tool. You can change this later.', confirm: 'Ban tool' })
			.then((ok) => { if (ok) { f.dataset.confirmed = '1'; f.requestSubmit(); } });
	}
</script>

<PageHead title="Risk Check" desc="{t.tol_name} for {data.department}" back={['/reviewer/queue', 'Back to the queue']} />
<Msg {form} />
<div class="review-grid">
	<div class="s-stack" style="--_gap:24px">
		<div class="s-card">
			<h2 class="s-section-title" style="margin-bottom:12px">Tool</h2>
			<dl class="s-dl">
				<div><dt>Tool</dt><dd><a href="/register/{t.tol_id}">{t.tol_name}</a></dd></div>
				<div><dt>Vendor</dt><dd>{t.tol_vendor}</dd></div>
				<div><dt>Website</dt><dd><a class="s-link" href={t.tol_url} rel="noopener noreferrer" target="_blank">{t.tol_url.replace(/^https?:\/\//, '')}</a></dd></div>
				<div><dt>Tool status</dt><dd>{@html badge(t.tol_status)}{t.tol_review_date ? ` review date ${fmtDate(t.tol_review_date)}` : ''}</dd></div>
			</dl>
		</div>
		<div class="s-card">
			<h2 class="s-section-title" style="margin-bottom:12px">Request</h2>
			<dl class="s-dl">
				<div><dt>Requested by</dt><dd>{data.employee} · {data.department}</dd></div>
				<div><dt>Purpose</dt><dd>{r.req_purpose}</dd></div>
				<div><dt>Data class asked for</dt><dd>{@html badge(r.req_data_class)}</dd></div>
				<div><dt>Manager note</dt><dd>{r.req_mgr_note ?? '-'}</dd></div>
			</dl>
		</div>
	</div>
	{#if data.canDecide}
		<form method="POST" class="s-card s-form" novalidate style="max-width:none" onsubmit={confirmBan}>
			<h2 class="s-section-title">Risk check</h2>
			<div class="s-grid-2" style="gap:20px">
				<Field id="risk" label="Risk level">
					<select class="s-select" id="risk" name="risk"><option value="">Choose</option>{#each data.risks as x (x)}<option selected={x === v.risk}>{x}</option>{/each}</select>
				</Field>
				<Field id="dataClass" label="Allowed data class">
					<select class="s-select" id="dataClass" name="dataClass"><option value="">Choose</option>{#each data.dataClasses as x (x)}<option selected={x === v.dataClass}>{x}</option>{/each}</select>
				</Field>
			</div>
			<div class="s-field" data-counter>
				<label class="s-label" for="conditions">Conditions of use</label>
				<textarea class="s-textarea" id="conditions" name="conditions" rows="3" maxlength="500" placeholder="For example, sign in with your work account only." aria-describedby="conditions-hint">{v.conditions}</textarea>
				<div class="s-field-foot"><p class="s-hint" id="conditions-hint">Shown on the tool page. Short and clear.</p><span class="s-count" aria-live="polite"></span></div>
			</div>
			<Field id="reviewDate" label="Next review date" hint="Usually 6 or 12 months from today.">
				<input class="s-input" type="date" id="reviewDate" name="reviewDate" min={data.today} value={v.reviewDate} aria-describedby="reviewDate-hint" />
			</Field>
			<fieldset class="s-choices">
				<legend class="s-label">Decision</legend>
				{#each data.decisions as x (x)}
					<label class="s-choice s-choice--{CHOICE[x][0]}"><input type="radio" name="decision" value={x} checked={x === v.decision} /><span class="s-choice__icon">{@html icon(CHOICE[x][1])}</span><span class="s-choice__label">{x}{#if CHOICE[x][2]}<small>{CHOICE[x][2]}</small>{/if}</span></label>
				{/each}
			</fieldset>
			<div class="s-field" data-counter>
				<label class="s-label" for="reason">Reason</label>
				<textarea class="s-textarea" id="reason" name="reason" rows="3" maxlength="500" aria-describedby="reason-hint">{v.reason}</textarea>
				<div class="s-field-foot"><p class="s-hint" id="reason-hint">Goes into the audit log.</p><span class="s-count" aria-live="polite"></span></div>
			</div>
			<div class="s-form-actions"><button class="s-btn s-btn--primary">Save decision</button><a class="s-btn s-btn--secondary" href="/reviewer/queue">Cancel</a></div>
		</form>
	{:else}
		<div class="s-card s-stack">
			<h2 class="s-section-title">Decision made</h2>
			<dl class="s-dl">
				<div><dt>Request status</dt><dd>{@html badge(r.req_status)}</dd></div>
				<div><dt>Reviewer note</dt><dd>{r.req_rev_note ?? '-'}</dd></div>
			</dl>
			<div><a class="s-btn s-btn--secondary" href="/reviewer/queue">{@html icon('arrow-left')}Back to the queue</a></div>
		</div>
	{/if}
</div>
