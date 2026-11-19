<script lang="ts">
	import PageHead from '#lib/PageHead.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const r = $derived(data.request);
	// The state of each step: Submitted, Manager, Reviewer, Decision. A rejection with no Reviewer note came from the Manager.
	const steps = $derived.by(() => {
		const s = r.req_status, rejected = s === 'Rejected', byManager = rejected && !r.req_rev_note;
		return [
			['Submitted', fmtDate(r.req_date), 'done'],
			['Manager', s === 'Pending Manager' ? 'Waiting' : byManager ? 'Rejected' : 'Approved', s === 'Pending Manager' ? 'current' : byManager ? 'rejected' : 'done'],
			['Reviewer', s === 'Pending Reviewer' ? 'Checking the risk' : s === 'Approved' ? 'Approved' : rejected && !byManager ? 'Rejected' : 'Not reached', s === 'Pending Reviewer' ? 'current' : s === 'Approved' ? 'done' : rejected && !byManager ? 'rejected' : ''],
			['Decision', s === 'Approved' ? 'Approved' : rejected ? 'Rejected' : 'Not reached', s === 'Approved' ? 'done' : rejected ? 'rejected' : '']
		];
	});
	const SR: Record<string, string> = { done: 'done', current: 'current step', rejected: 'rejected', '': 'not reached' };
</script>

<PageHead title="Request Details" desc="{data.tool.tol_name} · submitted on {fmtDate(r.req_date)}" back={['/requests', 'Back']} />
<div class="s-card" style="margin-bottom:24px">
	<ol class="s-steps steps" aria-label="Request progress">
		{#each steps as [label, meta, st], i (label)}
			<li class="s-step" class:is-done={st === 'done'} class:is-current={st === 'current'} class:is-rejected={st === 'rejected'} aria-current={st === 'current' ? 'step' : undefined}>
				<span class="s-step__dot">{#if st === 'done'}{@html icon('check', 's-ic--xs')}{:else if st === 'rejected'}{@html icon('x', 's-ic--xs')}{:else}{i + 1}{/if}</span>
				<span class="s-step__body"><span class="s-step__label">{label}<span class="s-sr">, {SR[st]}</span></span><span class="s-step__meta">{meta}</span></span>
			</li>
		{/each}
	</ol>
</div>
<div class="s-card">
	<dl class="s-dl">
		<div><dt>Tool</dt><dd><a href="/catalogue/{data.tool.tol_id}">{data.tool.tol_name}</a></dd></div>
		<div><dt>Purpose</dt><dd>{r.req_purpose}</dd></div>
		<div><dt>Data class</dt><dd>{@html badge(r.req_data_class)}</dd></div>
		<div><dt>Date</dt><dd>{fmtDate(r.req_date)}</dd></div>
		<div><dt>Status</dt><dd>{@html badge(r.req_status)}</dd></div>
		<div><dt>Manager note</dt><dd>{#if r.req_mgr_note}{r.req_mgr_note}{:else}<span class="s-muted">None yet</span>{/if}</dd></div>
		<div><dt>Reviewer note</dt><dd>{#if r.req_rev_note}{r.req_rev_note}{:else}<span class="s-muted">None yet</span>{/if}</dd></div>
	</dl>
</div>
